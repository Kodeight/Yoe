import { GoogleGenAI, Modality, LiveServerMessage } from '@google/genai';

/**
 * Client-Side Gemini Live API Web Audio & Session Manager
 * Uses ephemeral token from /api/ai/live/token to establish real live bidirectional voice session.
 * Features deterministic lifecycle, robust interruption handling, and clean resource release.
 */

export interface LiveSessionConfig {
  journeyId: string;
  scenarioId: string;
  onAudioEnergy?: (energy: number) => void;
  onStateChange?: (state: 'idle' | 'connecting' | 'listening' | 'thinking' | 'speaking' | 'interrupted' | 'error') => void;
  onTranscriptChunk?: (sender: 'user' | 'tutor', text: string, isFinal: boolean) => void;
  onAudioChunk?: (base64Pcm: string) => void;
  onError?: (err: any) => void;
}

export class GeminiLiveSession {
  private config: LiveSessionConfig;
  private liveSession: any = null;
  private wsBridge: WebSocket | null = null;
  private inputAudioCtx: AudioContext | null = null;
  private outputAudioCtx: AudioContext | null = null;
  private micStream: MediaStream | null = null;
  private scriptProcessor: ScriptProcessorNode | null = null;
  private micAnalyser: AnalyserNode | null = null;
  private outputAnalyser: AnalyserNode | null = null;
  private isConnected = false;
  private isSpeaking = false;
  private isStopping = false;
  private isMuted = false;
  private nextStartTime = 0;
  private activeSources: AudioBufferSourceNode[] = [];
  private animFrame: number | null = null;

  constructor(config: LiveSessionConfig) {
    this.config = config;
  }

  // Real Microphone Mute / Unmute (Part 5)
  setMuted(muted: boolean) {
    this.isMuted = muted;
    if (this.micStream) {
      this.micStream.getAudioTracks().forEach((track) => {
        track.enabled = !muted;
      });
    }
    console.log(`[YOE LIVE] microphone ${muted ? 'MUTED' : 'UNMUTED'} (track.enabled=${!muted})`);
  }

  getIsMuted(): boolean {
    return this.isMuted;
  }

  async start(): Promise<boolean> {
    try {
      this.isStopping = false;
      console.log('[YOE LIVE] requesting token and session parameters...');
      this.config.onStateChange?.('connecting');

      // 1. Fetch fresh ephemeral token from server (strictly non-cached)
      const res = await fetch('/api/ai/live/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache, no-store'
        },
        credentials: 'include',
        body: JSON.stringify({
          journeyId: this.config.journeyId,
          scenarioId: this.config.scenarioId
        })
      });

      if (!res.ok) {
        console.error('[YOE LIVE] token request failed with status:', res.status);
        throw new Error(`Live token endpoint returned status ${res.status}`);
      }

      const data = await res.json();
      const hasToken = Boolean(data.token);

      console.log('[YOE LIVE] token response received');
      console.log('[YOE LIVE] model:', data.model || 'gemini-3.8-live');
      console.log('[YOE LIVE] hasToken:', hasToken);

      if (!hasToken) {
        console.error('[YOE LIVE] token unavailable in response');
        this.config.onStateChange?.('error');
        this.config.onError?.(data.error || 'Live session token unavailable');
        return false;
      }

      if (this.isStopping) return false;

      // 2. Initialize AudioContexts on explicit user interaction
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

      console.log('[YOE LIVE] connecting to Gemini Live...');

      // 3. Connect to Gemini Live API using ephemeral token
      const ai = new GoogleGenAI({
        apiKey: data.token,
        httpOptions: { apiVersion: 'v1alpha' }
      });

