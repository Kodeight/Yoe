import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useApp } from '../context/AppContext';
import { useAudio } from '../context/AudioContext';
import { ChatMessage, CorrectionDetail } from '../types';
import { VoiceBubble, VoiceBubbleState } from '../components/VoiceBubble';
import { GeminiLiveSession } from '../utils/geminiLiveClient';
import { getTranslation } from '../utils/i18n';
import {
  ArrowLeft,
  Mic,
  MicOff,
  Send,
  Volume2,
  CheckCircle2,
  Circle,
  ChevronDown,
  ChevronUp,
  Lightbulb,
  Award,
  Compass,
  MessageSquare,
  Square,
  Radio,
  Play,
  Languages,
  Target,
  AlertCircle,
  RefreshCw
} from 'lucide-react';
import { SessionSummaryModal } from '../components/SessionSummaryModal';

export const ConversationView: React.FC = () => {
  const { activeScenario, activeJourney, scenarios, setActiveScenarioId, setActiveView, refreshProgress, uiLanguage } = useApp();
  const {
    isListening,
    transcript,
    isSpeaking,
    isInterrupted,
    audioEnergy,
    micPermissionDenied,
    audioError,
    requestMicrophoneAccess,
    startListening,
    stopListening,
    playGeminiAudio,
    speakText,
    stopSpeaking,
    playNotificationSound,
    resumeAudioContext,
    clearAudioError,
    setOnSpeechEndCallback
  } = useAudio();

  const t = getTranslation(uiLanguage);

  // Conversation state
  const [hasStartedConversation, setHasStartedConversation] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showMissions, setShowMissions] = useState(false);
  const [completedObjectives, setCompletedObjectives] = useState<Record<string, boolean>>({});
  const [suggestedReplies, setSuggestedReplies] = useState<Array<{ phrase: string; translation: string }>>([]);
  const [showTranslations, setShowTranslations] = useState<Record<string, boolean>>({});
  const [showTranscript, setShowTranscript] = useState(true);
  const [isLiveApiActive, setIsLiveApiActive] = useState(false);
  const [liveState, setLiveState] = useState<VoiceBubbleState>('idle');
  const [liveEnergy, setLiveEnergy] = useState<number>(0);
  const [liveError, setLiveError] = useState<string | null>(null);

  // Session metrics tracking
  const [sessionStartTime] = useState<number>(() => Date.now());
  const [sessionMistakes, setSessionMistakes] = useState<CorrectionDetail[]>([]);
  const [sessionVocab, setSessionVocab] = useState<Array<{ word: string; translation: string; phonetic?: string }>>([]);
  const [showSummaryModal, setShowSummaryModal] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const liveSessionRef = useRef<GeminiLiveSession | null>(null);
  const [playingMsgId, setPlayingMsgId] = useState<string | null>(null);

  // Sync playingMsgId with audioContext isSpeaking
  useEffect(() => {
    if (!isSpeaking) {
      setPlayingMsgId(null);
    }
  }, [isSpeaking]);

  // Speaker Icon Replay Handler (Requirement 13)
  const handlePlayMessageAudio = async (msg: ChatMessage) => {
    if (playingMsgId === msg.id && isSpeaking) {
      stopSpeaking();
      setPlayingMsgId(null);
      return;
    }

    setPlayingMsgId(msg.id);
    if (msg.audioUrl) {
      await playGeminiAudio(msg.audioUrl, () => setPlayingMsgId(null));
    } else {
      await speakText(
        msg.text,
        activeJourney?.targetLanguage,
        activeScenario?.characterName,
        activeScenario?.characterRole,
        () => setPlayingMsgId(null)
      );
    }
  };

  // Prepare initial scenario state on mount with LIVE AI-generated greeting
  useEffect(() => {
    let isCancelled = false;
    if (activeScenario && activeJourney) {
      setHasStartedConversation(false);
      setIsLiveApiActive(false);
      setCompletedObjectives({});
      setLiveError(null);
      clearAudioError();

      // Fetch live AI-generated initial greeting from Gemini
      fetch('/api/ai/initial-greeting', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          scenarioId: activeScenario.id,
          journeyId: activeJourney.id,
          targetLanguage: activeJourney.targetLanguage,
          supportLanguage: activeJourney.supportLanguage,
          cefrLevel: activeJourney.cefrLevel
        })
      })
        .then((res) => res.json())
        .then((data) => {
          if (isCancelled) return;
          const greetingText = data.greeting?.response || activeScenario.initialGreeting;
          const greetingTrans = data.greeting?.translation || activeScenario.initialGreetingTranslation || greetingText;
          const initialGreetingMsg: ChatMessage = {
            id: `msg_init_${activeScenario.id}_${Date.now()}`,
            sessionId: activeScenario.id,
            sender: 'tutor',
            text: greetingText,
            translation: greetingTrans,
            audioUrl: data.greeting?.audioBase64 ? `data:audio/wav;base64,${data.greeting.audioBase64}` : undefined,
            timestamp: new Date().toISOString()
          };
          setMessages([initialGreetingMsg]);
        })
        .catch(() => {
          if (isCancelled) return;
          const initialGreetingMsg: ChatMessage = {
            id: `msg_init_${activeScenario.id}`,
            sessionId: activeScenario.id,
            sender: 'tutor',
            text: activeScenario.initialGreeting,
            translation: activeScenario.initialGreetingTranslation || activeScenario.initialGreeting,
            timestamp: new Date().toISOString()
          };
          setMessages([initialGreetingMsg]);
        });
    }

    return () => {
      isCancelled = true;
      if (liveSessionRef.current) {
        liveSessionRef.current.cleanup();
        liveSessionRef.current = null;
      }
      stopSpeaking();
      stopListening();
    };
  }, [activeScenario]);

  // Sync speech recognition transcript into text input for live display
  useEffect(() => {
    if (transcript) {
      setInputText(transcript);
    }
  }, [transcript]);

  // Scroll to bottom on new messages
  useEffect(() => {
    if (showTranscript && hasStartedConversation) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isLoading, showTranscript, hasStartedConversation]);

  // Send Message Handler (unified for voice & text)
  const handleSendMessage = useCallback(async (textToSend?: string) => {
    const text = textToSend || inputText;
    if (!text || !text.trim() || !activeScenario || !activeJourney || isLoading) return;

    setInputText('');
    stopListening();
    stopSpeaking();

    const userMsg: ChatMessage = {
      id: `msg_usr_${Date.now()}`,
      sessionId: activeScenario.id,
      sender: 'user',
      text: text.trim(),
      timestamp: new Date().toISOString()
    };

    setMessages(prev => [...prev, userMsg]);
    setIsLoading(true);

    try {
      const updatedHistory = [...messages, userMsg].map(m => ({ sender: m.sender, text: m.text }));

      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          journeyId: activeJourney.id,
          scenarioId: activeScenario.id,
          userMessage: text.trim(),
          conversationHistory: updatedHistory,
          targetLanguage: activeJourney.targetLanguage,
          supportLanguage: activeJourney.supportLanguage,
          cefrLevel: activeJourney.cefrLevel
        })
      });

      const data = await res.json();

      if (res.ok && data.message) {
        setMessages(prev => [...prev, data.message]);
        playNotificationSound();

        // Native audio playback with automatic re-listen loop upon audio completion
        const onPlaybackFinished = () => {
          if (hasStartedConversation && !isLiveApiActive) {
            startListening(activeJourney.targetLanguage);
          }
        };

        if (data.aiResponse?.audioBase64) {
          playGeminiAudio(data.aiResponse.audioBase64, onPlaybackFinished);
        } else {
          speakText(
            data.message.text,
            activeJourney.targetLanguage,
            activeScenario.characterName,
            activeScenario.characterRole,
            onPlaybackFinished
          );
        }

        // Track completed objectives
        if (data.aiResponse?.completedObjectiveIds) {
          setCompletedObjectives(prev => {
            const updated = { ...prev };
            data.aiResponse.completedObjectiveIds.forEach((id: string) => {
              updated[id] = true;
            });
            return updated;
          });
        }

        // Suggested next replies
        if (data.aiResponse?.suggestedNextReplies) {
          setSuggestedReplies(data.aiResponse.suggestedNextReplies);
        }

        // Track mistakes & vocabulary
        if (data.aiResponse?.correction) {
          setSessionMistakes(prev => [...prev, data.aiResponse.correction]);
        }
        if (data.aiResponse?.vocabulary) {
          setSessionVocab(prev => [...prev, ...data.aiResponse.vocabulary]);
        }
      } else {
        const errorMsg = data?.error || "Yoe couldn't connect right now. Please try again.";
        setLiveError(errorMsg);
      }
    } catch (err) {
      console.error('AI chat processing error:', err);
      setLiveError("Yoe couldn't connect right now. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }, [
    inputText,
    activeScenario,
    activeJourney,
    isLoading,
    stopListening,
    stopSpeaking,
    messages,
    playNotificationSound,
    playGeminiAudio,
    speakText,
    hasStartedConversation,
    isLiveApiActive,
    startListening
  ]);

  // Connect Automatic Turn Detection Callback to AudioContext
  useEffect(() => {
    if (hasStartedConversation) {
      setOnSpeechEndCallback((finalText) => {
        if (finalText && finalText.trim()) {
          handleSendMessage(finalText.trim());
        }
      });
    } else {
      setOnSpeechEndCallback(null);
    }

    return () => {
      setOnSpeechEndCallback(null);
    };
  }, [hasStartedConversation, setOnSpeechEndCallback, handleSendMessage]);

  // Handle explicit user gesture to START the conversation
  const handleStartConversation = async () => {
    if (!activeScenario || !activeJourney) return;

    await resumeAudioContext();
    clearAudioError();
    setLiveError(null);
    setHasStartedConversation(true);
    playNotificationSound();

    // 1. Attempt Gemini Live API connection
    const live = new GeminiLiveSession({
      journeyId: activeJourney.id,
      scenarioId: activeScenario.id,
      onStateChange: (st) => {
        if (st === 'connecting' || st === 'listening' || st === 'speaking' || st === 'thinking' || st === 'interrupted' || st === 'idle' || st === 'error') {
          setLiveState(st as VoiceBubbleState);
        }
      },
      onAudioEnergy: (energy) => {
        setLiveEnergy(energy);
      },
      onTranscriptChunk: (sender, chunkText) => {
        if (chunkText) {
          setMessages(prev => {
            const last = prev[prev.length - 1];
            if (last && last.sender === sender && !last.id.includes('final')) {
              return [...prev.slice(0, -1), { ...last, text: last.text + chunkText }];
            }
            return [
              ...prev,
              {
                id: `live_${Date.now()}`,
                sessionId: activeScenario.id,
                sender,
                text: chunkText,
                timestamp: new Date().toISOString()
              }
            ];
          });
        }
      },
      onError: (err) => {
        console.warn('Live API connection note:', err);
        setLiveError('Live streaming note: using standard audio mode.');
        setIsLiveApiActive(false);
      }
    });

    const started = await live.start();
    if (started) {
      setIsLiveApiActive(true);
      liveSessionRef.current = live;
    } else {
      setIsLiveApiActive(false);
      // Speak initial greeting via standard native mode & auto-listen afterwards
      speakText(
        activeScenario.initialGreeting,
        activeJourney.targetLanguage,
        activeScenario.characterName,
        activeScenario.characterRole,
        () => {
          startListening(activeJourney.targetLanguage);
        }
      );
    }
  };

  // Calculate current dynamic voice bubble state
  const getBubbleState = (): VoiceBubbleState => {
    if (micPermissionDenied || audioError) return 'error';
    if (!hasStartedConversation) return 'idle';
    if (isLiveApiActive) return liveState;
    if (isInterrupted) return 'interrupted';
    if (isListening) return 'listening';
    if (isLoading) return 'thinking';
    if (isSpeaking) return 'speaking';
    return 'idle';
  };

  const handleOpenSummary = () => {
    if (liveSessionRef.current) {
      liveSessionRef.current.cleanup();
    }
    stopSpeaking();
    stopListening();
    setShowSummaryModal(true);
  };

  // Safe Empty State when no scenario is active
  if (!activeScenario) {
    const fallbackScenario = scenarios[0];
    return (
      <div className="min-h-[100dvh] flex flex-col justify-between p-4 safe-top-padding safe-bottom-padding text-slate-100">
        <div className="flex items-center justify-between py-2">
          <button
            onClick={() => setActiveView('home')}
            className="p-2 rounded-full glass-pill hover:border-emerald-500/40 text-slate-300 transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <span className="text-xs font-bold text-slate-400">{t.yoe} Conversation</span>
          <div className="w-9" />
        </div>

        <div className="max-w-sm mx-auto text-center space-y-4 my-auto">
          <VoiceBubble size="2xl" state="idle" interactive />
          <h2 className="text-2xl font-black text-slate-100 dark:text-slate-100 light-mode:text-slate-900 tracking-tight">
            {t.readyToSpeakPrompt}
          </h2>
          <p className="text-xs text-slate-400 dark:text-slate-400 light-mode:text-slate-600 leading-relaxed">
            {t.practiceDialogueAt}
          </p>

          <div className="pt-3 space-y-2.5">
            <button
              onClick={() => setActiveView('explore')}
              className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 text-white font-black text-xs flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 cursor-pointer hover:opacity-95"
            >
              <Compass className="w-4 h-4 text-white" />
              <span className="text-white font-bold">{t.exploreScenarioWorlds}</span>
            </button>

            {fallbackScenario && (
              <button
                onClick={() => {
                  setActiveScenarioId(fallbackScenario.id);
                }}
                className="w-full py-3 rounded-2xl glass-pill text-xs font-bold text-slate-200 dark:text-slate-200 light-mode:text-slate-800 hover:border-emerald-500/40 cursor-pointer"
              >
                {t.quickStart}: {fallbackScenario.title}
              </button>
            )}
          </div>
        </div>

        <div className="text-center text-[11px] text-slate-500 py-2">
          {t.tapCardToEnter}
        </div>
      </div>
    );
  }

  const completedCount = Object.values(completedObjectives).filter(Boolean).length;
  const totalObjectives = activeScenario.objectives.length;
  const bubbleState = getBubbleState();
  const currentEnergy = isLiveApiActive ? liveEnergy : audioEnergy;

  // Scale requirement: 'xl' before starting, '2xl' during live call
  const bubbleSize = !hasStartedConversation ? 'xl' : '2xl';

  return (
    <div className="flex flex-col h-[100dvh] w-full max-w-lg mx-auto bg-[var(--app-background)] text-[var(--text-primary)] relative overflow-hidden">

      {/* Top Compact Scenario Glass Header Bar */}
      <div className="shrink-0 z-30 glass-header px-4 py-3 flex items-center justify-between safe-top-padding border-b border-white/10 dark:border-white/10 light-mode:border-slate-200">
        <button
          onClick={() => {
            if (liveSessionRef.current) {
              liveSessionRef.current.cleanup();
            }
            stopSpeaking();
            stopListening();
            setActiveView('home');
          }}
          className="p-2 rounded-full glass-pill hover:border-emerald-500/40 text-slate-300 dark:text-slate-300 light-mode:text-slate-700 transition-colors cursor-pointer"
          title={t.backToHome}
        >
          <ArrowLeft className="w-4 h-4" />
        </button>

        <div className="flex items-center gap-2 min-w-0 px-2">
          <div className="min-w-0 text-center">
            <h2 className="text-xs font-black text-slate-100 dark:text-slate-100 light-mode:text-slate-900 flex items-center justify-center gap-1.5 truncate">
              <span>YOE</span>
              <span className="px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 text-[9px] font-extrabold uppercase">
                {activeJourney?.cefrLevel || activeScenario.cefrLevel || 'A1'}
              </span>
            </h2>
            <p className="text-[10px] text-slate-400 dark:text-slate-400 light-mode:text-slate-500 truncate max-w-[180px]">
              {activeScenario.title}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          <button
            onClick={() => setShowTranscript(!showTranscript)}
            className={`p-1.5 rounded-full transition-colors cursor-pointer ${
              showTranscript ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'glass-pill text-slate-400'
            }`}
            title={showTranscript ? t.hideTranscript : t.showTranscript}
          >
            <MessageSquare className="w-3.5 h-3.5" />
          </button>

          {/* Green Finish Button with White Text & White Icon */}
          <button
            onClick={handleOpenSummary}
            className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-[10px] font-bold text-white flex items-center gap-1.5 cursor-pointer shadow-md shadow-emerald-500/20 transition-all active:scale-95"
            title={t.completeAndReview}
          >
            <Award className="w-3.5 h-3.5 text-white" />
            <span className="text-white font-bold">{t.finish}</span>
          </button>

          <button
            onClick={() => setShowMissions(!showMissions)}
            className="px-2 py-1.5 rounded-xl glass-pill text-[10px] font-bold text-emerald-400 flex items-center gap-1 cursor-pointer"
          >
            <Target className="w-3 h-3 text-emerald-400" />
            <span>{completedCount}/{totalObjectives}</span>
            {showMissions ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
          </button>
        </div>
      </div>

      {/* Collapsible Mission Objectives Drawer */}
      {showMissions && (
        <div className="glass-nav border-b border-white/10 dark:border-white/10 light-mode:border-slate-200 p-4 animate-in slide-in-from-top duration-200 shadow-xl z-20">
          <h3 className="text-xs font-bold text-slate-200 dark:text-slate-200 light-mode:text-slate-800 uppercase tracking-wider mb-2 flex items-center justify-between">
            <span>{t.scenarioMissions}</span>
            <span className="text-emerald-400 text-[11px] font-extrabold">
              {completedCount} {t.completedOf} {totalObjectives}
            </span>
          </h3>
          <div className="space-y-2">
            {activeScenario.objectives.map((obj) => {
              const isDone = completedObjectives[obj.id];
              return (
                <div
                  key={obj.id}
                  className={`p-2.5 rounded-xl border text-xs flex items-start gap-2.5 transition-colors ${
                    isDone
                      ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300 dark:text-emerald-300 light-mode:text-emerald-800'
                      : 'bg-slate-950/40 dark:bg-slate-950/40 light-mode:bg-white border-white/5 dark:border-white/5 light-mode:border-slate-200 text-slate-300 dark:text-slate-300 light-mode:text-slate-700'
                  }`}
                >
                  {isDone ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  ) : (
                    <Circle className="w-4 h-4 text-slate-500 shrink-0 mt-0.5" />
                  )}
                  <div className="flex-1">
                    <p className={`font-medium ${isDone ? 'line-through opacity-80' : ''}`}>{obj.text}</p>
                    {obj.hint && !isDone && (
                      <p className="text-[10px] text-slate-400 dark:text-slate-400 light-mode:text-slate-500 mt-1 flex items-center gap-1">
                        <Lightbulb className="w-3 h-3 text-amber-400" />
                        <span>{t.hint}: {obj.hint}</span>
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Microphone Permission / Audio Error Alert Banner */}
      {(micPermissionDenied || audioError) && (
        <div className="mx-4 my-2 p-4 rounded-2xl bg-[var(--error-surface)] border border-[var(--error-border)] shrink-0 animate-in fade-in z-20 shadow-md">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-[var(--error)] shrink-0 mt-0.5" />
            <div className="flex-1 min-w-0">
              <h4 className="text-xs font-bold text-[var(--error-text)] leading-snug">
                {micPermissionDenied ? t.micPermissionNeeded : t.audioDeviceNotice}
              </h4>
              <p className="text-[11px] text-[var(--error-text)] opacity-95 mt-1 leading-relaxed font-normal break-words">
                {audioError || 'Please allow microphone access in your browser settings so Yoe can hear your voice.'}
              </p>
              <div className="mt-3">
                <button
                  type="button"
                  onClick={async () => {
                    clearAudioError();
                    const granted = await requestMicrophoneAccess();
                    if (granted) {
                      await startListening(activeJourney?.targetLanguage);
                    }
                  }}
                  className="px-3.5 py-2 rounded-xl bg-[var(--error)] text-white text-[11px] font-bold inline-flex items-center gap-2 cursor-pointer hover:opacity-95 active:scale-98 transition-all shadow-sm"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>{t.retryMicrophone}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Centerpiece: Living Yoe Voice Bubble Presence */}
      <div className="shrink-0 flex flex-col items-center justify-center pt-2 pb-1 select-none relative">
        <div
          onClick={() => {
            if (!hasStartedConversation) {
              handleStartConversation();
            } else if (isLiveApiActive && liveSessionRef.current) {
              if (liveState === 'speaking') {
                liveSessionRef.current.handleInterruption();
              }
            } else if (isSpeaking) {
              stopSpeaking();
              startListening(activeJourney?.targetLanguage);
            } else if (!isListening) {
              startListening(activeJourney?.targetLanguage);
            } else {
              stopListening();
            }
          }}
          className="cursor-pointer transition-transform hover:scale-102 active:scale-98"
          title={!hasStartedConversation ? t.startConversation : isSpeaking || liveState === 'speaking' ? t.tapToInterrupt : t.tapToSpeak}
        >
          <VoiceBubble
            size={bubbleSize}
            state={bubbleState}
            audioEnergy={currentEnergy}
            interactive
          />
        </div>

        {/* Plain Text Status Indicator (Requirement 18: No badge/pill background) */}
        <div className="mt-1 flex items-center justify-center gap-2 text-xs font-semibold text-slate-300 dark:text-slate-300 light-mode:text-slate-700">
          <span
            className={`w-2 h-2 rounded-full inline-block ${
              !hasStartedConversation
                ? 'bg-emerald-400'
                : bubbleState === 'speaking'
                ? 'bg-emerald-400 animate-pulse'
                : bubbleState === 'listening'
                ? 'bg-cyan-400 animate-ping'
                : bubbleState === 'thinking'
                ? 'bg-blue-400 animate-pulse'
                : bubbleState === 'interrupted'
                ? 'bg-amber-400'
                : 'bg-emerald-400'
            }`}
          />
          <p className="text-xs font-semibold text-slate-200 dark:text-slate-200 light-mode:text-slate-800 tracking-wide">
            {!hasStartedConversation
              ? t.readyToSpeak
              : bubbleState === 'speaking'
              ? t.yoeIsSpeaking
              : bubbleState === 'listening'
              ? t.listeningToYou
              : bubbleState === 'thinking'
              ? t.yoeIsThinking
              : bubbleState === 'interrupted'
              ? t.interrupted
              : t.tapToSpeak}
          </p>
          {isLiveApiActive && (
            <span className="text-emerald-400 text-[10px] font-black uppercase flex items-center gap-0.5 ml-1">
              <Radio className="w-2.5 h-2.5" />
              <span>{t.live}</span>
            </span>
          )}
        </div>
      </div>

      {/* Prominent Primary START Button before conversation begins */}
      {!hasStartedConversation ? (
        <div className="flex-1 flex flex-col items-center justify-center p-6 text-center space-y-4 my-auto">
          <div className="max-w-xs space-y-2">
            <h3 className="text-lg font-black text-slate-100 dark:text-slate-100 light-mode:text-slate-900 tracking-tight">
              {activeScenario.title}
            </h3>
            <p className="text-xs text-slate-400 dark:text-slate-400 light-mode:text-slate-600 leading-relaxed">
              {t.practiceDialogueAt}
            </p>
          </div>

          <button
            onClick={handleStartConversation}
            className="w-full max-w-xs py-4 px-6 rounded-2xl bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 text-white font-black text-sm flex items-center justify-center gap-2.5 shadow-xl shadow-emerald-500/25 hover:shadow-emerald-500/40 hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer"
          >
            <Play className="w-5 h-5 fill-current text-white" />
            <span className="text-white font-extrabold">{t.startConversation}</span>
          </button>
        </div>
      ) : (
        /* Main Conversation Messages Scroll Area after Start */
        showTranscript ? (
          <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3.5 no-scrollbar">
            {messages.map((msg) => {
              const isUser = msg.sender === 'user';
              const isCurrentlyPlaying = playingMsgId === msg.id && isSpeaking;

              return (
                <div key={msg.id} className={`flex flex-col ${isUser ? 'items-end' : 'items-start'} space-y-1`}>
                  <div
                    className={`max-w-[85%] rounded-3xl p-3.5 text-xs shadow-md transition-all ${
                      isUser
                        ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-semibold rounded-br-sm'
                        : 'glass-card text-slate-100 dark:text-slate-100 light-mode:text-slate-900 rounded-bl-sm'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-3 mb-1">
                      <span className={`text-[10px] font-extrabold uppercase tracking-wider ${isUser ? 'text-white/80' : 'text-emerald-400'}`}>
                        {isUser ? t.you : t.yoe}
                      </span>
                      {!isUser && (
                        <button
                          type="button"
                          onClick={() => handlePlayMessageAudio(msg)}
                          className={`p-1 rounded-lg transition-colors cursor-pointer ${
                            isCurrentlyPlaying
                              ? 'text-emerald-400 bg-emerald-500/20 animate-pulse'
                              : 'text-slate-400 hover:text-emerald-400 hover:bg-white/5'
                          }`}
                          title={isCurrentlyPlaying ? t.stopPlayback : t.listenToYoe}
                        >
                          <Volume2 className={`w-3.5 h-3.5 ${isCurrentlyPlaying ? 'stroke-[2.5]' : ''}`} />
                        </button>
                      )}
                    </div>

                    <p className="leading-relaxed text-[13px]">{msg.text}</p>

                    {/* Single Clear Translation Toggle Action */}
                    {!isUser && msg.translation && (
                      <div className="mt-2 pt-2 border-t border-white/10 dark:border-white/10 light-mode:border-slate-200">
                        {showTranslations[msg.id] ? (
                          <p className="text-[11px] text-slate-400 dark:text-slate-400 light-mode:text-slate-600 italic">
                            {msg.translation}
                          </p>
                        ) : (
                          <button
                            type="button"
                            onClick={() => setShowTranslations(prev => ({ ...prev, [msg.id]: true }))}
                            className="text-[10px] font-bold text-emerald-400 hover:underline cursor-pointer flex items-center gap-1"
                          >
                            <Languages className="w-3 h-3" />
                            <span>{t.translate}</span>
                          </button>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Gentle Structured Correction Note */}
                  {msg.correction && (
                    <div className="max-w-[85%] rounded-2xl bg-amber-500/10 border border-amber-500/25 p-3 text-xs space-y-1.5 animate-in fade-in">
                      <div className="flex items-center gap-1.5 text-amber-400 font-bold text-[10px] uppercase">
                        <Lightbulb className="w-3.5 h-3.5" />
                        <span>{t.yoeCoaching}</span>
                      </div>
                      <div className="text-[11px] text-slate-200 dark:text-slate-200 light-mode:text-slate-800">
                        <span className="line-through text-red-300 opacity-70 mr-1.5">{msg.correction.original}</span>
                        <span className="text-emerald-400 font-bold">→ {msg.correction.corrected}</span>
                      </div>
                      {msg.correction.explanation && (
                        <p className="text-[10px] text-slate-400 dark:text-slate-400 light-mode:text-slate-600">
                          {msg.correction.explanation}
                        </p>
                      )}
                    </div>
                  )}
                </div>
              );
            })}

            {isLoading && (
              <div className="flex items-center gap-2 p-3 rounded-2xl glass-card max-w-[180px]">
                <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
                <span className="text-xs text-slate-400">{t.yoeIsThinking}</span>
              </div>
            )}

            {/* Suggestions belong naturally to conversation flow */}
            {suggestedReplies.length > 0 && !isLoading && (
              <div className="pt-3 pb-1 space-y-1.5 animate-in fade-in">
                <span className="text-[10px] font-bold text-slate-400 dark:text-slate-400 light-mode:text-slate-500 uppercase tracking-wider block">
                  {t.suggestedResponses}
                </span>
                <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
                  {suggestedReplies.map((reply, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleSendMessage(reply.phrase)}
                      className="glass-pill px-3 py-1.5 rounded-full text-xs text-emerald-400 hover:border-emerald-500/40 hover:bg-emerald-500/10 transition-colors whitespace-nowrap cursor-pointer shrink-0"
                    >
                      <span>{reply.phrase}</span>
                      <span className="text-[10px] text-slate-400 ml-1.5 opacity-80">({reply.translation})</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div ref={messagesEndRef} className="h-2" />
          </div>
        ) : (
          <div className="flex-1 flex items-center justify-center p-4">
            <div className="text-center space-y-2 text-slate-400 text-xs">
              <p className="font-semibold text-slate-300">Live Voice Conversation Active</p>
              <p className="text-[11px] max-w-xs mx-auto">
                Speak naturally into your microphone. Tap the transcript icon anytime to review the dialogue.
              </p>
            </div>
          </div>
        )
      )}

      {/* Structured Bottom Conversational Composer within Chat Viewport */}
      {hasStartedConversation && (
        <div className="shrink-0 px-4 pt-1 pb-[max(env(safe-area-inset-bottom,0px),0.75rem)] z-30">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="glass-nav p-2 rounded-3xl flex items-center gap-2 shadow-2xl border border-white/10 dark:border-white/10 light-mode:border-slate-200"
          >
            {/* Main Barge-In / Interruption Speech Mic Button */}
            <button
              type="button"
              onClick={() => {
                if (isLiveApiActive && liveSessionRef.current) {
                  if (liveState === 'speaking') {
                    liveSessionRef.current.handleInterruption();
                  }
                } else if (isSpeaking) {
                  stopSpeaking();
                  startListening(activeJourney?.targetLanguage);
                } else if (isListening) {
                  stopListening();
                  if (inputText.trim()) {
                    handleSendMessage();
                  }
                } else {
                  startListening(activeJourney?.targetLanguage);
                }
              }}
              className={`p-3 rounded-2xl transition-all cursor-pointer shadow-lg shrink-0 ${
                isSpeaking || liveState === 'speaking'
                  ? 'bg-amber-500 text-white font-bold hover:bg-amber-400 animate-pulse'
                  : isListening || liveState === 'listening'
                  ? 'bg-rose-500 text-white animate-pulse shadow-rose-500/40'
                  : 'glass-pill text-emerald-400 hover:border-emerald-500/40 hover:bg-emerald-500/10'
              }`}
              title={isSpeaking || liveState === 'speaking' ? t.tapToInterrupt : isListening ? t.finish : t.tapToSpeak}
            >
              {isSpeaking || liveState === 'speaking' ? (
                <Square className="w-5 h-5 fill-current text-white" />
              ) : isListening || liveState === 'listening' ? (
                <MicOff className="w-5 h-5 text-white" />
              ) : (
                <Mic className="w-5 h-5" />
              )}
            </button>

            {/* Text Input */}
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder={
                isListening || liveState === 'listening'
                  ? t.listeningToYou
                  : isSpeaking || liveState === 'speaking'
                  ? t.tapToInterrupt
                  : t.replyToYoe
              }
              className="flex-1 bg-slate-950/60 dark:bg-slate-950/60 light-mode:bg-white border border-white/10 dark:border-white/10 light-mode:border-slate-200 rounded-2xl px-4 py-2.5 text-xs text-slate-100 dark:text-slate-100 light-mode:text-slate-900 placeholder-slate-500 focus:outline-none focus:border-emerald-400 transition-colors"
            />

            {/* Send Button with White Icon */}
            <button
              type="submit"
              disabled={!inputText.trim() || isLoading}
              className="p-3 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 text-white disabled:opacity-40 transition-all cursor-pointer shadow-md shrink-0 flex items-center justify-center hover:opacity-95"
            >
              <Send className="w-4 h-4 text-white" />
            </button>
          </form>
        </div>
      )}

      {/* Session Summary Modal on Finish */}
      {showSummaryModal && (
        <SessionSummaryModal
          summary={{
            scenario: activeScenario,
            durationMinutes: Math.max(1, Math.round((Date.now() - sessionStartTime) / 60000)),
            totalTurns: messages.length,
            completedObjectives: activeScenario.objectives.filter(o => completedObjectives[o.id]),
            mistakes: sessionMistakes,
            vocabularyLearned: sessionVocab
          }}
          onClose={() => {
            setShowSummaryModal(false);
            refreshProgress();
            setActiveView('home');
          }}
          onRestart={() => {
            setShowSummaryModal(false);
            setHasStartedConversation(false);
            setMessages([
              {
                id: `msg_init_${activeScenario.id}_${Date.now()}`,
                sessionId: activeScenario.id,
                sender: 'tutor',
                text: activeScenario.initialGreeting,
                translation: activeScenario.initialGreetingTranslation || activeScenario.initialGreeting,
                timestamp: new Date().toISOString()
              }
            ]);
            setCompletedObjectives({});
          }}
          onGoHome={() => {
            setShowSummaryModal(false);
            refreshProgress();
            setActiveView('home');
          }}
        />
      )}

    </div>
  );
};
