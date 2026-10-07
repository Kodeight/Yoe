import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useApp } from '../context/AppContext';
import { useAudio } from '../context/AudioContext';
import { ChatMessage, CorrectionDetail } from '../types';
import { VoiceBubble, VoiceBubbleState } from '../components/VoiceBubble';
import { GeminiLiveSession } from '../utils/geminiLiveClient';
import { getTranslation } from '../utils/i18n';
import { base64ToUint8Array, pcmChunksToWavDataUrl } from '../utils/audioHelpers';
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
  const {
    user,
    activeScenario,
    activeLesson,
    activeCourse,
    activeJourney,
    scenarios,
    recommendations,
    completeScenario,
    setActiveScenarioId,
    setActiveView,
    previousView,
    navigateBack,
    refreshProgress,
    uiLanguage
  } = useApp();
  const {
    isListening,
    transcript,
    isSpeaking,
    isInterrupted,
    audioEnergy,
    micPermissionDenied,
    audioError,
    playingMessageId,
    replayErrorId,
    requestMicrophoneAccess,
    startListening,
    stopListening,
    playGeminiAudio,
    speakText,
    replayMessage,
    stopSpeaking,
    playNotificationSound,
    resumeAudioContext,
    clearAudioError
  } = useAudio();

  const t = getTranslation(uiLanguage);

  // Conversation state
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
  const [isMicMuted, setIsMicMuted] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const liveSessionRef = useRef<GeminiLiveSession | null>(null);
  const tutorPcmChunksRef = useRef<Uint8Array[]>([]);
  const touchStartXRef = useRef<number | null>(null);
  const touchStartYRef = useRef<number | null>(null);

  // Close conversation and navigate back using browser history or previous view
  const handleCloseConversation = useCallback(() => {
    if (liveSessionRef.current) {
      liveSessionRef.current.stop();
      liveSessionRef.current = null;
    }
    stopSpeaking();
    stopListening();
    if (typeof window !== 'undefined' && window.history.length > 1 && window.history.state?.view) {
      window.history.back();
    } else if (navigateBack) {
      navigateBack();
    } else {
      setActiveView(previousView || 'home');
    }
  }, [navigateBack, setActiveView, previousView, stopSpeaking, stopListening]);

  // Swipe-to-close gesture handler:
  // Detects horizontal swipe right (> 70px) OR vertical swipe down from top (> 80px)
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartXRef.current = e.touches[0].clientX;
    touchStartYRef.current = e.touches[0].clientY;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartXRef.current === null || touchStartYRef.current === null) return;
    const deltaX = e.changedTouches[0].clientX - touchStartXRef.current;
    const deltaY = e.changedTouches[0].clientY - touchStartYRef.current;
    const startY = touchStartYRef.current;
    touchStartXRef.current = null;
    touchStartYRef.current = null;

    // Detect intentional swipe right gesture (> 70px horizontal and primarily horizontal)
    const isSwipeRight = deltaX > 70 && Math.abs(deltaX) > Math.abs(deltaY) * 1.2;
    // Detect intentional swipe down gesture from top header/bubble area (> 80px vertical)
    const isSwipeDownFromTop = deltaY > 80 && Math.abs(deltaY) > Math.abs(deltaX) * 1.2 && startY < 250;

    if (isSwipeRight || isSwipeDownFromTop) {
      handleCloseConversation();
    }
  };

  // Objectives Checker for Spoken Dialogue
  const checkUserObjectives = useCallback((userText: string) => {
    if (!activeScenario || !userText) return;
    const lower = userText.toLowerCase();
    activeScenario.objectives.forEach((obj) => {
      if (completedObjectives[obj.id]) return;
      const textMatch = obj.text.toLowerCase().split(' ').some(w => w.length > 3 && lower.includes(w));
      const vocabMatch = activeScenario.vocabularyDomain?.some(v => lower.includes(v.toLowerCase()));
      if (textMatch || vocabMatch) {
        setCompletedObjectives(prev => ({ ...prev, [obj.id]: true }));
      }
    });
  }, [activeScenario, completedObjectives]);

  // Handle explicit STOP of active voice call (halts call, keeps chat room open to read and interact)
  const handleStopConversation = useCallback(() => {
    console.log('[YOE LIVE] Stopping active voice call session (retaining chat history)...');
    if (liveSessionRef.current) {
      liveSessionRef.current.stop();
      liveSessionRef.current = null;
    }
    tutorPcmChunksRef.current = [];
    stopSpeaking();
    stopListening();
    setIsLiveApiActive(false);
    setLiveState('idle');
    setLiveEnergy(0);
    clearAudioError();
  }, [stopSpeaking, stopListening, clearAudioError]);

  // Prepare initial scenario state on mount with LIVE AI-generated greeting
  useEffect(() => {
    let isCancelled = false;
    if (activeScenario && activeJourney) {
      setIsLiveApiActive(false);
      setCompletedObjectives({});
      setLiveError(null);
      clearAudioError();

      const learnerProfile = {
        name: user?.name || activeJourney.learnerName,
        motivation: user?.motivation || activeJourney.motivation || activeJourney.goals,
        learningGoal: user?.learningGoal,
        focusAreas: user?.focusAreas || activeJourney.focusAreas
      };

      // Fetch live AI-generated initial greeting from Gemini
      fetch('/api/ai/initial-greeting', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          scenarioId: activeScenario.id,
          journeyId: activeJourney.id,
          lessonId: activeLesson?.id || (activeScenario as any).relatedLessonId || (activeScenario as any).lessonId,
          courseId: activeCourse?.id,
          targetLanguage: activeJourney.targetLanguage,
          supportLanguage: activeJourney.supportLanguage,
          cefrLevel: activeJourney.cefrLevel,
          learnerProfile
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
        liveSessionRef.current.stop();
        liveSessionRef.current = null;
      }
      stopSpeaking();
      stopListening();
    };
  }, [activeScenario]);

  // Scroll to bottom on new messages
  useEffect(() => {
    if (showTranscript) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isLoading, showTranscript]);

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

      const learnerProfile = {
        name: user?.name || activeJourney.learnerName,
        motivation: user?.motivation || activeJourney.motivation || activeJourney.goals,
        learningGoal: user?.learningGoal,
        focusAreas: user?.focusAreas || activeJourney.focusAreas
      };

      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          journeyId: activeJourney.id,
          scenarioId: activeScenario.id,
          lessonId: activeLesson?.id || (activeScenario as any).relatedLessonId || (activeScenario as any).lessonId,
          courseId: activeCourse?.id,
          userMessage: text.trim(),
          conversationHistory: updatedHistory,
          targetLanguage: activeJourney.targetLanguage,
          supportLanguage: activeJourney.supportLanguage,
          cefrLevel: activeJourney.cefrLevel,
          learnerProfile
        })
      });

      const data = await res.json();

      if (res.ok && data.message) {
        setMessages(prev => [...prev, data.message]);
        playNotificationSound();

        // Native audio playback with automatic re-listen loop upon audio completion
        const onPlaybackFinished = () => {
          if (!isLiveApiActive) {
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
    isLiveApiActive,
    startListening,
    user
  ]);

  // Handle explicit user gesture to START live voice call
  const handleStartVoiceSession = async () => {
    if (!activeScenario || !activeJourney) return;

    // Clean up any stale session completely before starting fresh
    if (liveSessionRef.current) {
      liveSessionRef.current.stop();
      liveSessionRef.current = null;
    }

    await resumeAudioContext();
    clearAudioError();
    setLiveError(null);
    playNotificationSound();
    tutorPcmChunksRef.current = [];

    const profile = {
      name: user?.name || activeJourney.learnerName,
      motivation: user?.motivation || activeJourney.motivation || activeJourney.goals,
      learningGoal: user?.learningGoal,
      focusAreas: user?.focusAreas || activeJourney.focusAreas
    };

    // 1. Attempt Gemini Live API connection
    const live = new GeminiLiveSession({
      journeyId: activeJourney.id,
      scenarioId: activeScenario.id,
      lessonId: activeLesson?.id || (activeScenario as any).relatedLessonId || (activeScenario as any).lessonId,
      courseId: activeCourse?.id,
      learnerProfile: profile,
      onStateChange: (st) => {
        if (st === 'connecting' || st === 'listening' || st === 'speaking' || st === 'thinking' || st === 'interrupted' || st === 'idle' || st === 'error') {
          setLiveState(st as VoiceBubbleState);
        }
      },
      onAudioEnergy: (energy) => {
        setLiveEnergy(energy);
      },
      onTranscriptChunk: (sender, text, isFinal) => {
        if (!text && !isFinal) return;

        setMessages((prev) => {
          // USER TURN: Stream into single interim buffer; commit exactly ONE message when finalized
          if (sender === 'user') {
            const withoutInterim = prev.filter((m) => m.id !== 'interim_user_voice');
            if (isFinal) {
              if (!text || !text.trim()) return withoutInterim;
              const committed: ChatMessage = {
                id: `usr_${Date.now()}`,
                sessionId: activeScenario.id,
                sender: 'user',
                text: text.trim(),
                timestamp: new Date().toISOString()
              };
              checkUserObjectives(text.trim());
              return [...withoutInterim, committed];
            } else {
              const interimMsg: ChatMessage = {
                id: 'interim_user_voice',
                sessionId: activeScenario.id,
                sender: 'user',
                text: text.trim(),
                timestamp: new Date().toISOString()
              };
              return [...withoutInterim, interimMsg];
            }
          }

          // TUTOR TURN: Stream parts, then commit with audioUrl on turn completion
          if (sender === 'tutor') {
            // Commit any active interim user message if tutor starts speaking
            let baseList = prev;
            const hadInterim = prev.find((m) => m.id === 'interim_user_voice');
            if (hadInterim && hadInterim.text.trim()) {
              const finalizedUser: ChatMessage = {
                id: `usr_${Date.now() - 50}`,
                sessionId: activeScenario.id,
                sender: 'user',
                text: hadInterim.text.trim(),
                timestamp: new Date().toISOString()
              };
              checkUserObjectives(hadInterim.text.trim());
              baseList = prev.map((m) => (m.id === 'interim_user_voice' ? finalizedUser : m));
            }

            const last = baseList[baseList.length - 1];
            if (isFinal) {
              if (last && last.sender === 'tutor' && last.id.startsWith('live_tutor_stream')) {
                const wavUrl = pcmChunksToWavDataUrl(tutorPcmChunksRef.current);
                tutorPcmChunksRef.current = [];
                const finalized: ChatMessage = {
                  ...last,
                  id: `tutor_${Date.now()}`,
                  audioUrl: wavUrl || undefined
                };
                return [...baseList.slice(0, -1), finalized];
              }
              tutorPcmChunksRef.current = [];
              return baseList;
            } else {
              if (last && last.sender === 'tutor' && last.id.startsWith('live_tutor_stream')) {
                return [...baseList.slice(0, -1), { ...last, text: last.text + text }];
              }
              const newTutorMsg: ChatMessage = {
                id: `live_tutor_stream_${Date.now()}`,
                sessionId: activeScenario.id,
                sender: 'tutor',
                text: text,
                timestamp: new Date().toISOString()
              };
              return [...baseList, newTutorMsg];
            }
          }

          return prev;
        });
      },
      onAudioChunk: (pcmBase64) => {
        try {
          const bytes = base64ToUint8Array(pcmBase64);
          tutorPcmChunksRef.current.push(bytes);
        } catch (e) {}
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
      setLiveError(null);
    } else {
      setIsLiveApiActive(false);
      setLiveState('error');
      setLiveError('Gemini Live connection unavailable. Please ensure microphone access is granted and tap Retry.');
    }
  };

  // Calculate current dynamic voice bubble state
  const getBubbleState = (): VoiceBubbleState => {
    if (micPermissionDenied || audioError) return 'error';
    if (isLiveApiActive) return liveState;
    if (isInterrupted) return 'interrupted';
    if (isListening) return 'listening';
    if (isLoading) return 'thinking';
    if (isSpeaking) return 'speaking';
    return 'idle';
  };

  const handleOpenSummary = () => {
    if (liveSessionRef.current) {
      liveSessionRef.current.stop();
      liveSessionRef.current = null;
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
  const isAllObjectivesCompleted = totalObjectives > 0 && completedCount >= totalObjectives;
  const bubbleState = getBubbleState();
  const currentEnergy = isLiveApiActive ? liveEnergy : audioEnergy;

  // Bubble scale: 2xl for hero presence
  const bubbleSize = isLiveApiActive ? '2xl' : 'xl';

  return (
    <div
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      className="flex flex-col h-[100dvh] w-full max-w-lg mx-auto bg-[var(--app-background)] dark:bg-[#070b12] text-[var(--text-primary)] relative overflow-hidden chat-container"
    >

      {/* Top Compact Scenario Glass Header Bar */}
      <div className="shrink-0 z-30 glass-header px-4 py-3 flex items-center justify-between safe-top-padding border-b border-white/10 dark:border-white/10 light-mode:border-slate-200">
          <button
            type="button"
            onClick={handleCloseConversation}
            className="p-2 rounded-full glass-pill hover:border-emerald-500/40 text-slate-300 dark:text-slate-300 light-mode:text-slate-700 transition-colors cursor-pointer"
            title={t.backToHome}
          >
            <ArrowLeft className="w-4 h-4" />
          </button>

        <div className="flex items-center gap-2 min-w-0 px-2 flex-1 ml-1">
          <div className="min-w-0 text-left">
            <h2 className="text-xs font-black text-slate-100 dark:text-slate-100 light-mode:text-slate-900 flex items-center justify-start gap-1.5 truncate tracking-tight">
              <span>YOE</span>
              <span className="px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 text-[9px] font-extrabold uppercase tracking-wide">
                {activeJourney?.cefrLevel || activeScenario.cefrLevel || 'A1'}
              </span>
            </h2>
            <p className="text-[10px] text-slate-400 dark:text-slate-400 light-mode:text-slate-500 truncate max-w-[200px] text-left">
              <span>{activeScenario.title}</span>
              {activeLesson && (
                <span className="text-emerald-400/80 font-medium"> • {activeLesson.title}</span>
              )}
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

          {/* Header Action: "Goals" before completion (opens objectives drawer), or "Complete ✓" once all objectives are finished */}
          {isAllObjectivesCompleted ? (
            <button
              onClick={handleOpenSummary}
              className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-[10px] font-bold text-white flex items-center gap-1.5 cursor-pointer shadow-md shadow-emerald-500/20 transition-all active:scale-95 animate-pulse"
              title={t.completeAndReview || 'Complete Scenario'}
            >
              <CheckCircle2 className="w-3.5 h-3.5 text-white" />
              <span className="text-white font-bold">Complete ✓</span>
            </button>
          ) : (
            <button
              onClick={() => setShowMissions(!showMissions)}
              className={`px-2.5 py-1.5 rounded-xl text-[10px] font-bold flex items-center gap-1.5 cursor-pointer transition-colors ${
                showMissions
                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                  : 'glass-pill text-slate-700 dark:text-slate-300 hover:border-emerald-500/40'
              }`}
              title="View Scenario Goals & Objectives"
            >
              <Target className="w-3.5 h-3.5 text-emerald-400" />
              <span>Goals</span>
            </button>
          )}

          <button
            onClick={() => setShowMissions(!showMissions)}
            className="px-2 py-1.5 rounded-xl glass-pill text-[10px] font-bold text-emerald-500 dark:text-emerald-400 flex items-center gap-1 cursor-pointer hover:border-emerald-500/40"
            title="Toggle Goals Overview"
          >
            <Target className="w-3 h-3 text-emerald-500 dark:text-emerald-400" />
            <span>{completedCount}/{totalObjectives}</span>
            {showMissions ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
          </button>
        </div>
      </div>

      {/* Collapsible Mission Objectives Drawer */}
      {showMissions && (
        <div className="glass-nav border-b border-slate-200 dark:border-white/10 p-4 animate-in slide-in-from-top duration-200 shadow-xl z-20">
          <h3 className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider mb-2 flex items-center justify-between">
            <span>{t.scenarioMissions}</span>
            <span className="text-emerald-600 dark:text-emerald-400 text-[11px] font-extrabold">
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
                      ? 'bg-emerald-50 border-emerald-200 text-emerald-800 dark:bg-emerald-500/10 dark:border-emerald-500/30 dark:text-emerald-300'
                      : 'bg-white border-slate-200 text-slate-800 dark:bg-slate-950/40 dark:border-white/5 dark:text-slate-300'
                  }`}
                >
                  {isDone ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                  ) : (
                    <Circle className="w-4 h-4 text-slate-400 dark:text-slate-500 shrink-0 mt-0.5" />
                  )}
                  <div className="flex-1">
                    <p className={`font-medium ${isDone ? 'line-through opacity-80' : ''}`}>{obj.text}</p>
                    {obj.hint && !isDone && (
                      <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-1 flex items-center gap-1">
                        <Lightbulb className="w-3 h-3 text-amber-500 dark:text-amber-400" />
                        <span>{t.hint}: {obj.hint}</span>
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {activeLesson && (
            <div className="mt-3 pt-3 border-t border-slate-200 dark:border-white/10">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[10px] font-black uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                  Curriculum Lesson
                </span>
                <span className="text-[10px] font-bold text-slate-600 dark:text-slate-400">
                  {activeCourse?.title || `${activeJourney?.targetLanguage.toUpperCase()} Curriculum`}
                </span>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-100 border-slate-200 text-slate-800 dark:bg-slate-900/60 dark:border-white/5 dark:text-slate-100 border">
                <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100">
                  {activeLesson.title}
                </h4>
                <p className="text-[10px] text-slate-600 dark:text-slate-400 mt-0.5">
                  {activeLesson.description}
                </p>
                {activeLesson.grammarFocus && activeLesson.grammarFocus.length > 0 && (
                  <div className="mt-1.5 flex flex-wrap gap-1">
                    {activeLesson.grammarFocus.map((g, idx) => (
                      <span key={idx} className="px-1.5 py-0.5 rounded bg-emerald-500/15 text-emerald-400 text-[9px] font-medium">
                        {g}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
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
            // Trigger tactile haptic vibration on touch (Requirement 22)
            if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
              try {
                navigator.vibrate([20, 30, 20]);
              } catch (e) {}
            }

            if (!isLiveApiActive) {
              handleStartVoiceSession();
            } else if (isLiveApiActive && liveSessionRef.current) {
              if (liveState === 'speaking') {
                liveSessionRef.current.handleInterruption();
              }
            } else if (isSpeaking) {
              stopSpeaking();
            }
          }}
          className="cursor-pointer transition-transform hover:scale-102 active:scale-98"
          title={!isLiveApiActive ? t.startConversation : isSpeaking || liveState === 'speaking' ? t.tapToInterrupt : t.tapToSpeak}
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
              !isLiveApiActive
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
            {isLiveApiActive
              ? bubbleState === 'speaking'
                ? t.yoeIsSpeaking
                : bubbleState === 'listening'
                ? t.listeningToYou
                : bubbleState === 'thinking'
                ? t.yoeIsThinking
                : bubbleState === 'interrupted'
                ? t.interrupted
                : t.tapToSpeak
              : isSpeaking
              ? t.yoeIsSpeaking
              : isListening
              ? t.listeningToYou
              : isLoading
              ? t.yoeIsThinking
              : t.tapToSpeak}
          </p>
          {isLiveApiActive && (
            <span className="text-emerald-400 text-[10px] font-black uppercase flex items-center gap-0.5 ml-1 tracking-wider">
              <Radio className="w-2.5 h-2.5" />
              <span>{t.live}</span>
            </span>
          )}
        </div>
      </div>

      {/* Main Conversation Messages Scroll Area */}
      {showTranscript ? (
        <div
          className="flex-1 overflow-y-auto px-4 pt-3 pb-3 space-y-3.5 no-scrollbar relative"
          style={{
            maskImage: 'linear-gradient(to bottom, transparent 0%, black 28px, black calc(100% - 8px), black 100%)',
            WebkitMaskImage: 'linear-gradient(to bottom, transparent 0%, black 28px, black calc(100% - 8px), black 100%)'
          }}
        >
            {messages.map((msg) => {
              const isUser = msg.sender === 'user';
              const isCurrentlyPlaying = playingMessageId === msg.id && isSpeaking;

              return (
                <div key={msg.id} className={`flex flex-col ${isUser ? 'items-end' : 'items-start'} space-y-1 animate-message-in`}>
                  <div
                    className={`max-w-[85%] rounded-3xl p-3.5 text-xs shadow-md transition-all ${
                      isUser
                        ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-semibold rounded-br-sm'
                        : 'glass-card text-slate-100 dark:text-slate-100 light-mode:text-slate-900 rounded-bl-sm'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-3 mb-1">
                      <span className={`text-[11px] font-bold ${isUser ? 'text-white/90' : 'text-emerald-400'}`}>
                        {isUser ? t.you : t.yoe}
                      </span>
                      {!isUser && (
                        <button
                          type="button"
                          onClick={() => replayMessage(msg.id, msg.text, msg.audioUrl, activeScenario?.characterName, activeScenario?.characterRole)}
                          className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                            playingMessageId === msg.id && isSpeaking
                              ? 'text-emerald-400 bg-emerald-500/20 animate-pulse'
                              : replayErrorId === msg.id
                              ? 'text-rose-400 bg-rose-500/20'
                              : 'text-slate-400 hover:text-emerald-400 hover:bg-white/5'
                          }`}
                          title={
                            playingMessageId === msg.id && isSpeaking
                              ? t.stopPlayback
                              : replayErrorId === msg.id
                              ? 'Audio playback error'
                              : t.listenToYoe
                          }
                        >
                          <Volume2 className={`w-3.5 h-3.5 ${playingMessageId === msg.id && isSpeaking ? 'stroke-[2.5] text-emerald-400' : replayErrorId === msg.id ? 'text-rose-400' : ''}`} />
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
                      <div className="flex items-center gap-1.5 text-amber-400 font-bold text-[10px]">
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
        )}

      {/* Structured Bottom Conversational Composer within Chat Viewport */}
      <div className="shrink-0 px-4 pt-1 pb-[max(env(safe-area-inset-bottom,0px),0.75rem)] z-30">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
          className="glass-card shadow-2xl p-2 rounded-3xl flex items-center gap-2 border border-white/10 dark:border-white/10 light-mode:border-slate-200"
        >
          {/* Real Microphone / Call Controls */}
          {isLiveApiActive ? (
            <>
              {/* Mute Button */}
              <button
                type="button"
                onClick={() => {
                  const next = !isMicMuted;
                  setIsMicMuted(next);
                  if (liveSessionRef.current) {
                    liveSessionRef.current.setMuted(next);
                  }
                }}
                className={`w-11 h-11 p-2.5 rounded-2xl flex items-center justify-center transition-all cursor-pointer shadow-sm shrink-0 border ${
                  isMicMuted
                    ? 'bg-rose-500/20 border-rose-500/40 text-rose-500'
                    : 'glass-pill border-white/10 dark:border-white/10 light-mode:border-slate-200 text-emerald-400 hover:border-emerald-500/40'
                }`}
                title={isMicMuted ? t.unmuteMic : t.muteMic}
                aria-label={isMicMuted ? t.unmuteMic : t.muteMic}
              >
                {isMicMuted ? (
                  <MicOff className="w-5 h-5 text-rose-500" />
                ) : (
                  <Mic className="w-5 h-5 text-emerald-400" />
                )}
              </button>

              {/* Stop Voice Call Button (Paired identically with Mute) */}
              <button
                type="button"
                onClick={handleStopConversation}
                className="w-11 h-11 p-2.5 rounded-2xl flex items-center justify-center transition-all cursor-pointer shadow-sm shrink-0 glass-pill border border-white/10 dark:border-white/10 light-mode:border-slate-200 text-rose-400 hover:border-rose-500/40"
                title="Stop voice call (re-read chat)"
                aria-label="Stop voice call"
              >
                <Square className="w-4 h-4 fill-current text-rose-400" />
              </button>
            </>
          ) : (
            <button
              type="button"
              onClick={handleStartVoiceSession}
              className="w-11 h-11 p-2.5 rounded-2xl bg-emerald-500/15 border border-emerald-500/35 text-emerald-500 hover:bg-emerald-500/25 shadow-sm transition-all cursor-pointer shrink-0 flex items-center justify-center"
              title="Start Live Voice Call"
              aria-label="Start Live Voice Call"
            >
              <Mic className="w-5 h-5 text-emerald-500" />
            </button>
          )}

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
            className="flex-1 chat-input-field bg-[#0d1422] dark:bg-[#0d1422] light-mode:bg-slate-100 border border-white/10 dark:border-white/10 light-mode:border-slate-200 rounded-2xl px-4 py-2.5 text-xs text-[var(--text-primary)] placeholder-slate-400 focus:outline-none focus:border-emerald-400 transition-colors"
          />

          {/* Send Button */}
          <button
            type="submit"
            disabled={!inputText.trim() || isLoading}
            className="w-11 h-11 p-2.5 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-white disabled:opacity-40 transition-all cursor-pointer shadow-md shrink-0 flex items-center justify-center"
          >
            <Send className="w-4 h-4 text-white" />
          </button>
        </form>
      </div>

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
          recommendations={recommendations}
          allScenarios={scenarios}
          onSelectScenario={(newScenarioId) => {
            setShowSummaryModal(false);
            const durationSecs = Math.max(1, Math.round((Date.now() - sessionStartTime) / 1000));
            completeScenario(activeScenario.id, {
              durationSeconds: durationSecs,
              durationMinutes: Math.max(1, Math.round(durationSecs / 60)),
              errorCount: sessionMistakes.length,
              xpEarned: 50 + (Object.keys(completedObjectives).length * 15)
            });
            setActiveScenarioId(newScenarioId);
          }}
          onClose={() => {
            setShowSummaryModal(false);
            const durationSecs = Math.max(1, Math.round((Date.now() - sessionStartTime) / 1000));
            completeScenario(activeScenario.id, {
              durationSeconds: durationSecs,
              durationMinutes: Math.max(1, Math.round(durationSecs / 60)),
              errorCount: sessionMistakes.length,
              xpEarned: 50 + (Object.keys(completedObjectives).length * 15)
            });
            refreshProgress();
            setActiveView('home');
          }}
          onRestart={() => {
            setShowSummaryModal(false);
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
            const durationSecs = Math.max(1, Math.round((Date.now() - sessionStartTime) / 1000));
            completeScenario(activeScenario.id, {
              durationSeconds: durationSecs,
              durationMinutes: Math.max(1, Math.round(durationSecs / 60)),
              errorCount: sessionMistakes.length,
              xpEarned: 50 + (Object.keys(completedObjectives).length * 15)
            });
            refreshProgress();
            setActiveView('home');
          }}
        />
      )}

    </div>
  );
};