      try {
        this.liveSession = await ai.live.connect({
          model: data.model || 'gemini-3.8-live',
          config: {
            responseModalities: [Modality.AUDIO],
            inputAudioTranscription: {},
            outputAudioTranscription: {},
            speechConfig: {
              voiceConfig: {
                prebuiltVoiceConfig: { voiceName: data.voiceName || 'Kore' }
              }
            }
          },
          callbacks: {
            onmessage: (msg: LiveServerMessage) => {
              if (this.isStopping) return;
              const content = msg.serverContent;
              if (!content) return;

              // 1. User Input Transcription (Interim streaming while user speaks)
              if (content.interimInputTranscription?.text) {
                const interimText = content.interimInputTranscription.text;
                this.config.onTranscriptChunk?.('user', interimText, false);
              }

              // 2. User Input Transcription (Finalized when user finishes speaking)
              if (content.inputTranscription?.text) {
                const finalText = content.inputTranscription.text;
                console.log('[YOE LIVE] user speech finalized:', finalText);
                this.config.onTranscriptChunk?.('user', finalText, true);
              }

              // 3. Tutor Output Audio & Text Parts
              let tutorText = '';
              const parts = content.modelTurn?.parts;
              if (parts && Array.isArray(parts)) {
                for (const part of parts) {
                  if (part.inlineData?.data) {
                    this.isSpeaking = true;
                    this.config.onStateChange?.('speaking');
                    this.playPcmChunk(part.inlineData.data);
                    this.config.onAudioChunk?.(part.inlineData.data);
                  }
                  if (part.text) {
                    tutorText += part.text;
                  }
                }
              }

              // 4. Tutor Output Transcription
              if (content.outputTranscription?.text) {
                if (!tutorText) {
                  tutorText = content.outputTranscription.text;
                }
              }

              if (tutorText) {
                this.config.onTranscriptChunk?.('tutor', tutorText, false);
              }

              // 5. Interruption / Barge-In
              if (content.interrupted) {
                console.log('[YOE LIVE] Gemini detected interruption');
                this.handleInterruption();
              }

              // 6. Turn Completion
              if (content.turnComplete) {
                console.log('[YOE LIVE] user turn ended / model turn complete');
                this.config.onTranscriptChunk?.('tutor', '', true);
              }
            },
            onclose: () => {
              console.log('[YOE LIVE] Gemini Live session closed');
              this.isConnected = false;
              if (!this.isStopping) {
                this.config.onStateChange?.('idle');
              }
            },
            onerror: (err: any) => {
              console.error('[YOE LIVE] Gemini Live session error:', err);
              if (!this.isStopping) {
                this.config.onStateChange?.('error');
                this.config.onError?.(err?.message || 'Live session error');
              }
            }
          }
        });

        console.log('[YOE LIVE] connected');
        this.isConnected = true;
        this.config.onStateChange?.('listening');
        await this.startMicrophoneCapture();
      } catch (directConnectErr: any) {
        console.warn('[YOE LIVE] Direct client connect note, attempting server-bridge fallback:', directConnectErr?.message || directConnectErr);
        await this.connectServerBridge();
      }

