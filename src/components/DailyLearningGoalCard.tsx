import React, { useState, useEffect } from 'react';
import { Target, Clock, BookOpen, CheckCircle2, Sparkles, ChevronRight, Edit2 } from 'lucide-react';
import { useApp } from '../context/AppContext';

export interface DailyGoalConfig {
  type: 'minutes' | 'lessons';
  target: number;
  current: number;
  lastUpdatedDate: string;
}

const STORAGE_KEY = 'yoe_daily_learning_goal';

export function getTodayDateStr(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

export function getDailyGoalConfig(): DailyGoalConfig {
  if (typeof window === 'undefined') {
    return { type: 'minutes', target: 15, current: 8, lastUpdatedDate: getTodayDateStr() };
  }
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const today = getTodayDateStr();
    if (!raw) {
      const initial: DailyGoalConfig = { type: 'minutes', target: 15, current: 8, lastUpdatedDate: today };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(initial));
      return initial;
    }
    const parsed: DailyGoalConfig = JSON.parse(raw);
    // Reset current if it's a new calendar day
    if (parsed.lastUpdatedDate !== today) {
      parsed.current = 0;
      parsed.lastUpdatedDate = today;
      localStorage.setItem(STORAGE_KEY, JSON.stringify(parsed));
    }
    return parsed;
  } catch (e) {
    return { type: 'minutes', target: 15, current: 8, lastUpdatedDate: getTodayDateStr() };
  }
}

export function saveDailyGoalConfig(updated: Partial<DailyGoalConfig>): DailyGoalConfig {
  const current = getDailyGoalConfig();
  const next = { ...current, ...updated, lastUpdatedDate: getTodayDateStr() };
  if (typeof window !== 'undefined') {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  }
  return next;
}

export function addDailyGoalProgress(type: 'minutes' | 'lessons', amount = 1): DailyGoalConfig {
  const current = getDailyGoalConfig();
  if (current.type === type) {
    current.current += amount;
  } else {
    // If practicing in minutes while goal is lessons, or vice versa, convert proportionally
    current.current += amount;
  }
  saveDailyGoalConfig(current);
  return current;
}

