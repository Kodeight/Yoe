import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import { decodeAudioPayload } from '../utils/audioHelpers';

export type MicStatus = 'idle' | 'requesting' | 'ready' | 'listening' | 'speaking' | 'denied' | 'unavailable' | 'error';

export interface AudioContextType {
  isListening: boolean;
  transcript: string;
  isSpeaking: boolean;
  isInterrupted: boolean;
  audioEnergy: number; // 0.0 to 1.0 real-time normalized audio energy
  micStatus: MicStatus;
  micPermissionDenied: boolean;
  audioError: string | null;
  notificationSoundsEnabled: boolean;
  speechFeedbackEnabled: boolean;
  playingMessageId: string | null;
  requestMicrophoneAccess: () => Promise<boolean>;
  startListening: (langCode?: string) => Promise<boolean>;
  stopListening: () => void;
  playGeminiAudio: (base64Audio: string, onEnded?: () => void) => Promise<void>;
  speakText: (text: string, langCode?: string, characterName?: string, role?: string, onEnded?: () => void) => Promise<void>;
  replayMessage: (messageId: string, text: string, audioUrl?: string, characterName?: string, role?: string, onEnded?: () => void) => Promise<void>;
  stopSpeaking: () => void;
  stopReplay: () => void;
  toggleNotificationSounds: () => void;
  toggleSpeechFeedback: () => void;
  playNotificationSound: () => void;
  playFeedbackSound: (type?: 'start' | 'stop' | 'success') => void;
  getAudioEnergy: () => number;
  resumeAudioContext: () => Promise<void>;
  clearAudioError: () => void;
  setOnSpeechEndCallback: (cb: ((finalText: string) => void) | null) => void;
}

const AudioContextState = createContext<AudioContextType | undefined>(undefined);

