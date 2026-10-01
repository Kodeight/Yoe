import React from 'react';
import { useApp } from '../context/AppContext';
import { YoeOrb } from './YoeOrb';
import { Mic, ChevronRight, Sparkles } from 'lucide-react';
import { SUPPORTED_LANGUAGES } from '../server/db';

export const HeroBanner: React.FC = () => {
  const { user, activeJourney, activeScenario, setActiveView } = useApp();

  const currentLang = SUPPORTED_LANGUAGES.find(l => l.code === activeJourney?.targetLanguage) || SUPPORTED_LANGUAGES[0];
  const userName = user?.name ? user.name.split(' ')[0] : 'Learner';

  return (
    <section className="relative overflow-hidden rounded-3xl glass-card p-6 text-center shadow-xl">
      {/* Background ambient glow */}
      <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-80 h-80 bg-gradient-to-br from-emerald-500/20 via-teal-500/10 to-cyan-500/15 rounded-full blur-3xl pointer-events-none" />

      {/* Greeting & Active Journey */}
      <div className="flex items-center justify-between mb-4">
        <div className="text-left">
          <span className="text-[10px] font-extrabold uppercase tracking-widest text-emerald-400 dark:text-emerald-400 light-mode:text-emerald-600 block">
            Welcome, {userName}
          </span>
          <h2 className="text-sm font-bold text-slate-200 dark:text-slate-200 light-mode:text-slate-800 flex items-center gap-1.5 mt-0.5">
            <span>{currentLang.flag} Learning {currentLang.name}</span>
            <span className="px-1.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/20 text-[9px] font-extrabold">
              {activeJourney?.cefrLevel || 'A1'}
            </span>
          </h2>
        </div>

        <div className="px-2.5 py-1 rounded-full glass-pill text-[10px] font-bold text-slate-300 dark:text-slate-300 light-mode:text-slate-700 flex items-center gap-1">
          <Sparkles className="w-3 h-3 text-emerald-400" />
          <span>AI Active</span>
        </div>
      </div>

      {/* Main Intelligent Yoe AI Presence Orb */}
      <div className="my-5 cursor-pointer" onClick={() => setActiveView('chat')}>
        <YoeOrb size="md" state="idle" interactive />
      </div>

      {/* Headline Callout */}
      <h1 className="text-2xl font-black tracking-tight text-slate-100 dark:text-slate-100 light-mode:text-slate-900 mb-1.5">
        Ready to Speak Today?
      </h1>
      <p className="text-xs text-slate-400 dark:text-slate-400 light-mode:text-slate-600 max-w-xs mx-auto mb-5 leading-relaxed">
        {activeScenario
          ? `Step into "${activeScenario.title}" with ${activeScenario.characterName}`
          : `Practice conversational ${currentLang.name} with your AI tutor`}
      </p>

      {/* Primary Glowing Conversational Action Button */}
      <button
        onClick={() => setActiveView('chat')}
        className="w-full relative group overflow-hidden rounded-2xl bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-400 p-[1px] shadow-xl shadow-emerald-500/20 hover:shadow-emerald-500/35 transition-all cursor-pointer transform hover:-translate-y-0.5 active:translate-y-0"
      >
        <div className="w-full h-full bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-400 rounded-[15px] px-5 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-slate-950/20 backdrop-blur-md flex items-center justify-center border border-white/30 group-hover:scale-110 transition-transform">
              <Mic className="w-5 h-5 text-slate-950" />
            </div>
            <div className="text-left">
              <div className="text-sm font-black text-slate-950 tracking-tight">
                {activeScenario ? `Enter: ${activeScenario.title}` : 'Start Conversation'}
              </div>
              <div className="text-[11px] text-slate-900/80 font-semibold">
                {activeScenario ? `Roleplay with ${activeScenario.characterName}` : 'Begin interactive speaking session'}
              </div>
            </div>
          </div>

          <div className="w-8 h-8 rounded-full bg-slate-950/20 flex items-center justify-center text-slate-950 group-hover:translate-x-1 transition-transform">
            <ChevronRight className="w-5 h-5 stroke-[2.5]" />
          </div>
        </div>
      </button>
    </section>
  );
};
