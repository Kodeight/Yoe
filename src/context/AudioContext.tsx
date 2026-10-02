import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';

export interface AudioContextType {
  isListening: boolean;
  transcript: string;
  isSpeaking: boolean;
  isInterrupted: boolean;
  audioEnergy: number; // 0.0 to 1.0 real-time normalized audio energy
  micPermissionDenied: boolean;
  audioError: string | null;
  notificationSoundsEnabled: boolean;
  speechFeedbackEnabled: boolean;
  startListening: (langCode?: string) => Promise<boolean>;
  stopListening: () => void;
  playGeminiAudio: (base64Wav: string) => Promise<void>;
  speakText: (text: string, langCode?: string, characterName?: string, role?: string) => Promise<void>;
  stopSpeaking: () => void;
  toggleNotificationSounds: () => void;
  toggleSpeechFeedback: () => void;
  playNotificationSound: () => void;
  playFeedbackSound: (type?: 'start' | 'stop' | 'success') => void;
  getAudioEnergy: () => number;
  resumeAudioContext: () => Promise<void>;
  clearAudioError: () => void;
}

const AudioContextState = createContext<AudioContextType | undefined>(undefined);

export const AudioProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isInterrupted, setIsInterrupted] = useState(false);
  const [audioEnergy, setAudioEnergy] = useState<number>(0);

  const [micPermissionDenied, setMicPermissionDenied] = useState(false);
  const [audioError, setAudioError] = useState<string | null>(null);

  // Audio preference toggles persisted in localStorage
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

  const clearAudioError = () => {
    setAudioError(null);
    setMicPermissionDenied(false);
  };

  // Ensure AudioContext is initialized/resumed on explicit user interaction
  const getOrCreateAudioContext = useCallback((): AudioContext | null => {
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

  // Real-time audio energy analysis loop (selects speakerAnalyser or micAnalyser dynamically)
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

  // Web Audio synthesizer for pristine sound feedback without asset load latency
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
      // AudioContext may be restricted before user gesture
    }
  };

  const playNotificationSound = () => {
    if (!notificationSoundsEnabled) return;
    playSynthesizedTone([587.33, 880], 0.3, 'sine'); // D5 to A5 pleasant bell chime
  };

  const playFeedbackSound = (type: 'start' | 'stop' | 'success' = 'start') => {
    if (!speechFeedbackEnabled) return;
    if (type === 'start') {
      playSynthesizedTone([440, 659.25], 0.18, 'sine'); // Upward pleasant bleep
    } else if (type === 'stop') {
      playSynthesizedTone([659.25, 392], 0.18, 'sine'); // Downward soft tone
    } else {
      playSynthesizedTone([523.25, 783.99], 0.25, 'triangle'); // Success cheer chime
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
  }, []);

  // Play native Gemini Audio (WAV base64) with AnalyserNode connection
  const playGeminiAudio = useCallback(async (base64Wav: string): Promise<void> => {
    try {
      stopSpeaking();
      const ctx = getOrCreateAudioContext();
      if (!ctx || !speakerAnalyserRef.current) return;

      const binaryStr = atob(base64Wav);
      const len = binaryStr.length;
      const bytes = new Uint8Array(len);
      for (let i = 0; i < len; i++) {
        bytes[i] = binaryStr.charCodeAt(i);
      }

      const audioBuffer = await ctx.decodeAudioData(bytes.buffer.slice(0));
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
        currentSourceRef.current = null;
      };

      source.start(0);
    } catch (err) {
      console.warn('Native audio playback fallback:', err);
      setIsSpeaking(false);
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
        };

        reco.onend = () => {
          setIsListening(false);
          // Disconnect mic audio analyser
          if (micStreamRef.current) {
            micStreamRef.current.getTracks().forEach(t => t.stop());
            micStreamRef.current = null;
          }
        };

        reco.onerror = (err: any) => {
          console.warn('Speech recognition event:', err.error);
          setIsListening(false);
          if (err.error === 'not-allowed' || err.error === 'service-not-allowed') {
            setMicPermissionDenied(true);
            setAudioError('Microphone permission was denied. Please allow microphone access in your browser settings.');
          }
        };

        recognitionRef.current = reco;
      }
    }
  }, []);

  // Start listening with instantaneous Barge-In (halts AI speech immediately)
  const startListening = useCallback(async (langCode?: string): Promise<boolean> => {
    // 1. Immediate Barge-In: If AI was speaking, halt AI speech instantly!
    if (isSpeaking) {
      stopSpeaking();
      setIsInterrupted(true);
      setTimeout(() => setIsInterrupted(false), 800);
    }

    const ctx = getOrCreateAudioContext();
    if (ctx && ctx.state === 'suspended') {
      await ctx.resume().catch(() => {});
    }

    setTranscript('');
    clearAudioError();

    // Connect real microphone to micAnalyser ONLY (NEVER connect mic to destination/speakers!)
    if (navigator.mediaDevices && micAnalyserRef.current && ctx) {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        micStreamRef.current = stream;
        const micSource = ctx.createMediaStreamSource(stream);
        // Connect micSource exclusively to micAnalyser (NO destination connection!)
        micSource.connect(micAnalyserRef.current);
        micSourceRef.current = micSource;
      } catch (micErr: any) {
        console.warn('Microphone stream error:', micErr);
        const errName = micErr.name || '';
        if (errName === 'NotAllowedError' || errName === 'PermissionDeniedError') {
          setMicPermissionDenied(true);
          setAudioError('Microphone permission was denied. Please allow microphone access in your browser or device settings.');
        } else if (errName === 'NotFoundError' || errName === 'DevicesNotFoundError') {
          setMicPermissionDenied(false);
          setAudioError('No microphone device was found connected to your device.');
        } else if (errName === 'NotReadableError' || errName === 'TrackStartError') {
          setMicPermissionDenied(false);
          setAudioError('Microphone is already in use by another application or browser tab.');
        } else if (errName === 'OverconstrainedError') {
          setMicPermissionDenied(false);
          setAudioError('Microphone constraints could not be satisfied by your hardware.');
        } else {
          setMicPermissionDenied(true);
          setAudioError(`Microphone access error: ${micErr.message || 'Unable to access microphone'}`);
        }
        return false;
      }
    }

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
  }, [isSpeaking, stopSpeaking, getOrCreateAudioContext]);

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

  // Speak text using Gemini native TTS endpoint (with browser TTS as seamless fallback)
  const speakText = useCallback(async (text: string, langCode?: string, characterName?: string, role?: string): Promise<void> => {
    if (!text || !text.trim()) return;

    // Immediate stop of any prior audio
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
          await playGeminiAudio(data.audioBase64);
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
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);
      window.speechSynthesis.speak(utterance);
    }
  }, [playGeminiAudio, stopSpeaking]);

  return (
    <AudioContextState.Provider
      value={{
        isListening,
        transcript,
        isSpeaking,
        isInterrupted,
        audioEnergy,
        micPermissionDenied,
        audioError,
        notificationSoundsEnabled,
        speechFeedbackEnabled,
        startListening,
        stopListening,
        playGeminiAudio,
        speakText,
        stopSpeaking,
        toggleNotificationSounds,
        toggleSpeechFeedback,
        playNotificationSound,
        playFeedbackSound,
        getAudioEnergy,
        resumeAudioContext,
        clearAudioError
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