export const DailyLearningGoalCard: React.FC = () => {
  const { setActiveView } = useApp();
  const [goal, setGoal] = useState<DailyGoalConfig>(() => getDailyGoalConfig());
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    setGoal(getDailyGoalConfig());
  }, []);

  const percentage = Math.min(Math.round((goal.current / goal.target) * 100), 100);
  const isGoalMet = goal.current >= goal.target;

  // SVG Circular progress math
  const radius = 48;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  const handleSetTarget = (targetVal: number) => {
    const updated = saveDailyGoalConfig({ target: targetVal });
    setGoal(updated);
    setIsEditing(false);
  };

  const handleSetType = (typeVal: 'minutes' | 'lessons') => {
    const defaultTarget = typeVal === 'minutes' ? 15 : 2;
    const updated = saveDailyGoalConfig({ type: typeVal, target: defaultTarget });
    setGoal(updated);
  };

  const minutePresets = [5, 10, 15, 20, 30];
  const lessonPresets = [1, 2, 3, 5];

  return (
    <div className="rounded-3xl bg-slate-900/90 border border-white/10 p-5 shadow-xl space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-teal-500/10 text-teal-400">
            <Target className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-100 dark:text-slate-100 light-mode:text-slate-900 flex items-center gap-2">
              <span>Daily Learning Goal</span>
            </h3>
            <p className="text-[11px] text-slate-400 dark:text-slate-400 light-mode:text-slate-500">
              Target daily practice volume to maintain rapid fluency
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setIsEditing(!isEditing)}
          className="px-2.5 py-1 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-300 flex items-center gap-1 border border-white/10 cursor-pointer transition-colors"
        >
          <Edit2 className="w-3 h-3 text-emerald-400" />
          <span>{isEditing ? 'Done' : 'Change Goal'}</span>
        </button>
      </div>

      {/* Progress Ring and Stats Row */}
      <div className="flex items-center justify-between gap-4 p-4 rounded-2xl bg-gradient-to-br from-slate-950 via-slate-950/90 to-slate-900 border border-white/5">

        {/* Circular Progress Ring */}
        <div className="relative w-28 h-28 flex items-center justify-center shrink-0">
          <svg className="w-full h-full -rotate-90 transform" viewBox="0 0 120 120">
            {/* Background Track */}
            <circle
              cx="60"
              cy="60"
              r={radius}
              className="text-slate-800/80 stroke-current"
              strokeWidth="9"
              fill="transparent"
            />
            {/* Progress Stroke */}
            <circle
              cx="60"
              cy="60"
              r={radius}
              stroke="url(#progressGradient)"
              strokeWidth="9"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              className="transition-all duration-700 ease-out"
              fill="transparent"
            />
            <defs>
              <linearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#10b981" />
                <stop offset="50%" stopColor="#14b8a6" />
                <stop offset="100%" stopColor="#06b6d4" />
              </linearGradient>
            </defs>
          </svg>

          {/* Center Content */}
          <div className="absolute flex flex-col items-center justify-center text-center">
            {isGoalMet ? (
              <CheckCircle2 className="w-7 h-7 text-emerald-400 animate-bounce" />
            ) : (
              <span className="text-xl font-black text-white">{percentage}%</span>
            )}
            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">
              {isGoalMet ? 'Met!' : 'Today'}
            </span>
          </div>
        </div>

        {/* Details and metrics */}
        <div className="space-y-2 flex-1">
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-black text-white">
              {goal.current}
              <span className="text-xs font-normal text-slate-400">
                {' '}/ {goal.target} {goal.type === 'minutes' ? 'mins' : 'lessons'}
              </span>
            </span>
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
              isGoalMet
                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                : 'bg-teal-500/20 text-teal-300 border border-teal-500/30'
            }`}>
              {isGoalMet ? 'Completed' : `${goal.target - goal.current} ${goal.type === 'minutes' ? 'min' : 'lessons'} left`}
            </span>
          </div>

          <p className="text-xs text-slate-300 leading-relaxed">
            {isGoalMet
              ? 'Congratulations! You reached today\'s language learning milestone! 🚀'
              : `Complete ${goal.target - goal.current} more ${goal.type === 'minutes' ? 'minutes of speaking' : 'scenario lesson'} to achieve your daily target.`}
          </p>

          <button
            type="button"
            onClick={() => setActiveView('explore')}
            className="px-3 py-1.5 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/20 text-emerald-400 text-xs font-bold flex items-center gap-1 cursor-pointer transition-colors"
          >
            <span>Practice Scenario Now</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Goal Configuration Editor */}
      {isEditing && (
        <div className="p-4 rounded-2xl bg-slate-950 border border-white/10 space-y-3 animate-in fade-in">
          {/* Goal Type Switcher */}
          <div>
            <label className="text-xs font-bold text-slate-300 block mb-1.5">
              Goal Tracking Metric
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleSetType('minutes')}
                className={`py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer border transition-all ${
                  goal.type === 'minutes'
                    ? 'bg-emerald-500 text-slate-950 border-emerald-400 shadow-md font-black'
                    : 'bg-slate-900 text-slate-400 border-white/10 hover:text-white'
                }`}
              >
                <Clock className="w-3.5 h-3.5" />
                <span>Duration (Minutes)</span>
              </button>

              <button
                type="button"
                onClick={() => handleSetType('lessons')}
                className={`py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer border transition-all ${
                  goal.type === 'lessons'
                    ? 'bg-emerald-500 text-slate-950 border-emerald-400 shadow-md font-black'
                    : 'bg-slate-900 text-slate-400 border-white/10 hover:text-white'
                }`}
              >
                <BookOpen className="w-3.5 h-3.5" />
                <span>Lessons / Scenarios</span>
              </button>
            </div>
          </div>

          {/* Target Value Presets */}
          <div>
            <label className="text-xs font-bold text-slate-300 block mb-1.5">
              Target {goal.type === 'minutes' ? 'Minutes per Day' : 'Completed Lessons per Day'}
            </label>
            <div className="flex flex-wrap gap-2">
              {(goal.type === 'minutes' ? minutePresets : lessonPresets).map((val) => (
                <button
                  key={val}
                  type="button"
                  onClick={() => handleSetTarget(val)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold cursor-pointer transition-all ${
                    goal.target === val
                      ? 'bg-gradient-to-r from-emerald-500 to-teal-400 text-slate-950 font-black shadow-md'
                      : 'bg-slate-800 text-slate-300 hover:bg-slate-700 border border-white/5'
                  }`}
                >
                  {val} {goal.type === 'minutes' ? 'Mins' : 'Lessons'}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
