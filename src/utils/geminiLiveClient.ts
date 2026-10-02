/**
 * Client-Side Gemini Live API Web Audio & WebSocket Manager
 * Implements real-time bidirectional streaming, 16kHz microphone capture, 24kHz native playback,
 * Voice Activity Detection (VAD), Instantaneous Barge-In / Interruption, and Analyser integration.
 */

export interface LiveSessionConfig {
  journeyId: string;
  scenarioId: string;
  onAudioEnergy?: (energy: number) => void;
  onStateChange?: (state: 'idle' | 'connecting' | 'listening' | 'thinking' | 'speaking' | 'interrupted' | 'error') => void;
  onTranscriptChunk?: (sender: 'user' | 'tutor', text: string, isFinal: boolean) => void;
  onError?: (err: any) => void;
}

export class GeminiLiveSession {
  private config: LiveSessionConfig;
  private ws: WebSocket | null = null;
  private inputAudioCtx: AudioContext | null = null;
  private outputAudioCtx: AudioContext | null = null;
  private micStream: MediaStream | null = null;
  private scriptProcessor: ScriptProcessorNode | null = null;
  private micAnalyser: AnalyserNode | null = null;
  private outputAnalyser: AnalyserNode | null = null;
  private isConnected = false;
  private isSpeaking = false;
  private nextStartTime = 0;
  private activeSources: AudioBufferSourceNode[] = [];
  private animFrame: number | null = null;

  constructor(config: LiveSessionConfig) {
    this.config = config;
  }

