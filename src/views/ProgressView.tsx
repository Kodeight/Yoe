import React from 'react';
import { useApp } from '../context/AppContext';
import { BarChart2, Award, Flame, Mic, Star, Sparkles, TrendingUp } from 'lucide-react';
import { DailyStreakCounter } from '../components/DailyStreakCounter';
import { DailyLearningGoalCard } from '../components/DailyLearningGoalCard';
import { PushNotificationScheduler } from '../components/PushNotificationScheduler';

export const ProgressView: React.FC = () => {
  const { activeJourney } = useApp();

  const level = activeJourney?.cefrLevel || 'A2';
  const spokenMinutes = activeJourney?.totalMinutesSpoken || 48;
  const points = activeJourney?.points || 1240;
  const streakDays = activeJourney?.streakDays || 12;

  const competencies = [
    { label: 'Listening Comprehension', score: 78, color: 'from-emerald-500 to-teal-400' },
    { label: 'Speaking Confidence', score: 65, color: 'from-cyan-500 to-blue-400' },
    { label: 'Vocabulary Retention', score: 82, color: 'from-purple-500 to-indigo-400' },
    { label: 'Grammar Accuracy', score: 62, color: 'from-amber-500 to-orange-400' },
    { label: 'Conversational Fluency', score: 58, color: 'from-pink-500 to-rose-400' }
  ];

  return (
    <div className="pb-24 pt-4 px-4 max-w-md mx-auto space-y-4 animate-in fade-in duration-300">

      {/* Header */}
      <div>
        <h1 className="text-xl font-bold text-slate-100 dark:text-slate-100 light-mode:text-slate-900 tracking-tight flex items-center gap-2">
          <BarChart2 className="w-5 h-5 text-emerald-400" />
          <span>CEFR Progression & Stats</span>
        </h1>
        <p className="text-xs text-slate-400 dark:text-slate-400 light-mode:text-slate-500 mt-0.5">
          Accumulated evidence from real conversations
        </p>
      </div>

      {/* Main CEFR Level Meter Card */}
      <div className="rounded-3xl bg-gradient-to-br from-slate-900 via-slate-900/90 to-slate-950 border border-white/10 p-5 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />

        <div className="flex items-center justify-between mb-4">
          <div>
            <span className="text-[10px] font-extrabold uppercase tracking-widest text-emerald-400 block mb-0.5">
              Current Level
            </span>
            <h2 className="text-3xl font-black text-white tracking-tight flex items-center gap-2">
              <span>Level {level}</span>
              <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                Elementary
              </span>
            </h2>
          </div>

          <div className="w-14 h-14 rounded-2xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shadow-lg">
            <Award className="w-8 h-8" />
          </div>
        </div>

        {/* CEFR Scale */}
        <div className="grid grid-cols-6 gap-1 mb-3">
          {['A1', 'A2', 'B1', 'B2', 'C1', 'C2'].map((lvl) => {
            const isCurrent = lvl === level;
            const isPast = ['A1'].includes(lvl);
            return (
              <div
                key={lvl}
                className={`py-1.5 rounded-xl text-center text-xs font-bold transition-all ${
                  isCurrent
                    ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/30 scale-105'
                    : isPast
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                    : 'bg-slate-800 text-slate-500 border border-white/5'
                }`}
              >
                {lvl}
              </div>
            );
          })}
        </div>

        <div className="flex items-center justify-between text-xs text-slate-400">
          <span>64% towards B1 Intermediate</span>
          <span className="font-bold text-emerald-400 flex items-center gap-1">
            <TrendingUp className="w-3.5 h-3.5" /> +12% this week
          </span>
        </div>
      </div>

      {/* Daily Consecutive Streak Counter */}
      <DailyStreakCounter />

      {/* Daily Learning Goal with Progress Ring */}
      <DailyLearningGoalCard />

      {/* 3 Core Stats Row */}
      <div className="grid grid-cols-3 gap-2.5">
        <div className="rounded-2xl bg-slate-900/80 border border-white/10 p-3.5 text-center shadow-md">
          <Mic className="w-5 h-5 text-emerald-400 mx-auto mb-1" />
          <div className="text-base font-extrabold text-slate-100">{spokenMinutes}m</div>
          <div className="text-[10px] text-slate-400">Spoken Time</div>
        </div>

        <div className="rounded-2xl bg-slate-900/80 border border-white/10 p-3.5 text-center shadow-md">
          <Flame className="w-5 h-5 text-amber-500 fill-amber-500 mx-auto mb-1" />
          <div className="text-base font-extrabold text-slate-100">{streakDays} Days</div>
          <div className="text-[10px] text-slate-400">Total Streak</div>
        </div>

        <div className="rounded-2xl bg-slate-900/80 border border-white/10 p-3.5 text-center shadow-md">
          <Star className="w-5 h-5 text-yellow-400 fill-yellow-400 mx-auto mb-1" />
          <div className="text-base font-extrabold text-slate-100">{points}</div>
          <div className="text-[10px] text-slate-400">Total Points</div>
        </div>
      </div>

      {/* Daily Push Reminder Scheduler */}
      <PushNotificationScheduler />

      {/* Competencies Breakdown */}
      <div className="rounded-2xl bg-slate-900/80 border border-white/10 p-4 space-y-3.5 shadow-md">
        <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
          <Sparkles className="w-4 h-4 text-emerald-400" />
          <span>Skill Competency Breakdown</span>
        </h3>

        <div className="space-y-3">
          {competencies.map((c) => (
            <div key={c.label}>
              <div className="flex items-center justify-between text-xs font-semibold mb-1">
                <span className="text-slate-300">{c.label}</span>
                <span className="text-slate-100 font-bold">{c.score}%</span>
              </div>
              <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                <div
                  className={`h-full bg-gradient-to-r ${c.color} rounded-full`}
                  style={{ width: `${c.score}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};
