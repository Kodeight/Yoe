import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useApp } from '../context/AppContext';
import { useAudio } from '../context/AudioContext';
import { ChatMessage, ScenarioObjective, CorrectionDetail } from '../types';
import { ArrowLeft, Mic, MicOff, Send, Volume2, Sparkles, CheckCircle2, Circle, ChevronDown, ChevronUp, Lightbulb, AlertCircle, Award } from 'lucide-react';
import { recordDayActivity } from '../utils/streakManager';
import { SessionSummaryModal, SessionSummaryData } from '../components/SessionSummaryModal';
import { addDailyGoalProgress } from '../components/DailyLearningGoalCard';

export const ConversationView: React.FC = () => {
  const { activeScenario, activeJourney, setActiveView, refreshProgress } = useApp();
  const { isListening, transcript, startListening, stopListening, speakText, isSpeaking, playNotificationSound } = useAudio();

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showMissions, setShowMissions] = useState(false);
  const [completedObjectives, setCompletedObjectives] = useState<Record<string, boolean>>({});
  const [suggestedReplies, setSuggestedReplies] = useState<Array<{ phrase: string; translation: string }>>([]);
  const [showTranslations, setShowTranslations] = useState<Record<string, boolean>>({});
  const [expandedCorrections, setExpandedCorrections] = useState<Record<string, boolean>>({});

  // Session summary state
  const [sessionStartTime] = useState<number>(() => Date.now());
  const [sessionMistakes, setSessionMistakes] = useState<CorrectionDetail[]>([]);
  const [sessionVocab, setSessionVocab] = useState<Array<{ word: string; translation: string; phonetic?: string }>>([]);
  const [showSummaryModal, setShowSummaryModal] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Initialize conversation history
  useEffect(() => {
    if (activeScenario) {
      const initialGreetingMsg: ChatMessage = {
        id: `msg_init_${activeScenario.id}`,
        sessionId: activeScenario.id,
        sender: 'tutor',
        text: activeScenario.initialGreeting,
        translation: 'Hello! Welcome. What would you like to order today?',
        timestamp: new Date().toISOString()
      };
      setMessages([initialGreetingMsg]);

      // Speak initial greeting automatically
      speakText(activeScenario.initialGreeting, activeJourney?.targetLanguage);
    }
  }, [activeScenario]);

  // Sync speech recognition transcript to input field
  useEffect(() => {
    if (transcript) {
      setInputText(transcript);
    }
  }, [transcript]);

  // Auto scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

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

      if (data.replyMessage) {
        setMessages(prev => [...prev, data.replyMessage]);
        playNotificationSound();
        speakText(data.replyMessage.text, activeJourney.targetLanguage);

        // Update objectives if fulfilled
        if (data.aiResult?.completedObjectiveIds) {
          setCompletedObjectives(prev => {
            const next = { ...prev };
            data.aiResult.completedObjectiveIds.forEach((id: string) => {
              next[id] = true;
            });
            return next;
          });
        }

        // Update suggested replies
        if (data.aiResult?.suggestedNextReplies) {
          setSuggestedReplies(data.aiResult.suggestedNextReplies);
        }

        // Accumulate mistakes for end-of-session review
        if (data.aiResult?.correction) {
          setSessionMistakes(prev => [...prev, data.aiResult.correction]);
        }

        // Accumulate vocabulary learned
        if (data.aiResult?.vocabulary && data.aiResult.vocabulary.length > 0) {
          setSessionVocab(prev => {
            const existingWords = new Set(prev.map(v => v.word.toLowerCase()));
            const newWords = data.aiResult.vocabulary.filter((v: any) => !existingWords.has(v.word.toLowerCase()));
            return [...prev, ...newWords];
          });
        }

        // Record streak activity for today
        recordDayActivity();
        refreshProgress();
      }
    } catch (err) {
      console.error('Error sending message:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleTranslation = (msgId: string) => {
    setShowTranslations(prev => ({ ...prev, [msgId]: !prev[msgId] }));
  };

  const toggleCorrection = (msgId: string) => {
    setExpandedCorrections(prev => ({ ...prev, [msgId]: !prev[msgId] }));
  };

  const handleOpenSummary = () => {
    const elapsedMinutes = Math.max(1, Math.round((Date.now() - sessionStartTime) / 60000));
    // Contribute to user's daily learning goal
    addDailyGoalProgress('minutes', elapsedMinutes);
    addDailyGoalProgress('lessons', 1);
    setShowSummaryModal(true);
  };

  const handleRestartSession = () => {
    setShowSummaryModal(false);
    setSessionMistakes([]);
    setSessionVocab([]);
    if (activeScenario) {
      const initialGreetingMsg: ChatMessage = {
        id: `msg_init_${activeScenario.id}_${Date.now()}`,
        sessionId: activeScenario.id,
        sender: 'tutor',
        text: activeScenario.initialGreeting,
        translation: 'Hello! Welcome. What would you like to order today?',
        timestamp: new Date().toISOString()
      };
      setMessages([initialGreetingMsg]);
      setCompletedObjectives({});
    }
  };

  const completedObjsList = activeScenario?.objectives.filter(o => completedObjectives[o.id]) || [];
  const allObjectivesCompleted = (activeScenario?.objectives.length || 0) > 0 &&
    completedObjsList.length === activeScenario?.objectives.length;

  if (!activeScenario) {
    return (
      <div className="p-8 text-center text-slate-400">
        No active scenario selected. Please pick one from Explore!
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen max-w-md mx-auto bg-[#0b0f17] text-slate-100">

      {/* Top Header */}
      <div className="sticky top-0 z-30 bg-slate-900/90 backdrop-blur-xl border-b border-white/10 px-4 py-3 flex items-center justify-between">
        <button
          onClick={() => setActiveView('home')}
          className="p-2 rounded-full hover:bg-slate-800 text-slate-300 transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-2xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-lg shrink-0">
            {activeScenario.avatar}
          </div>
          <div>
            <h2 className="text-xs font-bold text-slate-100 flex items-center gap-1.5">
              <span>{activeScenario.characterName}</span>
              <span className="px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-400 text-[9px] font-extrabold uppercase">
                {activeScenario.cefrLevel}
              </span>
            </h2>
            <p className="text-[10px] text-slate-400 truncate max-w-[160px]">
              {activeScenario.title} • {activeScenario.location}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          {/* End & Review Session Button */}
          <button
            onClick={handleOpenSummary}
            className="px-2.5 py-1 rounded-full bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/30 text-[11px] font-bold text-emerald-300 flex items-center gap-1 cursor-pointer transition-colors"
            title="Finish session and view mistakes & vocabulary summary"
          >
            <Award className="w-3.5 h-3.5 text-emerald-400" />
            <span className="hidden sm:inline">Review</span>
          </button>

          {/* Missions Toggle Button */}
          <button
            onClick={() => setShowMissions(!showMissions)}
            className="px-2.5 py-1 rounded-full bg-slate-800 border border-white/10 text-[11px] font-bold text-emerald-400 flex items-center gap-1 cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
            <span>Missions</span>
            {showMissions ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* Collapsible Missions Drawer */}
      {showMissions && (
        <div className="bg-slate-900/95 border-b border-white/10 p-4 animate-in slide-in-from-top duration-200">
          <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider mb-2 flex items-center justify-between">
            <span>Scenario Objectives</span>
            <span className="text-emerald-400 text-[11px]">
              {Object.values(completedObjectives).filter(Boolean).length} / {activeScenario.objectives.length} completed
            </span>
          </h3>
          <div className="space-y-2">
            {activeScenario.objectives.map((obj) => {
              const isDone = completedObjectives[obj.id];
              return (
                <div key={obj.id} className="flex items-start gap-2 text-xs">
                  {isDone ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  ) : (
                    <Circle className="w-4 h-4 text-slate-600 shrink-0 mt-0.5" />
                  )}
                  <span className={isDone ? 'line-through text-slate-400' : 'text-slate-200 font-medium'}>
                    {obj.text}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        <AnimatePresence initial={false}>
          {messages.map((msg, index) => {
            const isTutor = msg.sender === 'tutor';
            const isShowingTranslation = showTranslations[msg.id];
            const hasCorrection = msg.correction;
            const isCorrectionExpanded = expandedCorrections[msg.id];

            return (
              <motion.div
                key={msg.id}
                initial={{
                  opacity: 0,
                  y: 16,
                  scale: 0.94,
                  x: isTutor ? -12 : 12
                }}
                animate={{
                  opacity: 1,
                  y: 0,
                  scale: 1,
                  x: 0
                }}
                transition={{
                  type: 'spring',
                  stiffness: 380,
                  damping: 28,
                  mass: 0.8
                }}
                className={`flex flex-col ${isTutor ? 'items-start' : 'items-end'} gap-1.5`}
              >
                {/* Message Bubble */}
                <div className="flex items-end gap-2 max-w-[85%]">
                  {isTutor && (
                    <motion.div
                      initial={{ scale: 0, rotate: -20 }}
                      animate={{ scale: 1, rotate: 0 }}
                      transition={{ delay: 0.05, duration: 0.2 }}
                      className="w-7 h-7 rounded-full bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-sm shrink-0 mb-1 shadow-sm"
                    >
                      {activeScenario.avatar}
                    </motion.div>
                  )}

                  <motion.div
                    whileHover={{ scale: 1.01 }}
                    transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                    className={`rounded-2xl p-3.5 text-xs leading-relaxed shadow-md relative ${
                      isTutor
                        ? 'bg-slate-900 border border-white/10 text-slate-100 rounded-bl-none'
                        : 'bg-gradient-to-tr from-emerald-600 to-teal-500 text-white font-medium rounded-br-none'
                    }`}
                  >
                    <p>{msg.text}</p>

                    {/* Translation if available */}
                    <AnimatePresence>
                      {isTutor && msg.translation && isShowingTranslation && (
                        <motion.p
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          transition={{ duration: 0.2 }}
                          className="mt-2 pt-2 border-t border-white/10 text-[11px] text-teal-300 italic"
                        >
                          "{msg.translation}"
                        </motion.p>
                      )}
                    </AnimatePresence>

                    {/* Tutor Actions Bar */}
                    {isTutor && (
                      <div className="mt-2.5 pt-2 border-t border-white/10 flex items-center gap-3 text-[10px] text-slate-400">
                        <button
                          onClick={() => speakText(msg.text, activeJourney?.targetLanguage)}
                          className={`flex items-center gap-1 hover:text-emerald-400 transition-colors cursor-pointer ${
                            isSpeaking ? 'text-emerald-400 animate-pulse' : ''
                          }`}
                        >
                          <Volume2 className="w-3.5 h-3.5" />
                          <span>Listen</span>
                        </button>

                        {msg.translation && (
                          <button
                            onClick={() => toggleTranslation(msg.id)}
                            className="hover:text-teal-300 transition-colors cursor-pointer"
                          >
                            {isShowingTranslation ? 'Hide Translation' : 'Translate'}
                          </button>
                        )}
                      </div>
                    )}
                  </motion.div>
                </div>

                {/* Expandable Gentle Correction Card for User Messages */}
                {!isTutor && hasCorrection && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9, y: 8 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    transition={{ delay: 0.15, duration: 0.25 }}
                    className="max-w-[85%] mt-1 rounded-2xl bg-amber-500/10 border border-amber-500/20 p-2.5 text-xs shadow-sm"
                  >
                    <button
                      onClick={() => toggleCorrection(msg.id)}
                      className="w-full flex items-center justify-between text-amber-400 font-bold text-[11px] cursor-pointer"
                    >
                      <div className="flex items-center gap-1.5">
                        <AlertCircle className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                        <span>Gentle Correction Tip</span>
                      </div>
                      {isCorrectionExpanded ? (
                        <ChevronUp className="w-3.5 h-3.5" />
                      ) : (
                        <ChevronDown className="w-3.5 h-3.5" />
                      )}
                    </button>

                    <AnimatePresence>
                      {isCorrectionExpanded && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          transition={{ duration: 0.2 }}
                          className="mt-2 pt-2 border-t border-amber-500/20 text-[11px] space-y-1.5 text-slate-200"
                        >
                          <div>
                            <span className="text-red-400 line-through mr-1">
                              {msg.correction?.original}
                            </span>
                            <span className="text-emerald-400 font-bold">
                              → {msg.correction?.corrected}
                            </span>
                          </div>
                          <p className="text-slate-300 italic">{msg.correction?.explanation}</p>
                          {msg.correction?.grammarNote && (
                            <div className="text-[10px] text-amber-300 font-mono bg-amber-500/10 p-1.5 rounded">
                              💡 Note: {msg.correction.grammarNote}
                            </div>
                          )}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                )}
              </motion.div>
            );
          })}

          {/* Loading / Typing Indicator */}
          {isLoading && (
            <motion.div
              initial={{ opacity: 0, y: 12, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -6, scale: 0.95 }}
              transition={{ duration: 0.25 }}
              className="flex items-center gap-2.5 text-xs text-emerald-400 font-medium p-2.5 bg-slate-900/60 rounded-2xl w-fit border border-white/5"
            >
              <div className="flex items-center gap-1">
                <motion.div
                  animate={{ y: [0, -5, 0] }}
                  transition={{ repeat: Infinity, duration: 0.6, ease: 'easeInOut' }}
                  className="w-2 h-2 rounded-full bg-emerald-400"
                />
                <motion.div
                  animate={{ y: [0, -5, 0] }}
                  transition={{ repeat: Infinity, duration: 0.6, ease: 'easeInOut', delay: 0.15 }}
                  className="w-2 h-2 rounded-full bg-emerald-400"
                />
                <motion.div
                  animate={{ y: [0, -5, 0] }}
                  transition={{ repeat: Infinity, duration: 0.6, ease: 'easeInOut', delay: 0.3 }}
                  className="w-2 h-2 rounded-full bg-emerald-400"
                />
              </div>
              <span className="text-slate-300 text-[11px]">{activeScenario.characterName} is typing...</span>
            </motion.div>
          )}
        </AnimatePresence>

        <div ref={messagesEndRef} />
      </div>

      {/* Suggested Quick Replies Bar */}
      {suggestedReplies.length > 0 && !isLoading && (
        <div className="px-4 py-2 bg-slate-950/80 border-t border-white/10 flex items-center gap-2 overflow-x-auto no-scrollbar">
          <Lightbulb className="w-4 h-4 text-yellow-400 shrink-0" />
          {suggestedReplies.map((sugg, idx) => (
            <button
              key={idx}
              onClick={() => handleSendMessage(sugg.phrase)}
              className="shrink-0 px-3 py-1.5 rounded-full bg-slate-800 hover:bg-slate-700 border border-white/10 text-xs font-medium text-emerald-300 transition-colors cursor-pointer text-left"
            >
              <div>{sugg.phrase}</div>
              <div className="text-[9px] text-slate-400">{sugg.translation}</div>
            </button>
          ))}
        </div>
      )}

      {/* Bottom Input Controls */}
      <div className="p-4 bg-slate-900 border-t border-white/10 pb-safe space-y-2">
        {/* All objectives completed celebratory banner */}
        {allObjectivesCompleted && (
          <div className="p-2.5 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-between gap-2 text-xs animate-in slide-in-from-bottom-2">
            <div className="flex items-center gap-2 text-emerald-300 font-bold">
              <Award className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>All missions complete!</span>
            </div>
            <button
              onClick={handleOpenSummary}
              className="px-2.5 py-1 rounded-xl bg-emerald-500 text-slate-950 font-black text-[11px] shadow-sm hover:opacity-90 transition-opacity cursor-pointer"
            >
              View Debrief & Mistakes
            </button>
          </div>
        )}

        <div className="flex items-center gap-2">

          {/* Voice Record Button */}
          <button
            onClick={() => isListening ? stopListening() : startListening(activeJourney?.targetLanguage)}
            className={`w-11 h-11 rounded-2xl flex items-center justify-center transition-all cursor-pointer shrink-0 ${
              isListening
                ? 'bg-red-500 text-white animate-pulse shadow-lg shadow-red-500/30'
                : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/30'
            }`}
            title={isListening ? 'Stop recording' : 'Speak'}
          >
            {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
          </button>

          {/* Text Input */}
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
            placeholder={isListening ? 'Listening to your speech...' : `Reply in ${activeJourney?.targetLanguage.toUpperCase()}...`}
            className="flex-1 bg-slate-950 border border-white/10 rounded-2xl px-4 py-2.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition-colors"
          />

          {/* Send Button */}
          <button
            onClick={() => handleSendMessage()}
            disabled={!inputText.trim() || isLoading}
            className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center text-white disabled:opacity-40 transition-all cursor-pointer shrink-0 shadow-lg shadow-emerald-500/20"
          >
            <Send className="w-4 h-4" />
          </button>

        </div>
      </div>

      {/* End-of-Session Debrief & Mistakes Summary Modal */}
      {showSummaryModal && activeScenario && (
        <SessionSummaryModal
          summary={{
            scenario: activeScenario,
            durationMinutes: Math.max(1, Math.round((Date.now() - sessionStartTime) / 60000)),
            totalTurns: messages.filter(m => m.sender === 'user').length,
            completedObjectives: completedObjsList,
            mistakes: sessionMistakes,
            vocabularyLearned: sessionVocab
          }}
          onClose={() => setShowSummaryModal(false)}
          onRestart={handleRestartSession}
          onGoHome={() => {
            setShowSummaryModal(false);
            setActiveView('home');
          }}
        />
      )}

    </div>
  );
};