  async start(): Promise<boolean> {
    try {
      this.config.onStateChange?.('connecting');

      // 1. Fetch ephemeral token from secure server endpoint
      const res = await fetch('/api/ai/live/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          journeyId: this.config.journeyId,
          scenarioId: this.config.scenarioId
        })
      });

      if (!res.ok) {
        throw new Error(`Token endpoint error: ${res.status}`);
      }

      const tokenData = await res.json();
      const { token, model, voiceName, systemInstruction } = tokenData;

      // If ephemeral token is unavailable, return false to use seamless fallback
      if (!token) {
        console.warn('Live token not available, utilizing resilient audio turn fallback');
        return false;
      }

      // 2. Initialize AudioContexts
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      this.inputAudioCtx = new AudioCtx({ sampleRate: 16000 });
      this.outputAudioCtx = new AudioCtx({ sampleRate: 24000 });

      if (this.inputAudioCtx.state === 'suspended') {
        await this.inputAudioCtx.resume();
      }
      if (this.outputAudioCtx.state === 'suspended') {
        await this.outputAudioCtx.resume();
      }

      this.micAnalyser = this.inputAudioCtx.createAnalyser();
      this.micAnalyser.fftSize = 128;
      this.outputAnalyser = this.outputAudioCtx.createAnalyser();
      this.outputAnalyser.fftSize = 128;

      // 3. Connect to Gemini Live API via WebSocket
      const wsUrl = `wss://generativelanguage.googleapis.com/ws/google.ai.generativelanguage.v1alpha.GenerativeService.BidiGenerateContent?key=${encodeURIComponent(token)}`;
      this.ws = new WebSocket(wsUrl);

      this.ws.onopen = () => {
        this.isConnected = true;
        this.config.onStateChange?.('listening');

        // Send initial setup frame
        const setupMessage = {
          setup: {
            model: `models/${model || 'gemini-3.8-live'}`,
            generationConfig: {
              responseModalities: ['AUDIO'],
              speechConfig: {
                voiceConfig: {
                  prebuiltVoiceConfig: {
                    voiceName: voiceName || 'Kore'
                  }
                }
              }
            },
            systemInstruction: {
              parts: [{ text: systemInstruction || 'You are a warm, conversational scenario character.' }]
            }
          }
        };
        this.ws?.send(JSON.stringify(setupMessage));

        // Begin microphone streaming
        this.startMicrophoneCapture();
      };

      this.ws.onmessage = async (event) => {
        try {
          let data: any;
          if (typeof event.data === 'string') {
            data = JSON.parse(event.data);
          } else if (event.data instanceof Blob) {
            const text = await event.data.text();
            data = JSON.parse(text);
          }

          if (!data) return;

          // Handle Barge-in / Interruption signal from Gemini
          if (data.serverContent?.interrupted) {
            this.handleInterruption();
            return;
          }

          // Handle incoming model audio parts
          const parts = data.serverContent?.modelTurn?.parts;
          if (parts && Array.isArray(parts)) {
            for (const part of parts) {
              if (part.inlineData?.data) {
                this.isSpeaking = true;
                this.config.onStateChange?.('speaking');
                this.playPcmChunk(part.inlineData.data);
              }
              if (part.text) {
                this.config.onTranscriptChunk?.('tutor', part.text, false);
              }
            }
          }

          if (data.serverContent?.turnComplete) {
            this.config.onTranscriptChunk?.('tutor', '', true);
          }
        } catch (e) {
          console.warn('Live API message decode note:', e);
        }
      };

      this.ws.onerror = (err) => {
        console.warn('Live WebSocket note:', err);
        this.config.onError?.(err);
      };

      this.ws.onclose = () => {
        this.isConnected = false;
        this.config.onStateChange?.('idle');
      };

      // Start energy monitoring loop
      this.startEnergyLoop();

      return true;
    } catch (error) {
      console.warn('Gemini Live API initiation note:', error);
      this.cleanup();
      return false;
    }
  }

  // Captures microphone stream at 16kHz PCM
  private async startMicrophoneCapture() {
    try {
      this.micStream = await navigator.mediaDevices.getUserMedia({
        audio: {
          sampleRate: 16000,
          channelCount: 1,
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        }
      });

      if (!this.inputAudioCtx || !this.micAnalyser) return;

      const source = this.inputAudioCtx.createMediaStreamSource(this.micStream);
      this.scriptProcessor = this.inputAudioCtx.createScriptProcessor(2048, 1, 1);

      source.connect(this.micAnalyser);
      this.micAnalyser.connect(this.scriptProcessor);

      // CRITICAL AUDIO FIX: Route scriptProcessor to a muted GainNode (0 gain) before destination
      // to ensure microphone input is NEVER passed through to device speakers/headphones.
      const silenceGain = this.inputAudioCtx.createGain();
      silenceGain.gain.value = 0;
      this.scriptProcessor.connect(silenceGain);
      silenceGain.connect(this.inputAudioCtx.destination);

      this.scriptProcessor.onaudioprocess = (e) => {
        // Zero out the output buffer to guarantee absolute silence on microphone output path
        const outputData = e.outputBuffer.getChannelData(0);
        outputData.fill(0);

        if (!this.isConnected || this.ws?.readyState !== WebSocket.OPEN) return;

        const inputData = e.inputBuffer.getChannelData(0);
        
        // Convert Float32 to Int16 PCM
        const pcm16 = new Int16Array(inputData.length);
        for (let i = 0; i < inputData.length; i++) {
          const s = Math.max(-1, Math.min(1, inputData[i]));
          pcm16[i] = s < 0 ? s * 0x8000 : s * 0x7fff;
        }

        // Convert PCM buffer to base64
        const bytes = new Uint8Array(pcm16.buffer);
        let binary = '';
        const len = bytes.byteLength;
        for (let i = 0; i < len; i++) {
          binary += String.fromCharCode(bytes[i]);
        }
        const base64Audio = btoa(binary);

        // Send realtime input chunk to Gemini
        const realtimeMsg = {
          realtimeInput: {
            mediaChunks: [
              {
                mimeType: 'audio/pcm;rate=16000',
                data: base64Audio
              }
            ]
          }
        };

        this.ws.send(JSON.stringify(realtimeMsg));
      };
    } catch (e) {
      console.warn('Microphone stream initialization note:', e);
    }
  }

  // Gapless playback of 24kHz PCM chunks
  private playPcmChunk(base64Data: string) {
    if (!this.outputAudioCtx || !this.outputAnalyser) return;

    try {
      const binaryStr = atob(base64Data);
      const len = binaryStr.length;
      const bytes = new Uint8Array(len);
      for (let i = 0; i < len; i++) {
        bytes[i] = binaryStr.charCodeAt(i);
      }

      // Convert 16-bit PCM little-endian to Float32
      const int16 = new Int16Array(bytes.buffer);
      const float32 = new Float32Array(int16.length);
      for (let i = 0; i < int16.length; i++) {
        float32[i] = int16[i] / 32768.0;
      }

      const audioBuffer = this.outputAudioCtx.createBuffer(1, float32.length, 24000);
      audioBuffer.getChannelData(0).set(float32);

      const source = this.outputAudioCtx.createBufferSource();
      source.buffer = audioBuffer;
      source.connect(this.outputAnalyser);
      this.outputAnalyser.connect(this.outputAudioCtx.destination);

      const now = this.outputAudioCtx.currentTime;
      const startTime = Math.max(now, this.nextStartTime);
      source.start(startTime);
      this.nextStartTime = startTime + audioBuffer.duration;

      this.activeSources.push(source);

      source.onended = () => {
        const idx = this.activeSources.indexOf(source);
        if (idx !== -1) this.activeSources.splice(idx, 1);
        if (this.activeSources.length === 0 && this.outputAudioCtx) {
          if (this.outputAudioCtx.currentTime >= this.nextStartTime - 0.05) {
            this.isSpeaking = false;
            this.config.onStateChange?.('listening');
          }
        }
      };
    } catch (e) {
      console.warn('PCM chunk playback note:', e);
    }
  }

  // Instantaneous Barge-In / Interruption
  handleInterruption() {
    this.activeSources.forEach((src) => {
      try {
        src.stop();
        src.disconnect();
      } catch (e) {}
    });
    this.activeSources = [];
    if (this.outputAudioCtx) {
      this.nextStartTime = this.outputAudioCtx.currentTime;
    }
    this.isSpeaking = false;
    this.config.onStateChange?.('interrupted');
    setTimeout(() => {
      this.config.onStateChange?.('listening');
    }, 400);
  }

  // High-performance energy monitoring loop
  private startEnergyLoop() {
    const dataArray = new Uint8Array(64);

    const check = () => {
      let energy = 0;
      const activeAnalyser = this.isSpeaking ? this.outputAnalyser : this.micAnalyser;

      if (activeAnalyser) {
        activeAnalyser.getByteFrequencyData(dataArray);
        let sum = 0;
        for (let i = 0; i < dataArray.length; i++) {
          sum += dataArray[i];
        }
        energy = Math.min(1, (sum / dataArray.length) / 128);
      }

      this.config.onAudioEnergy?.(energy);
      this.animFrame = requestAnimationFrame(check);
    };

    this.animFrame = requestAnimationFrame(check);
  }

  cleanup() {
    if (this.animFrame) {
      cancelAnimationFrame(this.animFrame);
      this.animFrame = null;
    }
    if (this.ws) {
      try { this.ws.close(); } catch (e) {}
      this.ws = null;
    }
    if (this.micStream) {
      this.micStream.getTracks().forEach(t => t.stop());
      this.micStream = null;
    }
    if (this.scriptProcessor) {
      this.scriptProcessor.disconnect();
      this.scriptProcessor = null;
    }
    this.activeSources.forEach((s) => {
      try { s.stop(); } catch (e) {}
    });
    this.activeSources = [];
    if (this.inputAudioCtx && this.inputAudioCtx.state !== 'closed') {
      this.inputAudioCtx.close().catch(() => {});
    }
    if (this.outputAudioCtx && this.outputAudioCtx.state !== 'closed') {
      this.outputAudioCtx.close().catch(() => {});
    }
    this.isConnected = false;
    this.isSpeaking = false;
  }
}