      // Start energy monitoring loop for visual bubble
      this.startEnergyLoop();
      return true;

    } catch (error: any) {
      console.error('[YOE LIVE] connection failed:', error);
      this.config.onStateChange?.('error');
      this.config.onError?.(error?.message || 'Live connection failed');
      this.cleanup();
      return false;
    }
  }

  // Fallback to server-side WebSocket bridge if direct client WebSocket is restricted
  private async connectServerBridge() {
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${protocol}//${window.location.host}/api/ai/live/socket`;
    console.log('[YOE LIVE] connecting server websocket bridge:', wsUrl);

    this.wsBridge = new WebSocket(wsUrl);

    this.wsBridge.onopen = () => {
      console.log('[YOE LIVE] connected to server websocket bridge');
      this.isConnected = true;
      this.config.onStateChange?.('listening');
      this.startMicrophoneCapture();
    };

    this.wsBridge.onmessage = async (event) => {
      if (this.isStopping) return;
      try {
        const msgData = JSON.parse(event.data);

        if (msgData.type === 'connected') {
          console.log('[YOE LIVE] Gemini Live session connected via bridge');
          this.config.onStateChange?.('listening');
          return;
        }

        if (msgData.type === 'interrupted') {
          console.log('[YOE LIVE] Gemini detected interruption');
          this.handleInterruption();
          return;
        }

        if (msgData.type === 'audio' && msgData.audio) {
          this.isSpeaking = true;
          this.config.onStateChange?.('speaking');
          this.playPcmChunk(msgData.audio);
          this.config.onAudioChunk?.(msgData.audio);
        }

        if (msgData.type === 'text' && msgData.text) {
          this.config.onTranscriptChunk?.('tutor', msgData.text, false);
        }

        if (msgData.type === 'turnComplete') {
          this.config.onTranscriptChunk?.('tutor', '', true);
        }

        if (msgData.type === 'error') {
          console.error('[YOE LIVE] bridge error:', msgData.error);
          this.config.onStateChange?.('error');
          this.config.onError?.(msgData.error);
        }
      } catch (e) {
        console.warn('[YOE LIVE] bridge message decode note:', e);
      }
    };

    this.wsBridge.onerror = (err) => {
      console.error('[YOE LIVE] bridge websocket error:', err);
      if (!this.isStopping) {
        this.config.onStateChange?.('error');
        this.config.onError?.(err);
      }
    };

    this.wsBridge.onclose = () => {
      console.log('[YOE LIVE] bridge websocket closed');
      this.isConnected = false;
      if (!this.isStopping) {
        this.config.onStateChange?.('idle');
      }
    };
  }

  // Captures microphone stream at 16kHz PCM
  private async startMicrophoneCapture() {
    try {
      console.log('[YOE LIVE] microphone ready');
      this.micStream = await navigator.mediaDevices.getUserMedia({
        audio: {
          sampleRate: 16000,
          channelCount: 1,
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        }
      });

      console.log('[YOE LIVE] listening');

      if (!this.inputAudioCtx || !this.micAnalyser) return;

      const source = this.inputAudioCtx.createMediaStreamSource(this.micStream);
      this.scriptProcessor = this.inputAudioCtx.createScriptProcessor(2048, 1, 1);

      source.connect(this.micAnalyser);
      this.micAnalyser.connect(this.scriptProcessor);

      // Muted gain node to prevent microphone loopback
      const silenceGain = this.inputAudioCtx.createGain();
      silenceGain.gain.value = 0;
      this.scriptProcessor.connect(silenceGain);
      silenceGain.connect(this.inputAudioCtx.destination);

      this.scriptProcessor.onaudioprocess = (e) => {
        const outputData = e.outputBuffer.getChannelData(0);
        outputData.fill(0);

        if (!this.isConnected || this.isStopping || this.isMuted) return;

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

        // Send to Live Session or WebSocket bridge
        if (this.liveSession && typeof this.liveSession.sendRealtimeInput === 'function') {
          this.liveSession.sendRealtimeInput({
            audio: {
              data: base64Audio,
              mimeType: 'audio/pcm;rate=16000'
            }
          });
        } else if (this.wsBridge && this.wsBridge.readyState === WebSocket.OPEN) {
          this.wsBridge.send(JSON.stringify({
            type: 'audio',
            audio: base64Audio
          }));
        }
      };
    } catch (e: any) {
      console.error('[YOE LIVE] microphone failed:', e);
      this.config.onStateChange?.('error');
      this.config.onError?.(e?.message || 'Microphone access failed');
    }
  }

  // Gapless playback of 24kHz PCM chunks
  private playPcmChunk(base64Data: string) {
    if (!this.outputAudioCtx || !this.outputAnalyser || this.isStopping) return;

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

      if (this.activeSources.length === 1) {
        console.log('[YOE LIVE] playback started');
      }

      source.onended = () => {
        const idx = this.activeSources.indexOf(source);
        if (idx !== -1) this.activeSources.splice(idx, 1);
        if (this.activeSources.length === 0 && this.outputAudioCtx && !this.isStopping) {
          if (this.outputAudioCtx.currentTime >= this.nextStartTime - 0.05) {
            console.log('[YOE LIVE] playback ended');
            this.isSpeaking = false;
            this.config.onStateChange?.('listening');
          }
        }
      };
    } catch (e) {
      console.error('[YOE LIVE] playback failed:', e);
    }
  }

  // Instantaneous Barge-In / Interruption
  handleInterruption() {
    console.log('[YOE LIVE] user turn started / interruption requested');
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

    if (this.wsBridge && this.wsBridge.readyState === WebSocket.OPEN) {
      this.wsBridge.send(JSON.stringify({ type: 'interrupt' }));
    }

    setTimeout(() => {
      if (!this.isStopping) {
        this.config.onStateChange?.('listening');
      }
    }, 200);
  }

  // High-performance energy monitoring loop
  private startEnergyLoop() {
    const dataArray = new Uint8Array(64);

    const check = () => {
      if (this.isStopping) return;
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

  // Explicit Stop Method (P0 Requirement)
  stop() {
    console.log('[YOE LIVE] Stop requested. Cleaning up all audio, mic, and session resources...');
    this.isStopping = true;
    this.cleanup();
  }

  cleanup() {
    this.isStopping = true;

    // 1. Cancel energy animation loop
    if (this.animFrame) {
      cancelAnimationFrame(this.animFrame);
      this.animFrame = null;
    }

    // 2. Stop and release microphone hardware
    if (this.micStream) {
      this.micStream.getTracks().forEach((track) => {
        try {
          track.stop();
          track.enabled = false;
        } catch (e) {}
      });
      this.micStream = null;
    }

    // 3. Disconnect audio processor and analysers
    if (this.scriptProcessor) {
      try {
        this.scriptProcessor.disconnect();
        this.scriptProcessor.onaudioprocess = null;
      } catch (e) {}
      this.scriptProcessor = null;
    }
    if (this.micAnalyser) {
      try { this.micAnalyser.disconnect(); } catch (e) {}
      this.micAnalyser = null;
    }
    if (this.outputAnalyser) {
      try { this.outputAnalyser.disconnect(); } catch (e) {}
      this.outputAnalyser = null;
    }

    // 4. Halt and disconnect all active audio output sources immediately
    this.activeSources.forEach((s) => {
      try {
        s.stop();
        s.disconnect();
      } catch (e) {}
    });
    this.activeSources = [];

    // 5. Close Live session & bridge WebSocket
    if (this.liveSession) {
      try { this.liveSession.close(); } catch (e) {}
      this.liveSession = null;
    }
    if (this.wsBridge) {
      try { this.wsBridge.close(); } catch (e) {}
      this.wsBridge = null;
    }

    // 6. Close AudioContexts cleanly
    if (this.inputAudioCtx && this.inputAudioCtx.state !== 'closed') {
      try { this.inputAudioCtx.close(); } catch (e) {}
      this.inputAudioCtx = null;
    }
    if (this.outputAudioCtx && this.outputAudioCtx.state !== 'closed') {
      try { this.outputAudioCtx.close(); } catch (e) {}
      this.outputAudioCtx = null;
    }

    // 7. Reset state to idle
    this.isConnected = false;
    this.isSpeaking = false;
    this.nextStartTime = 0;
    this.config.onAudioEnergy?.(0);
    this.config.onStateChange?.('idle');
  }
}
