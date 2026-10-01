import React from 'react';
import { useApp } from '../context/AppContext';
import { Mic, Flame, Target, Star, ChevronRight } from 'lucide-react';

export const DailyGoalsCard: React.FC = () => {
  const { activeJourney, setActiveView, vocabulary, mistakes } = useApp();

  const spokenMinutes = activeJourney?.totalMinutesSpoken ?? 0;
  const streakDays = activeJourney?.streakDays ?? 0;
  const points = activeJourney?.points ?? 0;
  const targetGoalMinutes = 10;
  const progressPercent = Math.min(100, Math.round((spokenMinutes / targetGoalMinutes) * 100));

  return (
    <section className="my-4">
      <div className="flex items-center justify-between mb-2.5">
        <h2 className="text-sm font-bold text-slate-100 dark:text-slate-100 light-mode:text-slate-900 tracking-tight">
          Daily Speaking Practice
        </h2>
        <button
          onClick={() => setActiveView('learn')}
          className="text-xs font-semibold text-emerald-400 dark:text-emerald-400 light-mode:text-emerald-600 hover:text-emerald-300 flex items-center gap-0.5 cursor-pointer"
        >
          <span>Progress</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Main Goal Card: Speak for 10 min */}
      <div className="rounded-2xl glass-card p-4 mb-3 shadow-md">
        <div className="flex items-center gap-3.5 mb-2.5">
          {/* Circular Progress Mic Icon */}
          <div className="relative w-11 h-11 rounded-full border border-emerald-400/30 flex items-center justify-center bg-emerald-500/10 shrink-0">
            <Mic className="w-5 h-5 text-emerald-400" />
            {spokenMinutes >= targetGoalMinutes && (
              <span className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-emerald-400 text-slate-950 font-black text-[9px] flex items-center justify-center">
                ✓
              </span>
            )}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-bold text-slate-100 dark:text-slate-100 light-mode:text-slate-900">
                Daily Goal: {targetGoalMinutes} Minutes Spoken
              </span>
              <span className="text-xs font-bold text-emerald-400">
                {spokenMinutes} / {targetGoalMinutes} min
              </span>
            </div>

            {/* Progress Bar */}
            <div className="w-full h-2 rounded-full bg-slate-800/80 dark:bg-slate-800/80 light-mode:bg-slate-200 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-400 rounded-full transition-all duration-500"
                style={{ width: `${Math.max(4, progressPercent)}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* 3 Mini Stats Badges Row */}
      <div className="grid grid-cols-3 gap-2.5">
        {/* Streak Tile */}
        <div className="rounded-xl glass-card p-3 flex items-center gap-2.5 shadow-sm">
          <div className="p-2 rounded-lg bg-amber-500/10 text-amber-500 shrink-0">
            <Flame className="w-4 h-4 fill-amber-500" />
          </div>
          <div>
            <div className="text-xs font-bold text-slate-100 dark:text-slate-100 light-mode:text-slate-900">
              {streakDays} {streakDays === 1 ? 'Day' : 'Days'}
            </div>
            <div className="text-[10px] text-slate-400 dark:text-slate-400 light-mode:text-slate-500">
              Active Streak
            </div>
          </div>
        </div>

        {/* Vocabulary Bank Tile */}
        <div
          onClick={() => setActiveView('vocab')}
          className="rounded-xl glass-card p-3 flex items-center gap-2.5 shadow-sm cursor-pointer hover:border-purple-500/30 transition-colors"
        >
          <div className="p-2 rounded-lg bg-purple-500/10 text-purple-400 shrink-0">
            <Target className="w-4 h-4" />
          </div>
          <div>
            <div className="text-xs font-bold text-slate-100 dark:text-slate-100 light-mode:text-slate-900">
              {vocabulary.length}
            </div>
            <div className="text-[10px] text-slate-400 dark:text-slate-400 light-mode:text-slate-500">
              Words Bank
            </div>
          </div>
        </div>

        {/* Points Tile */}
        <div className="rounded-xl glass-card p-3 flex items-center gap-2.5 shadow-sm">
          <div className="p-2 rounded-lg bg-yellow-500/10 text-yellow-500 shrink-0">
            <Star className="w-4 h-4 fill-yellow-500" />
          </div>
          <div>
            <div className="text-xs font-bold text-slate-100 dark:text-slate-100 light-mode:text-slate-900">
              {points > 999 ? `${(points / 1000).toFixed(1)}K` : `${points}`}
            </div>
            <div className="text-[10px] text-slate-400 dark:text-slate-400 light-mode:text-slate-500">
              XP Earned
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
