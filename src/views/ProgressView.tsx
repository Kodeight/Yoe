import React from 'react';
import { useApp } from '../context/AppContext';
import { BarChart2, Award, Flame, Star, Sparkles, TrendingUp, Compass, Clock, BookOpen } from 'lucide-react';

export const ProgressView: React.FC = () => {
  const { activeJourney, vocabulary, mistakes, setActiveView } = useApp();

  const level = activeJourney?.cefrLevel || 'A1';
  const spokenMinutes = activeJourney?.totalMinutesSpoken ?? 0;
  const points = activeJourney?.points ?? 0;
  const streakDays = activeJourney?.streakDays ?? 0;
  const wordCount = vocabulary.length;
  const mistakeCount = mistakes.length;

  const isFresh = spokenMinutes === 0 && points === 0 && wordCount === 0;

  return (
    <div className="pb-24 pt-4 px-4 max-w-md mx-auto space-y-4 animate-in fade-in duration-300">

      {/* Header */}
      <div>
        <h1 className="text-xl font-bold text-slate-100 dark:text-slate-100 light-mode:text-slate-900 tracking-tight flex items-center gap-2">
          <BarChart2 className="w-5 h-5 text-emerald-400" />
          <span>CEFR Progression & Mastery</span>
        </h1>
        <p className="text-xs text-slate-400 dark:text-slate-400 light-mode:text-slate-500 mt-0.5">
          Real language competencies acquired through interactive scenarios
        </p>
      </div>

      {/* Main CEFR Level Meter Card */}
      <div className="rounded-3xl glass-card p-5 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />

        <div className="flex items-center justify-between mb-4">
          <div>
            <span className="text-[10px] font-extrabold uppercase tracking-widest text-emerald-400 dark:text-emerald-400 light-mode:text-emerald-600 block mb-0.5">
              Working Proficiency
            </span>
            <h2 className="text-3xl font-black text-slate-100 dark:text-slate-100 light-mode:text-slate-900 tracking-tight flex items-center gap-2">
              <span>Level {level}</span>
              <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/25">
                {level === 'A1' ? 'Beginner' : level === 'A2' ? 'Elementary' : level === 'B1' ? 'Intermediate' : 'Advanced'}
              </span>
            </h2>
          </div>

          <div className="w-13 h-13 rounded-2xl bg-emerald-500/15 border border-emerald-500/25 flex items-center justify-center text-emerald-400 shadow-md">
            <Award className="w-7 h-7" />
          </div>
        </div>

        {/* CEFR Scale Step Grid */}
        <div className="grid grid-cols-6 gap-1.5 mb-3">
          {['A1', 'A2', 'B1', 'B2', 'C1', 'C2'].map((lvl) => {
            const isCurrent = lvl === level;
            return (
              <div
                key={lvl}
                className={`py-2 rounded-xl text-center text-xs font-black transition-all ${
                  isCurrent
                    ? 'bg-gradient-to-r from-emerald-400 to-teal-400 text-slate-950 shadow-md shadow-emerald-500/30 scale-105'
                    : 'bg-slate-900/40 dark:bg-slate-900/40 light-mode:bg-slate-100 text-slate-500 border border-white/5 dark:border-white/5 light-mode:border-slate-200'
                }`}
              >
                {lvl}
              </div>
            );
          })}
        </div>

        <p className="text-[11px] text-slate-400 dark:text-slate-400 light-mode:text-slate-600 leading-relaxed">
          {level === 'A1'
            ? 'Can understand and use familiar everyday expressions and basic phrases aimed at the satisfaction of practical needs.'
            : level === 'A2'
            ? 'Can communicate in simple and routine tasks requiring a simple and direct exchange of information.'
            : 'Can deal with most situations likely to arise whilst travelling in an area where the language is spoken.'}
        </p>
      </div>

      {/* Fresh State Invitation */}
      {isFresh && (
        <div className="rounded-3xl glass-card p-6 text-center space-y-3">
          <div className="w-12 h-12 rounded-full bg-emerald-500/15 border border-emerald-500/25 flex items-center justify-center mx-auto text-emerald-400">
            <Sparkles className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-slate-100 dark:text-slate-100 light-mode:text-slate-900">
            Your First Language Journey Starts Here
          </h3>
          <p className="text-xs text-slate-400 dark:text-slate-400 light-mode:text-slate-600 max-w-xs mx-auto leading-relaxed">
            As you practice conversations with Yoe, your real speaking minutes, acquired vocabulary, and grammar mastery will be recorded right here.
          </p>
          <button
            onClick={() => setActiveView('explore')}
            className="mt-2 py-3 px-6 rounded-2xl bg-gradient-to-r from-emerald-400 to-teal-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 mx-auto shadow-md shadow-emerald-500/20 cursor-pointer"
          >
            <Compass className="w-4 h-4" />
            <span>Choose Your First Scenario</span>
          </button>
        </div>
      )}

      {/* Real Metrics Summary Cards */}
      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-2xl glass-card p-4 space-y-1">
          <div className="flex items-center gap-2 text-slate-400 dark:text-slate-400 light-mode:text-slate-600 text-xs">
            <Clock className="w-4 h-4 text-cyan-400" />
            <span>Spoken Time</span>
          </div>
          <div className="text-xl font-black text-slate-100 dark:text-slate-100 light-mode:text-slate-900">
            {spokenMinutes} <span className="text-xs font-normal text-slate-400">min</span>
          </div>
        </div>

        <div className="rounded-2xl glass-card p-4 space-y-1">
          <div className="flex items-center gap-2 text-slate-400 dark:text-slate-400 light-mode:text-slate-600 text-xs">
            <Flame className="w-4 h-4 text-amber-400" />
            <span>Daily Streak</span>
          </div>
          <div className="text-xl font-black text-slate-100 dark:text-slate-100 light-mode:text-slate-900">
            {streakDays} <span className="text-xs font-normal text-slate-400">days</span>
          </div>
        </div>

        <div
          onClick={() => setActiveView('vocab')}
          className="rounded-2xl glass-card p-4 space-y-1 cursor-pointer hover:border-purple-500/40 transition-colors"
        >
          <div className="flex items-center gap-2 text-slate-400 dark:text-slate-400 light-mode:text-slate-600 text-xs">
            <BookOpen className="w-4 h-4 text-purple-400" />
            <span>Vocabulary Bank</span>
          </div>
          <div className="text-xl font-black text-slate-100 dark:text-slate-100 light-mode:text-slate-900">
            {wordCount} <span className="text-xs font-normal text-slate-400">words</span>
          </div>
        </div>

        <div
          onClick={() => setActiveView('grammar')}
          className="rounded-2xl glass-card p-4 space-y-1 cursor-pointer hover:border-amber-500/40 transition-colors"
        >
          <div className="flex items-center gap-2 text-slate-400 dark:text-slate-400 light-mode:text-slate-600 text-xs">
            <TrendingUp className="w-4 h-4 text-emerald-400" />
            <span>Grammar Bank</span>
          </div>
          <div className="text-xl font-black text-slate-100 dark:text-slate-100 light-mode:text-slate-900">
            {mistakeCount} <span className="text-xs font-normal text-slate-400">patterns</span>
          </div>
        </div>
      </div>

    </div>
  );
};