export const AudioProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isInterrupted, setIsInterrupted] = useState(false);
  const [audioEnergy, setAudioEnergy] = useState<number>(0);
  const [playingMessageId, setPlayingMessageId] = useState<string | null>(null);

  const [micStatus, setMicStatus] = useState<MicStatus>('idle');
  const [micPermissionDenied, setMicPermissionDenied] = useState(false);
  const [audioError, setAudioError] = useState<string | null>(null);

  // Audio preference toggles
  const [notificationSoundsEnabled, setNotificationSoundsEnabled] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('yoe_notification_sounds');
      return saved !== null ? saved === 'true' : true;
    }
    return true;
  });

  const [speechFeedbackEnabled, setSpeechFeedbackEnabled] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('yoe_speech_feedback');
      return saved !== null ? saved === 'true' : true;
    }
    return true;
  });

  const toggleNotificationSounds = () => {
    setNotificationSoundsEnabled(prev => {
      const next = !prev;
      localStorage.setItem('yoe_notification_sounds', String(next));
      return next;
    });
  };

  const toggleSpeechFeedback = () => {
    setSpeechFeedbackEnabled(prev => {
      const next = !prev;
      localStorage.setItem('yoe_speech_feedback', String(next));
      return next;
    });
  };

  // Web Audio graph refs
  const audioCtxRef = useRef<AudioContext | null>(null);
  const speakerAnalyserRef = useRef<AnalyserNode | null>(null);
  const micAnalyserRef = useRef<AnalyserNode | null>(null);
  const currentSourceRef = useRef<AudioBufferSourceNode | null>(null);
  const micStreamRef = useRef<MediaStream | null>(null);
  const micSourceRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const recognitionRef = useRef<any>(null);
  const audioEnergyRef = useRef<number>(0);
  const onSpeechEndCbRef = useRef<((finalText: string) => void) | null>(null);
  const latestTranscriptRef = useRef<string>('');

  const clearAudioError = () => {
    setAudioError(null);
    setMicPermissionDenied(false);
    setMicStatus(prev => (prev === 'denied' || prev === 'error' || prev === 'unavailable' ? 'idle' : prev));
  };

  const setOnSpeechEndCallback = useCallback((cb: ((finalText: string) => void) | null) => {
    onSpeechEndCbRef.current = cb;
  }, []);

  // Ensure AudioContext is initialized/resumed on explicit user gesture
  const getOrCreateAudioContext = useCallback(() => {
    if (typeof window === 'undefined') return null;
    if (!audioCtxRef.current) {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtx) {
        audioCtxRef.current = new AudioCtx();
      }
    }
    if (audioCtxRef.current?.state === 'suspended') {
      audioCtxRef.current.resume().catch(() => {});
    }
    if (audioCtxRef.current) {
      if (!speakerAnalyserRef.current) {
        const speakerAnalyser = audioCtxRef.current.createAnalyser();
        speakerAnalyser.fftSize = 256;
        speakerAnalyser.smoothingTimeConstant = 0.8;
        speakerAnalyserRef.current = speakerAnalyser;
      }
      if (!micAnalyserRef.current) {
        const micAnalyser = audioCtxRef.current.createAnalyser();
        micAnalyser.fftSize = 256;
        micAnalyser.smoothingTimeConstant = 0.8;
        micAnalyserRef.current = micAnalyser;
      }
    }
    return audioCtxRef.current;
  }, []);

  const resumeAudioContext = useCallback(async () => {
    const ctx = getOrCreateAudioContext();
    if (ctx && ctx.state === 'suspended') {
      try {
        await ctx.resume();
      } catch (e) {
        console.warn('AudioContext resume exception:', e);
      }
    }
  }, [getOrCreateAudioContext]);

  // Real-time audio energy analysis loop
  useEffect(() => {
    let active = true;
    const dataArray = new Uint8Array(128);

    const checkEnergy = () => {
      if (!active) return;

      const activeAnalyser = isSpeaking ? speakerAnalyserRef.current : isListening ? micAnalyserRef.current : null;

      if (activeAnalyser) {
        activeAnalyser.getByteFrequencyData(dataArray);
        let sum = 0;
        for (let i = 0; i < dataArray.length; i++) {
          sum += dataArray[i];
        }
        const average = sum / dataArray.length;
        const normalized = Math.min(1, Math.max(0, average / 128));
        audioEnergyRef.current = normalized;
        setAudioEnergy(normalized);
      } else {
        if (audioEnergyRef.current > 0.01) {
          audioEnergyRef.current *= 0.85;
          setAudioEnergy(audioEnergyRef.current);
        } else if (audioEnergyRef.current !== 0) {
          audioEnergyRef.current = 0;
          setAudioEnergy(0);
        }
      }

      animationFrameRef.current = requestAnimationFrame(checkEnergy);
    };

    animationFrameRef.current = requestAnimationFrame(checkEnergy);

    return () => {
      active = false;
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [isSpeaking, isListening]);

  // Clean-up on unmount
  useEffect(() => {
    return () => {
      if (micStreamRef.current) {
        micStreamRef.current.getTracks().forEach(t => t.stop());
      }
      if (currentSourceRef.current) {
        try { currentSourceRef.current.stop(); } catch (e) {}
      }
      if (audioCtxRef.current && audioCtxRef.current.state !== 'closed') {
        audioCtxRef.current.close().catch(() => {});
      }
    };
  }, []);

  const getAudioEnergy = useCallback(() => audioEnergyRef.current, []);

  // Web Audio synthesizer for pristine sound feedback
  const playSynthesizedTone = (frequencies: number[], duration = 0.2, type: OscillatorType = 'sine') => {
    try {
      const ctx = getOrCreateAudioContext();
      if (!ctx) return;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = type;
      osc.connect(gain);
      gain.connect(ctx.destination);

      const now = ctx.currentTime;
      if (frequencies.length === 1) {
        osc.frequency.setValueAtTime(frequencies[0], now);
      } else {
        osc.frequency.setValueAtTime(frequencies[0], now);
        osc.frequency.exponentialRampToValueAtTime(frequencies[1], now + duration * 0.7);
      }

      gain.gain.setValueAtTime(0.08, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

      osc.start(now);
      osc.stop(now + duration);
    } catch (e) {
      // Ignore
    }
  };

  const playNotificationSound = () => {
    if (!notificationSoundsEnabled) return;
    playSynthesizedTone([587.33, 880], 0.3, 'sine');
  };

  const playFeedbackSound = (type: 'start' | 'stop' | 'success' = 'start') => {
    if (!speechFeedbackEnabled) return;
    if (type === 'start') {
      playSynthesizedTone([440, 659.25], 0.18, 'sine');
    } else if (type === 'stop') {
      playSynthesizedTone([659.25, 392], 0.18, 'sine');
    } else {
      playSynthesizedTone([523.25, 783.99], 0.25, 'triangle');
    }
  };

  // Immediate Cancellation / Barge-In / Interruption
  const stopSpeaking = useCallback(() => {
    if (currentSourceRef.current) {
      try {
        currentSourceRef.current.stop();
        currentSourceRef.current.disconnect();
      } catch (e) {}
      currentSourceRef.current = null;
    }
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    setIsSpeaking(false);
    setPlayingMessageId(null);
  }, []);

  const stopReplay = useCallback(() => {
    stopSpeaking();
  }, [stopSpeaking]);

  // Play native Gemini Audio (WAV or raw PCM base64) with AnalyserNode connection
  const playGeminiAudio = useCallback(async (base64Audio: string, onEnded?: () => void): Promise<void> => {
    try {
      stopSpeaking();
      const ctx = getOrCreateAudioContext();
      if (!ctx || !speakerAnalyserRef.current) return;

      // Ensure AudioContext is running
      if (ctx.state === 'suspended') {
        await ctx.resume();
      }

      const audioBuffer = await decodeAudioPayload(ctx, base64Audio, 24000);
      const source = ctx.createBufferSource();
      source.buffer = audioBuffer;

      // Connect: AI Audio Source -> Speaker Analyser -> Destination
      source.connect(speakerAnalyserRef.current);
      speakerAnalyserRef.current.connect(ctx.destination);

      currentSourceRef.current = source;
      setIsSpeaking(true);
      setIsInterrupted(false);

      source.onended = () => {
        setIsSpeaking(false);
        setPlayingMessageId(null);
        currentSourceRef.current = null;
        if (onEnded) onEnded();
      };

      source.start(0);
    } catch (err) {
      console.warn('Native audio playback error:', err);
      setIsSpeaking(false);
      setPlayingMessageId(null);
      if (onEnded) onEnded();
    }
  }, [getOrCreateAudioContext, stopSpeaking]);

  const mapLangToLocale = (code?: string): string => {
    switch (code) {
      case 'fr': return 'fr-FR';
      case 'ar': return 'ar-SA';
      case 'es': return 'es-ES';
      case 'ru': return 'ru-RU';
      case 'it': return 'it-IT';
      case 'tr': return 'tr-TR';
      case 'pt': return 'pt-PT';
      case 'en':
      default: return 'en-US';
    }
  };

  // Initialize SpeechRecognition on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        const reco = new SpeechRecognition();
        reco.continuous = false;
        reco.interimResults = true;

        reco.onresult = (event: any) => {
          let currentTranscript = '';
          for (let i = event.resultIndex; i < event.results.length; i++) {
            currentTranscript += event.results[i][0].transcript;
          }
          setTranscript(currentTranscript);
          latestTranscriptRef.current = currentTranscript;
        };

        reco.onend = () => {
          setIsListening(false);
          // Disconnect mic audio stream
          if (micStreamRef.current) {
            micStreamRef.current.getTracks().forEach(t => t.stop());
            micStreamRef.current = null;
          }

          // AUTOMATIC TURN DETECTION: Trigger speech end callback if transcript is available
          const finalVal = latestTranscriptRef.current.trim();
          if (finalVal && onSpeechEndCbRef.current) {
            const cb = onSpeechEndCbRef.current;
            setTranscript('');
            latestTranscriptRef.current = '';
            cb(finalVal);
          }
        };

        reco.onerror = (err: any) => {
          console.warn('Speech recognition event:', err.error);
          setIsListening(false);
          if (!micStreamRef.current && (err.error === 'not-allowed' || err.error === 'service-not-allowed')) {
            setMicStatus('denied');
            setMicPermissionDenied(true);
            setAudioError('Microphone permission was denied. Please allow microphone access in your browser or device settings.');
          }
        };

        recognitionRef.current = reco;
      }
    }
  }, []);

  // Microphone stream acquisition
  const requestMicrophoneAccess = useCallback(async (): Promise<boolean> => {
    if (typeof window === 'undefined' || !navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setMicStatus('unavailable');
      setMicPermissionDenied(false);
      setAudioError('Audio recording is not supported on this browser or environment.');
      return false;
    }

    setMicStatus('requesting');
    clearAudioError();

    const ctx = getOrCreateAudioContext();
    if (ctx && ctx.state === 'suspended') {
      try {
        await ctx.resume();
      } catch (e) {
        console.warn('AudioContext resume exception:', e);
      }
    }

    try {
      let stream: MediaStream;
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          audio: {
            echoCancellation: true,
            noiseSuppression: true,
            autoGainControl: true
          }
        });
      } catch (constrainedErr: any) {
        if (constrainedErr?.name === 'OverconstrainedError' || constrainedErr?.name === 'TypeError') {
          stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        } else {
          throw constrainedErr;
        }
      }

      if (micStreamRef.current) {
        micStreamRef.current.getTracks().forEach(t => t.stop());
      }
      micStreamRef.current = stream;

      if (ctx && micAnalyserRef.current) {
        if (micSourceRef.current) {
          try { micSourceRef.current.disconnect(); } catch (e) {}
        }
        const micSource = ctx.createMediaStreamSource(stream);
        micSource.connect(micAnalyserRef.current);
        micSourceRef.current = micSource;
      }

      setMicStatus('ready');
      setMicPermissionDenied(false);
      setAudioError(null);
      return true;
    } catch (micErr: any) {
      console.warn('Microphone check failed:', micErr);
      const errName = micErr?.name || '';

      if (errName === 'NotAllowedError' || errName === 'PermissionDeniedError') {
        setMicStatus('denied');
        setMicPermissionDenied(true);
        setAudioError('Microphone permission was denied. Please allow microphone access in your browser address bar or device settings.');
      } else if (errName === 'SecurityError') {
        setMicStatus('denied');
        setMicPermissionDenied(true);
        setAudioError('Microphone access is restricted by security policy or requires a secure HTTPS connection.');
      } else if (errName === 'NotFoundError' || errName === 'DevicesNotFoundError') {
        setMicStatus('unavailable');
        setMicPermissionDenied(false);
        setAudioError('No microphone input device was found connected to your system.');
      } else {
        setMicStatus('error');
        setMicPermissionDenied(false);
        setAudioError(micErr?.message || 'Unable to access microphone device.');
      }
      return false;
    }
  }, [getOrCreateAudioContext]);

  // Start listening with instantaneous Barge-In (halts AI speech immediately)
  const startListening = useCallback(async (langCode?: string): Promise<boolean> => {
    // 1. Immediate Barge-In: If AI was speaking, halt AI speech instantly!
    if (isSpeaking) {
      stopSpeaking();
      setIsInterrupted(true);
      setTimeout(() => setIsInterrupted(false), 600);
    }

    const hasMicAccess = await requestMicrophoneAccess();
    if (!hasMicAccess) {
      return false;
    }

    setTranscript('');
    latestTranscriptRef.current = '';
    setMicStatus('listening');

    if (recognitionRef.current) {
      try {
        recognitionRef.current.lang = mapLangToLocale(langCode);
        recognitionRef.current.start();
        setIsListening(true);
        playFeedbackSound('start');
        return true;
      } catch (e: any) {
        console.warn('Recognition start exception:', e);
        setIsListening(true);
        return true;
      }
    } else {
      setIsListening(true);
      return true;
    }
  }, [isSpeaking, stopSpeaking, requestMicrophoneAccess]);

  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      try { recognitionRef.current.stop(); } catch (e) {}
    }
    if (micStreamRef.current) {
      micStreamRef.current.getTracks().forEach(t => t.stop());
      micStreamRef.current = null;
    }
    setIsListening(false);
    playFeedbackSound('stop');
  }, []);

  // Speak text using Gemini native TTS endpoint
  const speakText = useCallback(async (
    text: string,
    langCode?: string,
    characterName?: string,
    role?: string,
    onEnded?: () => void
  ): Promise<void> => {
    if (!text || !text.trim()) return;

    stopSpeaking();

    try {
      const res = await fetch('/api/ai/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, characterName, role })
      });

      if (res.ok) {
        const data = await res.json();
        if (data.audioBase64) {
          await playGeminiAudio(data.audioBase64, onEnded);
          return;
        }
      }
    } catch (e) {
      console.warn('Gemini TTS fetch note, falling back to browser synthesis:', e);
    }

    // Web Speech API fallback
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = mapLangToLocale(langCode);
      utterance.rate = 0.95;
      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => {
        setIsSpeaking(false);
        setPlayingMessageId(null);
        if (onEnded) onEnded();
      };
      utterance.onerror = () => {
        setIsSpeaking(false);
        setPlayingMessageId(null);
        if (onEnded) onEnded();
      };
      window.speechSynthesis.speak(utterance);
    } else {
      if (onEnded) onEnded();
    }
  }, [playGeminiAudio, stopSpeaking]);

  // Centralized Replay System for all Yoe messages across the app
  const replayMessage = useCallback(async (
    messageId: string,
    text: string,
    audioUrl?: string,
    characterName?: string,
    role?: string,
    onEnded?: () => void
  ): Promise<void> => {
    if (playingMessageId === messageId && isSpeaking) {
      stopSpeaking();
      return;
    }

    stopSpeaking();
    setPlayingMessageId(messageId);

    const onComplete = () => {
      setPlayingMessageId((curr) => (curr === messageId ? null : curr));
      if (onEnded) onEnded();
    };

    if (audioUrl && audioUrl.length > 50) {
      await playGeminiAudio(audioUrl, onComplete);
      return;
    }

    await speakText(text, undefined, characterName, role, onComplete);
  }, [playingMessageId, isSpeaking, stopSpeaking, playGeminiAudio, speakText]);

  return (
    <AudioContextState.Provider
      value={{
        isListening,
        transcript,
        isSpeaking,
        isInterrupted,
        audioEnergy,
        micStatus,
        micPermissionDenied,
        audioError,
        notificationSoundsEnabled,
        speechFeedbackEnabled,
        playingMessageId,
        requestMicrophoneAccess,
        startListening,
        stopListening,
        playGeminiAudio,
        speakText,
        replayMessage,
        stopSpeaking,
        stopReplay,
        toggleNotificationSounds,
        toggleSpeechFeedback,
        playNotificationSound,
        playFeedbackSound,
        getAudioEnergy,
        resumeAudioContext,
        clearAudioError,
        setOnSpeechEndCallback
      }}
    >
      {children}
    </AudioContextState.Provider>
  );
};

export const useAudio = () => {
  const context = useContext(AudioContextState);
  if (!context) throw new Error('useAudio must be used within an AudioProvider');
  return context;
};
