import React, { useState, useEffect } from 'react';
import { Flame, Check, Calendar, Zap, Shield, Sparkles, ArrowRight } from 'lucide-react';
import { calculateStreak, recordDayActivity, StreakData } from '../utils/streakManager';
import { useApp } from '../context/AppContext';

export const DailyStreakCounter: React.FC = () => {
  const { setActiveView, refreshProgress } = useApp();
  const [streakData, setStreakData] = useState<StreakData>(() => calculateStreak());
  const [showCelebration, setShowCelebration] = useState(false);

  useEffect(() => {
    setStreakData(calculateStreak());
  }, []);

  const handleManualCheckIn = () => {
    const updated = recordDayActivity();
    setStreakData(updated);
    setShowCelebration(true);
    refreshProgress();
    setTimeout(() => setShowCelebration(false), 3000);
  };

  const { currentStreak, longestStreak, completedToday, totalActiveDays, weekDays, streakStatusMessage } = streakData;

  return (
    <div className="rounded-3xl bg-gradient-to-br from-slate-900 via-slate-900/95 to-slate-950 border border-amber-500/20 p-5 shadow-xl relative overflow-hidden space-y-4">
      {/* Background glow */}
      <div className="absolute top-0 right-0 w-36 h-36 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header with Flame Badge */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className={`relative w-12 h-12 rounded-2xl flex items-center justify-center transition-all ${
            completedToday
              ? 'bg-gradient-to-tr from-amber-500 to-orange-500 text-slate-950 shadow-lg shadow-orange-500/30'
              : 'bg-amber-500/10 border border-amber-500/30 text-amber-400'
          }`}>
            <Flame className={`w-7 h-7 ${completedToday ? 'fill-slate-950 animate-bounce' : 'fill-amber-500/20'}`} />
            {completedToday && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-emerald-400 rounded-full flex items-center justify-center text-slate-950 text-[10px] font-black">
                ✓
              </span>
            )}
          </div>

          <div>
            <div className="flex items-center gap-2">
              <span className="text-2xl font-black text-white tracking-tight">
                {currentStreak} Day{currentStreak !== 1 ? 's' : ''}
              </span>
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                completedToday
                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                  : 'bg-amber-500/20 text-amber-400 border border-amber-500/30 animate-pulse'
              }`}>
                {completedToday ? 'Active Today' : 'Pending Today'}
              </span>
            </div>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Consecutive days of language practice
            </p>
          </div>
        </div>

        {/* Longest streak pill */}
        <div className="text-right">
          <div className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider flex items-center gap-1 justify-end">
            <Zap className="w-3 h-3 text-amber-400" />
            <span>Best</span>
          </div>
          <div className="text-sm font-extrabold text-amber-400">
            {longestStreak} Days
          </div>
        </div>
      </div>

      {/* 7-Day Activity Calendar Strip */}
      <div className="pt-1">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[11px] font-bold text-slate-300 flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-emerald-400" />
            <span>Last 7 Days Activity</span>
          </span>
          <span className="text-[10px] text-slate-400">
            {totalActiveDays} total active days
          </span>
        </div>

        <div className="grid grid-cols-7 gap-1.5">
          {weekDays.map((day) => {
            const isComp = day.status === 'completed';
            const isPend = day.status === 'pending';

            return (
              <div
                key={day.dateStr}
                className={`flex flex-col items-center py-2 px-1 rounded-2xl border transition-all ${
                  isComp
                    ? 'bg-amber-500/15 border-amber-500/40 text-amber-300'
                    : isPend
                    ? 'bg-slate-800/80 border-amber-400/40 text-amber-200 ring-2 ring-amber-400/20'
                    : 'bg-slate-900/60 border-white/5 text-slate-500'
                }`}
              >
                <span className="text-[10px] font-semibold text-slate-400">
                  {day.dayName}
                </span>

                <div className={`w-7 h-7 rounded-full flex items-center justify-center my-1 text-xs font-bold ${
                  isComp
                    ? 'bg-gradient-to-tr from-amber-500 to-orange-400 text-slate-950 shadow-sm'
                    : isPend
                    ? 'bg-amber-400/20 text-amber-300 border border-amber-400/50'
                    : 'bg-slate-800 text-slate-500'
                }`}>
                  {isComp ? (
                    <Check className="w-3.5 h-3.5 stroke-[3]" />
                  ) : isPend ? (
                    <Flame className="w-3.5 h-3.5 fill-amber-400" />
                  ) : (
                    <span>{day.dayNumber}</span>
                  )}
                </div>

                <span className={`text-[9px] font-bold ${
                  isComp
                    ? 'text-amber-400'
                    : isPend
                    ? 'text-amber-300 animate-pulse'
                    : 'text-slate-600'
                }`}>
                  {isComp ? 'Done' : isPend ? 'Today' : '—'}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Status banner and action button */}
      <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-white/5">
        <p className="text-xs text-slate-300 font-medium">
          {streakStatusMessage}
        </p>

        {!completedToday ? (
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              onClick={handleManualCheckIn}
              className="flex-1 sm:flex-none px-3.5 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-400 hover:from-amber-400 hover:to-orange-300 text-slate-950 font-black text-xs flex items-center justify-center gap-1.5 shadow-md shadow-orange-500/20 cursor-pointer transition-all"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Log Practice Now</span>
            </button>
            <button
              onClick={() => setActiveView('explore')}
              className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold flex items-center gap-1 cursor-pointer transition-colors"
            >
              <span>Scenarios</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1.5 rounded-xl">
            <Shield className="w-3.5 h-3.5" />
            <span>Streak Protected Today</span>
          </div>
        )}
      </div>

      {/* Pop celebration toast */}
      {showCelebration && (
        <div className="p-2.5 rounded-2xl bg-amber-500/20 border border-amber-400/40 text-amber-300 text-xs font-bold text-center animate-in zoom-in-95 flex items-center justify-center gap-1.5">
          <Flame className="w-4 h-4 fill-amber-400" />
          <span>Streak Increased to {currentStreak} Days! 🔥 Keep practicing!</span>
        </div>
      )}
    </div>
  );
};
