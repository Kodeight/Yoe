import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { useAudio } from '../context/AudioContext';
import { ChatMessage, ScenarioObjective, CorrectionDetail } from '../types';
import { YoeOrb, OrbState } from '../components/YoeOrb';
import {
  ArrowLeft,
  Mic,
  MicOff,
  Send,
  Volume2,
  Sparkles,
  CheckCircle2,
  Circle,
  ChevronDown,
  ChevronUp,
  Lightbulb,
  Award,
  Compass,
  MessageSquare
} from 'lucide-react';
import { SessionSummaryModal, SessionSummaryData } from '../components/SessionSummaryModal';

export const ConversationView: React.FC = () => {
  const { activeScenario, activeJourney, scenarios, setActiveScenarioId, setActiveView, refreshProgress } = useApp();
  const { isListening, transcript, startListening, stopListening, speakText, isSpeaking, playNotificationSound } = useAudio();

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showMissions, setShowMissions] = useState(false);
  const [completedObjectives, setCompletedObjectives] = useState<Record<string, boolean>>({});
  const [suggestedReplies, setSuggestedReplies] = useState<Array<{ phrase: string; translation: string }>>([]);
  const [showTranslations, setShowTranslations] = useState<Record<string, boolean>>({});
  const [expandedCorrections, setExpandedCorrections] = useState<Record<string, boolean>>({});

  // Session tracking
  const [sessionStartTime] = useState<number>(() => Date.now());
  const [sessionMistakes, setSessionMistakes] = useState<CorrectionDetail[]>([]);
  const [sessionVocab, setSessionVocab] = useState<Array<{ word: string; translation: string; phonetic?: string }>>([]);
  const [showSummaryModal, setShowSummaryModal] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Initialize conversation when scenario is selected
  useEffect(() => {
    if (activeScenario) {
      const initialGreetingMsg: ChatMessage = {
        id: `msg_init_${activeScenario.id}`,
        sessionId: activeScenario.id,
        sender: 'tutor',
        text: activeScenario.initialGreeting,
        translation: 'Greetings! Let us begin our scenario conversation.',
        timestamp: new Date().toISOString()
      };
      setMessages([initialGreetingMsg]);
      setCompletedObjectives({});
      speakText(activeScenario.initialGreeting, activeJourney?.targetLanguage);
    }
  }, [activeScenario]);

  // Sync speech recognition transcript
  useEffect(() => {
    if (transcript) {
      setInputText(transcript);
    }
  }, [transcript]);

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  // Calculate current dynamic orb visual state
  const getOrbState = (): OrbState => {
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
        speakText(data.message.text, activeJourney.targetLanguage);

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
    const elapsedMinutes = Math.max(1, Math.round((Date.now() - sessionStartTime) / 60000));
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
          <YoeOrb size="lg" state="idle" interactive />
          <h2 className="text-2xl font-black text-slate-100 dark:text-slate-100 light-mode:text-slate-900 tracking-tight">
            Ready to Speak?
          </h2>
          <p className="text-xs text-slate-400 dark:text-slate-400 light-mode:text-slate-600 leading-relaxed">
            Choose any realistic scenario world from our curriculum to start practicing speaking with your AI tutor.
          </p>

          <div className="pt-3 space-y-2.5">
            <button
              onClick={() => setActiveView('explore')}
              className="w-full py-3 rounded-2xl bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-400 text-slate-950 font-black text-xs flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 cursor-pointer hover:opacity-95"
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
          Tap any scenario card to enter interactive dialogue
        </div>
      </div>
    );
  }

  const completedCount = Object.values(completedObjectives).filter(Boolean).length;
  const totalObjectives = activeScenario.objectives.length;

  return (
    <div className="flex flex-col h-[100dvh] max-w-md mx-auto bg-[var(--bg-primary)] text-slate-100">

      {/* Top Scenario Glass Bar */}
      <div className="sticky top-0 z-30 glass-header px-4 py-2.5 flex items-center justify-between safe-top-padding">
        <button
          onClick={() => setActiveView('home')}
          className="p-2 rounded-full glass-pill hover:border-emerald-500/40 text-slate-300 dark:text-slate-300 light-mode:text-slate-700 transition-colors cursor-pointer"
          title="Back to Home"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>

        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-8 h-8 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-sm shrink-0">
            {activeScenario.avatar}
          </div>
          <div className="min-w-0">
            <h2 className="text-xs font-bold text-slate-100 dark:text-slate-100 light-mode:text-slate-900 flex items-center gap-1.5 truncate">
              <span>{activeScenario.characterName}</span>
              <span className="px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-400 text-[9px] font-extrabold uppercase">
                {activeScenario.cefrLevel}
              </span>
            </h2>
            <p className="text-[10px] text-slate-400 dark:text-slate-400 light-mode:text-slate-500 truncate max-w-[150px]">
              {activeScenario.title}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
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
            className="px-2.5 py-1 rounded-full glass-pill text-[10px] font-bold text-emerald-400 flex items-center gap-1 cursor-pointer"
          >
            <Sparkles className="w-3 h-3 text-emerald-400" />
            <span>{completedCount}/{totalObjectives}</span>
            {showMissions ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
          </button>
        </div>
      </div>

      {/* Collapsible Mission Objectives Drawer */}
      {showMissions && (
        <div className="glass-nav border-b border-white/10 dark:border-white/10 light-mode:border-slate-200 p-4 animate-in slide-in-from-top duration-200 shadow-xl">
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

      {/* Main Conversation Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
        {/* Subtle Reactive AI Visual Presence at top */}
        <div className="py-2 flex justify-center">
          <YoeOrb size="sm" state={getOrbState()} />
        </div>

        {messages.map((msg) => {
          const isUser = msg.sender === 'user';
          return (
            <div key={msg.id} className={`flex flex-col ${isUser ? 'items-end' : 'items-start'} space-y-1`}>
              <div
                className={`max-w-[85%] rounded-3xl p-4 text-xs shadow-md transition-all ${
                  isUser
                    ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 font-semibold rounded-br-sm'
                    : 'glass-card text-slate-100 dark:text-slate-100 light-mode:text-slate-900 rounded-bl-sm'
                }`}
              >
                <div className="flex items-center justify-between gap-3 mb-1">
                  <span className={`text-[10px] font-extrabold uppercase tracking-wider ${isUser ? 'text-slate-900/70' : 'text-emerald-400'}`}>
                    {isUser ? 'You' : activeScenario.characterName}
                  </span>
                  {!isUser && (
                    <button
                      onClick={() => speakText(msg.text, activeJourney?.targetLanguage)}
                      className="text-slate-400 hover:text-emerald-400 transition-colors cursor-pointer"
                      title="Listen"
                    >
                      <Volume2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                <p className="leading-relaxed text-[13px]">{msg.text}</p>

                {/* Translation view for tutor messages */}
                {!isUser && msg.translation && (
                  <div className="mt-2 pt-2 border-t border-white/10 dark:border-white/10 light-mode:border-slate-200">
                    {showTranslations[msg.id] ? (
                      <p className="text-[11px] text-slate-400 dark:text-slate-400 light-mode:text-slate-600 italic">
                        {msg.translation}
                      </p>
                    ) : (
                      <button
                        onClick={() => setShowTranslations(prev => ({ ...prev, [msg.id]: true }))}
                        className="text-[10px] font-bold text-emerald-400 hover:underline cursor-pointer"
                      >
                        Show Translation
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
          <div className="flex items-center gap-2 p-3 rounded-2xl glass-card max-w-[160px]">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
            <span className="text-xs text-slate-400">{activeScenario.characterName} is replying...</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Suggested Quick Replies Carousel */}
      {suggestedReplies.length > 0 && !isLoading && (
        <div className="px-4 py-2 flex gap-2 overflow-x-auto no-scrollbar">
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

      {/* Bottom Sticky Conversational Input Controls */}
      <div className="sticky bottom-0 glass-nav p-3 safe-bottom-padding border-t border-white/10 dark:border-white/10 light-mode:border-slate-200">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
          className="flex items-center gap-2"
        >
          {/* Speech Mic Button */}
          <button
            type="button"
            onClick={isListening ? () => stopListening() : () => startListening()}
            className={`p-3 rounded-2xl transition-all cursor-pointer ${
              isListening
                ? 'bg-rose-500 text-white animate-pulse shadow-lg shadow-rose-500/40'
                : 'glass-pill text-emerald-400 hover:border-emerald-500/40 hover:bg-emerald-500/10'
            }`}
            title={isListening ? 'Stop recording' : 'Speak with microphone'}
          >
            {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
          </button>

          {/* Text Input */}
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder={isListening ? 'Listening to your voice...' : `Reply to ${activeScenario.characterName}...`}
            className="flex-1 bg-slate-950/60 dark:bg-slate-950/60 light-mode:bg-white border border-white/10 dark:border-white/10 light-mode:border-slate-200 rounded-2xl px-4 py-3 text-xs text-slate-100 dark:text-slate-100 light-mode:text-slate-900 placeholder-slate-500 focus:outline-none focus:border-emerald-400 transition-colors"
          />

          {/* Send Button */}
          <button
            type="submit"
            disabled={!inputText.trim() || isLoading}
            className="p-3 rounded-2xl bg-gradient-to-r from-emerald-400 to-teal-400 text-slate-950 disabled:opacity-40 transition-all cursor-pointer shadow-md"
          >
            <Send className="w-4 h-4" />
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
          onClose={() => {
            setShowSummaryModal(false);
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
