import React from 'react';
import { useApp } from '../context/AppContext';
import { YoeOrb } from './YoeOrb';
import { Mic, ChevronRight } from 'lucide-react';

export const HeroBanner: React.FC = () => {
  const { setActiveView, activeScenario } = useApp();

  return (
    <section className="relative overflow-hidden rounded-3xl bg-gradient-to-b from-slate-900/90 via-slate-900/60 to-slate-950/80 dark:from-slate-900/90 dark:via-slate-900/60 dark:to-slate-950/80 light-mode:from-emerald-500/10 light-mode:via-teal-500/5 light-mode:to-white border border-white/10 dark:border-white/10 light-mode:border-emerald-500/20 p-6 text-center shadow-xl">
      {/* Background radial glow */}
      <div className="absolute -top-20 left-1/2 -translate-x-1/2 w-72 h-72 bg-emerald-500/20 rounded-full blur-3xl pointer-events-none" />

      {/* Companion Badge */}
      <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-800/80 dark:bg-slate-800/80 light-mode:bg-white/80 border border-white/10 dark:border-white/10 light-mode:border-emerald-500/20 text-xs font-semibold text-slate-300 dark:text-slate-300 light-mode:text-emerald-700 mb-4 shadow-sm">
        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
        <span>Your AI language companion</span>
      </div>

      {/* Main Headline */}
      <h1 className="text-4xl font-black tracking-tight text-white dark:text-white light-mode:text-slate-900 leading-[1.1] mb-3">
        Speak<br />
        Learn<br />
        <span className="bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-300 bg-clip-text text-transparent">
          Grow
        </span>
      </h1>

      {/* Subtitle */}
      <p className="text-xs font-medium text-slate-400 dark:text-slate-400 light-mode:text-slate-600 max-w-xs mx-auto mb-6 leading-relaxed">
        Real conversations. Real progress. In any language.
      </p>

      {/* 3D Animated Globe Orb */}
      <div className="mb-6">
        <YoeOrb size="md" />
      </div>

      {/* Primary Glowing Voice Action Button */}
      <button
        onClick={() => setActiveView('chat')}
        className="w-full relative group overflow-hidden rounded-2xl bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-400 p-[1px] shadow-xl shadow-emerald-500/25 hover:shadow-emerald-500/40 transition-all cursor-pointer transform hover:-translate-y-0.5 active:translate-y-0"
      >
        <div className="w-full h-full bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-400 rounded-[15px] px-5 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/30 group-hover:scale-110 transition-transform">
              <Mic className="w-5 h-5 text-white" />
            </div>
            <div className="text-left">
              <div className="text-sm font-bold text-white tracking-wide">
                Start a conversation
              </div>
              <div className="text-[11px] text-white/80 font-medium">
                Talk with your AI tutor now
              </div>
            </div>
          </div>

          <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-white group-hover:translate-x-1 transition-transform">
            <ChevronRight className="w-5 h-5" />
          </div>
        </div>
      </button>
    </section>
  );
};
