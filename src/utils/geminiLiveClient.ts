/**
 * Client-Side Gemini Live API Web Audio & WebSocket Manager
 * Bridges real-time bidirectional audio streaming with server-backed Gemini Live endpoint.
 * Works seamlessly in both Safari browser and installed standalone PWA.
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
      console.log('[YOE LIVE] requesting token and session parameters...');
      this.config.onStateChange?.('connecting');

      // 1. Fetch token and session config from server
      const res = await fetch('/api/ai/live/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
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

      const tokenData = await res.json();
      const hasToken = !!tokenData.token;
      
      console.log('[YOE LIVE] token response received');
      console.log(`[YOE LIVE] model: ${tokenData.model || 'gemini-3.8-live'}`);
      console.log(`[YOE LIVE] hasToken: ${hasToken}`);
      if (hasToken) {
        console.log(`[YOE LIVE] token length: ${tokenData.token.length}`);
      }

      if (!hasToken) {
        console.error('[YOE LIVE] token unavailable in response');
        this.config.onStateChange?.('error');
        this.config.onError?.('Live session token unavailable');
        return false;
      }

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

      // 3. Connect to server-backed Gemini Live WebSocket bridge
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const wsUrl = `${protocol}//${window.location.host}/api/ai/live/socket`;
      console.log('[YOE LIVE] connecting websocket:', wsUrl);

      this.ws = new WebSocket(wsUrl);

      this.ws.onopen = () => {
        console.log('[YOE LIVE] connected to server websocket bridge');
        this.isConnected = true;
        this.config.onStateChange?.('listening');
        this.startMicrophoneCapture();
      };

      this.ws.onmessage = async (event) => {
        try {
          const data = JSON.parse(event.data);

          if (data.type === 'connected') {
            console.log('[YOE LIVE] Gemini Live session connected');
            this.config.onStateChange?.('listening');
            return;
          }

          if (data.type === 'interrupted') {
            console.log('[YOE LIVE] Gemini detected interruption');
            this.handleInterruption();
            return;
          }

          if (data.type === 'audio' && data.audio) {
            console.log('[YOE LIVE] audio chunk received, length:', data.audio.length);
            this.isSpeaking = true;
            this.config.onStateChange?.('speaking');
            this.playPcmChunk(data.audio);
          }

          if (data.type === 'text' && data.text) {
            console.log('[YOE LIVE] response received text:', data.text);
            this.config.onTranscriptChunk?.('tutor', data.text, false);
          }

          if (data.type === 'turnComplete') {
            console.log('[YOE LIVE] user turn ended / model turn complete');
            this.config.onTranscriptChunk?.('tutor', '', true);
          }

          if (data.type === 'error') {
            console.error('[YOE LIVE] connection failed:', data.error);
            this.config.onStateChange?.('error');
            this.config.onError?.(data.error);
          }
        } catch (e) {
          console.warn('[YOE LIVE] WebSocket message decode note:', e);
        }
      };

      this.ws.onerror = (err) => {
        console.error('[YOE LIVE] websocket connection error:', err);
        this.config.onStateChange?.('error');
        this.config.onError?.(err);
      };

      this.ws.onclose = () => {
        console.log('[YOE LIVE] websocket connection closed');
        this.isConnected = false;
        this.config.onStateChange?.('idle');
      };

      // Start energy monitoring loop
      this.startEnergyLoop();

      return true;
    } catch (error: any) {
      console.error('[YOE LIVE] connection failed:', error);
      this.config.onStateChange?.('error');
      this.config.onError?.(error?.message || error);
      this.cleanup();
      return false;
    }
  }

  // Captures microphone stream at 16kHz PCM
  private async startMicrophoneCapture() {
    try {
      console.log('[YOE LIVE] microphone ready, requesting userMedia...');
      this.micStream = await navigator.mediaDevices.getUserMedia({
        audio: {
          sampleRate: 16000,
          channelCount: 1,
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        }
      });

      console.log('[YOE LIVE] audio input active');

      if (!this.inputAudioCtx || !this.micAnalyser) return;

      const source = this.inputAudioCtx.createMediaStreamSource(this.micStream);
      this.scriptProcessor = this.inputAudioCtx.createScriptProcessor(2048, 1, 1);

      source.connect(this.micAnalyser);
      this.micAnalyser.connect(this.scriptProcessor);

      // Muted gain node to prevent microphone audio loopback to device speaker
      const silenceGain = this.inputAudioCtx.createGain();
      silenceGain.gain.value = 0;
      this.scriptProcessor.connect(silenceGain);
      silenceGain.connect(this.inputAudioCtx.destination);

      this.scriptProcessor.onaudioprocess = (e) => {
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

        // Send PCM audio chunk to server WebSocket bridge
        this.ws.send(JSON.stringify({
          type: 'audio',
          audio: base64Audio
        }));
      };
    } catch (e: any) {
      console.error('[YOE LIVE] microphone failed:', e);
      this.config.onStateChange?.('error');
      this.config.onError?.(e?.message || 'Microphone access failed');
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

      if (this.activeSources.length === 1) {
        console.log('[YOE LIVE] playback started');
      }

      source.onended = () => {
        const idx = this.activeSources.indexOf(source);
        if (idx !== -1) this.activeSources.splice(idx, 1);
        if (this.activeSources.length === 0 && this.outputAudioCtx) {
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

    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({ type: 'interrupt' }));
    }

    setTimeout(() => {
      this.config.onStateChange?.('listening');
    }, 300);
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
