import React from 'react';
import { useApp } from '../context/AppContext';
import { Mic, Flame, Target, Star, ChevronRight } from 'lucide-react';

export const DailyGoalsCard: React.FC = () => {
  const { activeJourney, setActiveView } = useApp();

  const spokenMinutes = activeJourney?.totalMinutesSpoken || 6;
  const streakDays = activeJourney?.streakDays || 12;
  const points = activeJourney?.points || 1200;

  return (
    <section className="my-5">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-base font-bold text-slate-100 dark:text-slate-100 light-mode:text-slate-900 tracking-tight">
          Daily goals
        </h2>
        <button
          onClick={() => setActiveView('learn')}
          className="text-xs font-semibold text-emerald-400 hover:text-emerald-300 flex items-center gap-0.5 cursor-pointer"
        >
          <span>See all</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Main Goal Card: Speak for 10 min */}
      <div className="rounded-2xl bg-slate-900/80 dark:bg-slate-900/80 light-mode:bg-white border border-white/10 dark:border-white/10 light-mode:border-slate-200 p-4 mb-3 shadow-md">
        <div className="flex items-center gap-3.5 mb-3">
          {/* Circular Progress Mic Icon */}
          <div className="relative w-12 h-12 rounded-full border-2 border-emerald-400 flex items-center justify-center bg-emerald-500/10 shrink-0">
            <Mic className="w-5 h-5 text-emerald-400" />
            <span className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-emerald-500 text-slate-950 font-black text-[9px] flex items-center justify-center">
              ✓
            </span>
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-bold text-slate-100 dark:text-slate-100 light-mode:text-slate-900">
                Speak for 10 minutes
              </span>
              <span className="text-xs font-bold text-emerald-400">
                {spokenMinutes} / 10 min
              </span>
            </div>

            {/* Progress Bar */}
            <div className="w-full h-2 rounded-full bg-slate-800 dark:bg-slate-800 light-mode:bg-slate-200 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full transition-all duration-500"
                style={{ width: `${Math.min(100, (spokenMinutes / 10) * 100)}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* 3 Mini Stats Badges Row */}
      <div className="grid grid-cols-3 gap-2.5">
        {/* Streak Tile */}
        <div className="rounded-xl bg-slate-900/80 dark:bg-slate-900/80 light-mode:bg-white border border-white/10 dark:border-white/10 light-mode:border-slate-200 p-3 flex items-center gap-2.5 shadow-sm">
          <div className="p-2 rounded-lg bg-amber-500/10 text-amber-500 shrink-0">
            <Flame className="w-4 h-4 fill-amber-500" />
          </div>
          <div>
            <div className="text-xs font-bold text-slate-100 dark:text-slate-100 light-mode:text-slate-900">
              {streakDays}
            </div>
            <div className="text-[10px] text-slate-400 dark:text-slate-400 light-mode:text-slate-500">
              Day streak
            </div>
          </div>
        </div>

        {/* Goals Today Tile */}
        <div className="rounded-xl bg-slate-900/80 dark:bg-slate-900/80 light-mode:bg-white border border-white/10 dark:border-white/10 light-mode:border-slate-200 p-3 flex items-center gap-2.5 shadow-sm">
          <div className="p-2 rounded-lg bg-pink-500/10 text-pink-500 shrink-0">
            <Target className="w-4 h-4" />
          </div>
          <div>
            <div className="text-xs font-bold text-slate-100 dark:text-slate-100 light-mode:text-slate-900">
              3 / 5
            </div>
            <div className="text-[10px] text-slate-400 dark:text-slate-400 light-mode:text-slate-500">
              Goals today
            </div>
          </div>
        </div>

        {/* Points Tile */}
        <div className="rounded-xl bg-slate-900/80 dark:bg-slate-900/80 light-mode:bg-white border border-white/10 dark:border-white/10 light-mode:border-slate-200 p-3 flex items-center gap-2.5 shadow-sm">
          <div className="p-2 rounded-lg bg-yellow-500/10 text-yellow-500 shrink-0">
            <Star className="w-4 h-4 fill-yellow-500" />
          </div>
          <div>
            <div className="text-xs font-bold text-slate-100 dark:text-slate-100 light-mode:text-slate-900">
              {(points / 1000).toFixed(1)}K
            </div>
            <div className="text-[10px] text-slate-400 dark:text-slate-400 light-mode:text-slate-500">
              Points
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
