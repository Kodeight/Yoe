import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { useAudio } from '../context/AudioContext';
import { ChatMessage, CorrectionDetail } from '../types';
import { VoiceBubble, VoiceBubbleState } from '../components/VoiceBubble';
import { GeminiLiveSession } from '../utils/geminiLiveClient';
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
  const { activeScenario, activeJourney, scenarios, setActiveScenarioId, setActiveView, refreshProgress } = useApp();
  const {
    isListening,
    transcript,
    isSpeaking,
    isInterrupted,
    audioEnergy,
    micStatus,
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
    clearAudioError
  } = useAudio();

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

  // Prepare initial scenario state on mount WITHOUT autostarting audio/mic
  useEffect(() => {
    if (activeScenario && activeJourney) {
      setHasStartedConversation(false);
      setIsLiveApiActive(false);
      setCompletedObjectives({});
      setLiveError(null);
      clearAudioError();

      const initialGreetingMsg: ChatMessage = {
        id: `msg_init_${activeScenario.id}`,
        sessionId: activeScenario.id,
        sender: 'tutor',
        text: activeScenario.initialGreeting,
        translation: 'Greetings! Let us begin our scenario conversation.',
        timestamp: new Date().toISOString()
      };
      setMessages([initialGreetingMsg]);
    }

    return () => {
      if (liveSessionRef.current) {
        liveSessionRef.current.cleanup();
        liveSessionRef.current = null;
      }
      stopSpeaking();
      stopListening();
    };
  }, [activeScenario]);

  // Sync speech recognition transcript into text input
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
      // Speak initial greeting via fallback mode
      speakText(
        activeScenario.initialGreeting,
        activeJourney.targetLanguage,
        activeScenario.characterName,
        activeScenario.characterRole
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

  const handleSendMessage = async (textToSend?: string) => {
    const text = textToSend || inputText;
    if (!text.trim() || !activeScenario || !activeJourney || isLoading) return;

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
      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          journeyId: activeJourney.id,
          scenarioId: activeScenario.id,
          userMessage: text.trim(),
          conversationHistory: messages.map(m => ({ sender: m.sender, text: m.text }))
        })
      });

      const data = await res.json();

      if (data.message) {
        setMessages(prev => [...prev, data.message]);
        playNotificationSound();

        // Native audio playback or fallback
        if (data.aiResponse?.audioBase64) {
          playGeminiAudio(data.aiResponse.audioBase64);
        } else {
          speakText(
            data.message.text,
            activeJourney.targetLanguage,
            activeScenario.characterName,
            activeScenario.characterRole
          );
        }

        // Track completed objectives
        if (data.aiResponse?.completedObjectiveIds) {
          const updated = { ...completedObjectives };
          data.aiResponse.completedObjectiveIds.forEach((id: string) => {
            updated[id] = true;
          });
          setCompletedObjectives(updated);
        }

        // Suggested next replies
        if (data.aiResponse?.suggestedNextReplies) {
          setSuggestedReplies(data.aiResponse.suggestedNextReplies);
        }

        // Track mistakes
        if (data.aiResponse?.correction) {
          setSessionMistakes(prev => [...prev, data.aiResponse.correction]);
        }

        // Track vocabulary
        if (data.aiResponse?.vocabulary) {
          setSessionVocab(prev => [...prev, ...data.aiResponse.vocabulary]);
        }
      }
    } catch (err) {
      console.error('AI chat processing error:', err);
    } finally {
      setIsLoading(false);
    }
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
          <span className="text-xs font-bold text-slate-400">Yoe Conversation</span>
          <div className="w-9" />
        </div>

        <div className="max-w-sm mx-auto text-center space-y-4 my-auto">
          <VoiceBubble size="lg" state="idle" interactive />
          <h2 className="text-2xl font-black text-slate-100 dark:text-slate-100 light-mode:text-slate-900 tracking-tight">
            Ready to Speak?
          </h2>
          <p className="text-xs text-slate-400 dark:text-slate-400 light-mode:text-slate-600 leading-relaxed">
            Choose any realistic scenario world from our curriculum to start having live voice conversations with Yoe.
          </p>

          <div className="pt-3 space-y-2.5">
            <button
              onClick={() => setActiveView('explore')}
              className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-400 text-slate-950 font-black text-xs flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 cursor-pointer hover:opacity-95"
            >
              <Compass className="w-4 h-4" />
              <span>Explore Scenario Worlds</span>
            </button>

            {fallbackScenario && (
              <button
                onClick={() => {
                  setActiveScenarioId(fallbackScenario.id);
                }}
                className="w-full py-3 rounded-2xl glass-pill text-xs font-bold text-slate-200 dark:text-slate-200 light-mode:text-slate-800 hover:border-emerald-500/40 cursor-pointer"
              >
                Quick Start: {fallbackScenario.title}
              </button>
            )}
          </div>
        </div>

        <div className="text-center text-[11px] text-slate-500 py-2">
          Tap any scenario card to enter live conversation
        </div>
      </div>
    );
  }

  const completedCount = Object.values(completedObjectives).filter(Boolean).length;
  const totalObjectives = activeScenario.objectives.length;
  const bubbleState = getBubbleState();
  const currentEnergy = isLiveApiActive ? liveEnergy : audioEnergy;

  return (
    <div className="flex flex-col h-[100dvh] max-w-md mx-auto bg-[var(--bg-primary)] text-slate-100 relative overflow-hidden">

      {/* Top Compact Scenario Glass Header Bar */}
      <div className="shrink-0 z-30 glass-header px-4 py-2.5 flex items-center justify-between safe-top-padding">
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
          title="Back to Home"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>

        <div className="flex items-center gap-2 min-w-0">
          <div className="w-8 h-8 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-sm shrink-0">
            {activeScenario.avatar}
          </div>
          <div className="min-w-0">
            <h2 className="text-xs font-bold text-slate-100 dark:text-slate-100 light-mode:text-slate-900 flex items-center gap-1.5 truncate">
              <span>Yoe</span>
              <span className="px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-400 text-[9px] font-extrabold uppercase">
                {activeScenario.cefrLevel}
              </span>
            </h2>
            <p className="text-[10px] text-slate-400 dark:text-slate-400 light-mode:text-slate-500 truncate max-w-[170px]">
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
            title={showTranscript ? 'Hide transcript' : 'Show transcript'}
          >
            <MessageSquare className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={handleOpenSummary}
            className="px-2.5 py-1 rounded-full bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/25 text-[10px] font-bold text-emerald-400 flex items-center gap-1 cursor-pointer transition-colors"
            title="Complete and review session"
          >
            <Award className="w-3.5 h-3.5" />
            <span>Finish</span>
          </button>

          <button
            onClick={() => setShowMissions(!showMissions)}
            className="px-2 py-1 rounded-full glass-pill text-[10px] font-bold text-emerald-400 flex items-center gap-1 cursor-pointer"
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
            <span>Scenario Missions</span>
            <span className="text-emerald-400 text-[11px] font-extrabold">
              {completedCount} of {totalObjectives} Completed
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
                        <span>Hint: {obj.hint}</span>
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
                {micPermissionDenied ? 'Microphone Permission Needed' : 'Audio Device Notice'}
              </h4>
              <p className="text-[11px] text-[var(--error-text)] opacity-95 mt-1 leading-relaxed font-normal break-words">
                {audioError || 'Please allow microphone access in your browser or device settings so Yoe can hear your voice.'}
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
                  <span>Retry Microphone</span>
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
            } else if (!isListening) {
              startListening(activeJourney?.targetLanguage);
            } else {
              stopListening();
            }
          }}
          className="cursor-pointer transition-transform hover:scale-102 active:scale-98"
          title={!hasStartedConversation ? 'Start Conversation' : isSpeaking || liveState === 'speaking' ? 'Tap to interrupt' : isListening ? 'Tap to finish' : 'Tap to speak'}
        >
          <VoiceBubble
            size="md"
            state={bubbleState}
            audioEnergy={currentEnergy}
            interactive
          />
        </div>

        {/* Dynamic Voice State Badge */}
        <div className="mt-0.5 flex items-center gap-1.5 px-3 py-0.5 rounded-full glass-pill text-[10px] font-semibold text-slate-300 dark:text-slate-300 light-mode:text-slate-700">
          <span
            className={`w-2 h-2 rounded-full ${
              !hasStartedConversation
                ? 'bg-emerald-500/40'
                : bubbleState === 'speaking'
                ? 'bg-emerald-400 animate-pulse'
                : bubbleState === 'listening'
                ? 'bg-cyan-400 animate-ping'
                : bubbleState === 'thinking'
                ? 'bg-blue-400 animate-pulse'
                : bubbleState === 'interrupted'
                ? 'bg-amber-400'
                : 'bg-emerald-500/60'
            }`}
          />
          <span>
            {!hasStartedConversation
              ? 'Ready to speak with Yoe'
              : bubbleState === 'speaking'
              ? 'Yoe is speaking'
              : bubbleState === 'listening'
              ? 'Listening to your voice...'
              : bubbleState === 'thinking'
              ? 'Yoe is thinking...'
              : bubbleState === 'interrupted'
              ? 'Interrupted'
              : 'Tap to speak with Yoe'}
          </span>
          {isLiveApiActive && (
            <span className="ml-1 px-1.5 py-0.2 rounded-full bg-emerald-500/20 text-emerald-400 text-[9px] font-black uppercase flex items-center gap-0.5">
              <Radio className="w-2.5 h-2.5" />
              <span>Live</span>
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
              Practice authentic dialogue at {activeScenario.location}. Press Start to begin speaking with Yoe.
            </p>
          </div>

          <button
            onClick={handleStartConversation}
            className="w-full max-w-xs py-4 px-6 rounded-2xl bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-400 text-slate-950 font-black text-sm flex items-center justify-center gap-2.5 shadow-xl shadow-emerald-500/25 hover:shadow-emerald-500/40 hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer"
          >
            <Play className="w-5 h-5 fill-current" />
            <span>Start Conversation</span>
          </button>
        </div>
      ) : (
        /* Main Conversation Messages Scroll Area after Start */
        showTranscript ? (
          <div className="flex-1 overflow-y-auto px-4 py-2 space-y-3.5 no-scrollbar pb-[var(--conversation-bottom-space)]">
            {messages.map((msg) => {
              const isUser = msg.sender === 'user';
              return (
                <div key={msg.id} className={`flex flex-col ${isUser ? 'items-end' : 'items-start'} space-y-1`}>
                  <div
                    className={`max-w-[85%] rounded-3xl p-3.5 text-xs shadow-md transition-all ${
                      isUser
                        ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 font-semibold rounded-br-sm'
                        : 'glass-card text-slate-100 dark:text-slate-100 light-mode:text-slate-900 rounded-bl-sm'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-3 mb-1">
                      <span className={`text-[10px] font-extrabold uppercase tracking-wider ${isUser ? 'text-slate-900/70' : 'text-emerald-400'}`}>
                        {isUser ? 'You' : 'Yoe'}
                      </span>
                      {!isUser && (
                        <button
                          onClick={() =>
                            speakText(
                              msg.text,
                              activeJourney?.targetLanguage,
                              activeScenario.characterName,
                              activeScenario.characterRole
                            )
                          }
                          className="text-slate-400 hover:text-emerald-400 transition-colors cursor-pointer"
                          title="Listen"
                        >
                          <Volume2 className="w-3.5 h-3.5" />
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
                            onClick={() => setShowTranslations(prev => ({ ...prev, [msg.id]: true }))}
                            className="text-[10px] font-bold text-emerald-400 hover:underline cursor-pointer flex items-center gap-1"
                          >
                            <Languages className="w-3 h-3" />
                            <span>Translate</span>
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
                        <span>Yoe Gentle Coaching</span>
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
                <span className="text-xs text-slate-400">Yoe is replying...</span>
              </div>
            )}

            {/* Generous visual breathing spacer before bottom composer boundary */}
            <div className="h-8 shrink-0 pointer-events-none" />
            <div ref={messagesEndRef} />
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

      {/* Suggested Quick Replies Carousel */}
      {hasStartedConversation && suggestedReplies.length > 0 && !isLoading && (
        <div className="px-4 py-1.5 flex gap-2 overflow-x-auto no-scrollbar shrink-0 z-20">
          {suggestedReplies.map((reply, idx) => (
            <button
              key={idx}
              onClick={() => handleSendMessage(reply.phrase)}
              className="glass-pill px-3 py-1.5 rounded-full text-xs text-emerald-400 hover:border-emerald-500/40 hover:bg-emerald-500/10 transition-colors whitespace-nowrap cursor-pointer shrink-0"
            >
              <span>{reply.phrase}</span>
              <span className="text-[10px] text-slate-400 ml-1.5 opacity-80">({reply.translation})</span>
            </button>
          ))}
        </div>
      )}

      {/* Fixed Conversational Input Controls Floating Above Floating Bottom Navbar */}
      {hasStartedConversation && (
        <div className="fixed bottom-0 left-0 right-0 z-30 pointer-events-none">
          <div className="max-w-md mx-auto px-4 pb-[calc(4.2rem+max(env(safe-area-inset-bottom,0px),0.5rem))] pointer-events-auto">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendMessage();
              }}
              className="glass-nav p-2.5 rounded-3xl flex items-center gap-2 shadow-2xl border border-white/10 dark:border-white/10 light-mode:border-slate-200"
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
                    ? 'bg-amber-500 text-slate-950 font-bold hover:bg-amber-400 animate-pulse'
                    : isListening || liveState === 'listening'
                    ? 'bg-rose-500 text-white animate-pulse shadow-rose-500/40'
                    : 'glass-pill text-emerald-400 hover:border-emerald-500/40 hover:bg-emerald-500/10'
                }`}
                title={isSpeaking || liveState === 'speaking' ? 'Tap to interrupt' : isListening ? 'Stop & Send' : 'Speak with microphone'}
              >
                {isSpeaking || liveState === 'speaking' ? (
                  <Square className="w-5 h-5 fill-current" />
                ) : isListening || liveState === 'listening' ? (
                  <MicOff className="w-5 h-5" />
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
                    ? 'Listening to your voice...'
                    : isSpeaking || liveState === 'speaking'
                    ? 'Tap mic to interrupt and speak...'
                    : 'Reply to Yoe...'
                }
                className="flex-1 bg-slate-950/60 dark:bg-slate-950/60 light-mode:bg-white border border-white/10 dark:border-white/10 light-mode:border-slate-200 rounded-2xl px-4 py-2.5 text-xs text-slate-100 dark:text-slate-100 light-mode:text-slate-900 placeholder-slate-500 focus:outline-none focus:border-emerald-400 transition-colors"
              />

              {/* Send Button */}
              <button
                type="submit"
                disabled={!inputText.trim() || isLoading}
                className="p-3 rounded-2xl bg-gradient-to-r from-emerald-400 to-teal-400 text-slate-950 disabled:opacity-40 transition-all cursor-pointer shadow-md shrink-0"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
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
                translation: 'Greetings! Let us begin our scenario conversation.',
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
