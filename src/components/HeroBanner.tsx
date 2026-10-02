import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { useAudio } from '../context/AudioContext';
import { VoiceBubble } from './VoiceBubble';
import { Mic, ChevronRight, Radio } from 'lucide-react';
import { SUPPORTED_LANGUAGES } from '../constants/languages';

let hasAnimatedGreetingThisSession = false;

export const HeroBanner: React.FC = () => {
  const { user, activeJourney, activeScenario, setActiveView } = useApp();
  const { isListening, isSpeaking } = useAudio();

  const currentLang = SUPPORTED_LANGUAGES.find(l => l.code === activeJourney?.targetLanguage) || SUPPORTED_LANGUAGES[0];
  const userName = user?.name ? user.name.split(' ')[0] : 'Learner';
  const fullGreeting = `WELCOME, ${userName.toUpperCase()}`;
  const isAudioActive = isListening || isSpeaking;

  const [displayedGreeting, setDisplayedGreeting] = useState(() => {
    return hasAnimatedGreetingThisSession ? fullGreeting : '';
  });
  const [isTypingComplete, setIsTypingComplete] = useState(() => hasAnimatedGreetingThisSession);

  useEffect(() => {
    if (hasAnimatedGreetingThisSession) {
      setDisplayedGreeting(fullGreeting);
      setIsTypingComplete(true);
      return;
    }

    const prefersReducedMotion =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (prefersReducedMotion) {
      setDisplayedGreeting(fullGreeting);
      setIsTypingComplete(true);
      hasAnimatedGreetingThisSession = true;
      return;
    }

    let charIdx = 0;
    const intervalTime = Math.max(35, Math.floor(800 / Math.max(1, fullGreeting.length)));

    const interval = setInterval(() => {
      charIdx += 1;
      setDisplayedGreeting(fullGreeting.slice(0, charIdx));

      if (charIdx >= fullGreeting.length) {
        clearInterval(interval);
        setIsTypingComplete(true);
        hasAnimatedGreetingThisSession = true;
      }
    }, intervalTime);

    return () => clearInterval(interval);
  }, [fullGreeting]);

  return (
    <section className="relative overflow-hidden rounded-3xl glass-card p-6 text-center shadow-xl">
      {/* Background ambient glow */}
      <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-80 h-80 bg-gradient-to-br from-emerald-500/20 via-teal-500/10 to-cyan-500/15 rounded-full blur-3xl pointer-events-none" />

      {/* Greeting & Active Journey */}
      <div className="flex items-center justify-between mb-4">
        <div className="text-left">
          <div className="text-xs font-bold text-slate-300 dark:text-slate-300 light-mode:text-slate-600 flex items-center gap-1.5 min-h-[20px]">
            <span>Welcome,</span>
            <span className="font-signature text-lg font-bold text-emerald-400 dark:text-emerald-400 light-mode:text-emerald-600">
              {userName}
            </span>
          </div>
          <h2 className="font-brand text-xs font-bold text-slate-400 dark:text-slate-400 light-mode:text-slate-500 flex items-center gap-1.5 mt-0.5">
            <span>{currentLang.flag} Learning {currentLang.name}</span>
            <span className="px-1.5 py-0.2 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/20 text-[9px] font-extrabold">
              {activeJourney?.cefrLevel || 'A1'}
            </span>
          </h2>
        </div>

        <div className="px-2.5 py-1 rounded-full glass-pill text-[10px] font-bold text-slate-300 dark:text-slate-300 light-mode:text-slate-700 flex items-center gap-1">
          {isAudioActive ? (
            <>
              <Radio className="w-3 h-3 text-emerald-400 animate-pulse" />
              <span className="text-emerald-400">Live Audio</span>
            </>
          ) : (
            <span className="text-slate-400">Ready to speak</span>
          )}
        </div>
      </div>

      {/* Main Intelligent Yoe Voice Presence Bubble */}
      <div className="my-2 flex justify-center cursor-pointer" onClick={() => setActiveView('chat')}>
        <VoiceBubble size="md" state={isSpeaking ? 'speaking' : isListening ? 'listening' : 'idle'} interactive />
      </div>

      {/* Headline Callout */}
      <h1 className="text-2xl font-black tracking-tight text-slate-100 dark:text-slate-100 light-mode:text-slate-900 mb-1">
        Ready to Speak Today?
      </h1>
      <p className="text-xs text-slate-400 dark:text-slate-400 light-mode:text-slate-600 max-w-xs mx-auto mb-4 leading-relaxed">
        {activeScenario
          ? `Step into "${activeScenario.title}" with Yoe`
          : `Practice conversational ${currentLang.name} with Yoe`}
      </p>

      {/* Restored Glowing Emerald/Teal/Cyan Conversational CTA with Crisp WHITE Typography */}
      <button
        onClick={() => setActiveView('chat')}
        className="w-full relative group overflow-hidden rounded-2xl bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 p-[1px] shadow-xl shadow-emerald-500/25 hover:shadow-emerald-500/40 transition-all cursor-pointer transform hover:-translate-y-0.5 active:translate-y-0"
      >
        <div className="w-full h-full bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 rounded-[15px] px-5 py-4 flex items-center justify-between text-white">
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/30 group-hover:scale-105 transition-transform text-white shadow-sm">
              <Mic className="w-5 h-5 text-white" />
            </div>
            <div className="text-left">
              <div className="text-sm font-extrabold text-white tracking-tight drop-shadow-sm">
                {activeScenario ? `Enter: ${activeScenario.title}` : 'Start Conversation'}
              </div>
              <div className="text-[11px] text-white/90 font-medium">
                {activeScenario ? `Live Voice Practice with Yoe` : 'Begin interactive speaking session'}
              </div>
            </div>
          </div>

          <div className="w-8 h-8 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-white group-hover:translate-x-1 group-hover:bg-white/30 transition-all border border-white/20">
            <ChevronRight className="w-4 h-4 text-white stroke-[2.5]" />
          </div>
        </div>
      </button>
    </section>
  );
};

