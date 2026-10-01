import React, { createContext, useContext, useState, useEffect } from 'react';

interface AudioContextType {
  isListening: boolean;
  transcript: string;
  isSpeaking: boolean;
  notificationSoundsEnabled: boolean;
  speechFeedbackEnabled: boolean;
  startListening: (langCode?: string) => void;
  stopListening: () => void;
  speakText: (text: string, langCode?: string) => void;
  stopSpeaking: () => void;
  toggleNotificationSounds: () => void;
  toggleSpeechFeedback: () => void;
  playNotificationSound: () => void;
  playFeedbackSound: (type?: 'start' | 'stop' | 'success') => void;
}

const AudioContext = createContext<AudioContextType | undefined>(undefined);

export const AudioProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [recognition, setRecognition] = useState<any>(null);

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

  // Web Audio synthesizer for pristine sound feedback without asset load latency
  const playSynthesizedTone = (frequencies: number[], duration = 0.2, type: OscillatorType = 'sine') => {
    try {
      if (typeof window === 'undefined') return;
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
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
        };

        reco.onerror = (err: any) => {
          console.warn('Speech recognition error:', err);
          setIsListening(false);
        };

        setRecognition(reco);
      }
    }
  }, []);

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

  const startListening = (langCode?: string) => {
    if (!recognition) {
      alert('Speech recognition is not supported in this browser. You can type your response instead!');
      return;
    }
    try {
      recognition.lang = mapLangToLocale(langCode);
      setTranscript('');
      recognition.start();
      setIsListening(true);
      playFeedbackSound('start');
    } catch (e) {
      console.warn('Recognition start issue:', e);
    }
  };

  const stopListening = () => {
    if (recognition) {
      recognition.stop();
      setIsListening(false);
      playFeedbackSound('stop');
    }
  };

  const speakText = (text: string, langCode?: string) => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    stopSpeaking();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = mapLangToLocale(langCode);
    utterance.rate = 0.92; // Slightly natural cadence for clear language comprehension

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    window.speechSynthesis.speak(utterance);
  };

  const stopSpeaking = () => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }
  };

  return (
    <AudioContext.Provider
      value={{
        isListening,
        transcript,
        isSpeaking,
        notificationSoundsEnabled,
        speechFeedbackEnabled,
        startListening,
        stopListening,
        speakText,
        stopSpeaking,
        toggleNotificationSounds,
        toggleSpeechFeedback,
        playNotificationSound,
        playFeedbackSound
      }}
    >
      {children}
    </AudioContext.Provider>
  );
};

export const useAudio = () => {
  const context = useContext(AudioContext);
  if (!context) throw new Error('useAudio must be used within an AudioProvider');
  return context;
};
