import React, { useState } from 'react';
import { Award, Shield, Star, Gem, Crown, Trophy, CheckCircle2, Lock, ChevronRight, Sparkles, BookOpen } from 'lucide-react';
import { CEFRLevel } from '../types';

interface BadgeTier {
  level: CEFRLevel;
  title: string;
  subtitle: string;
  requiredLessons: number;
  requiredMinutes: number;
  requiredPoints: number;
  color: string;
  gradient: string;
  border: string;
  shadow: string;
  badgeIcon: React.ReactNode;
  canDo: string[];
}

export const CEFR_TIERS: BadgeTier[] = [
  {
    level: 'A1',
    title: 'Breakthrough',
    subtitle: 'Beginner Explorer',
    requiredLessons: 1,
    requiredMinutes: 10,
    requiredPoints: 100,
    color: 'text-amber-400',
    gradient: 'from-amber-600/30 via-amber-500/20 to-orange-500/10',
    border: 'border-amber-500/40',
    shadow: 'shadow-amber-500/20',
    badgeIcon: <Shield className="w-5 h-5 text-amber-400" />,
    canDo: [
      'Introduce yourself and ask basic questions',
      'Understand simple everyday greetings and directions',
      'Order food and coffee in local cafes'
    ]
  },
  {
    level: 'A2',
    title: 'Waystage',
    subtitle: 'Elementary Speaker',
    requiredLessons: 5,
    requiredMinutes: 40,
    requiredPoints: 800,
    color: 'text-emerald-400',
    gradient: 'from-emerald-600/30 via-teal-500/20 to-emerald-500/10',
    border: 'border-emerald-500/50',
    shadow: 'shadow-emerald-500/25',
    badgeIcon: <Award className="w-5 h-5 text-emerald-400" />,
    canDo: [
      'Communicate in routine airport and transit tasks',
      'Describe background, immediate environment, and shopping needs',
      'Handle simple social small talk with friendly locals'
    ]
  },
  {
    level: 'B1',
    title: 'Threshold',
    subtitle: 'Intermediate Conversationalist',
    requiredLessons: 15,
    requiredMinutes: 120,
    requiredPoints: 2000,
    color: 'text-cyan-400',
    gradient: 'from-cyan-600/30 via-blue-500/20 to-teal-500/10',
    border: 'border-cyan-500/40',
    shadow: 'shadow-cyan-500/20',
    badgeIcon: <Star className="w-5 h-5 text-cyan-400" />,
    canDo: [
      'Express opinions, plans, and describe travel experiences',
      'Handle most travel situations with confidence',
      'Narrate stories and explain feelings naturally'
    ]
  },
  {
    level: 'B2',
    title: 'Vantage',
    subtitle: 'Upper Intermediate Fluent',
    requiredLessons: 30,
    requiredMinutes: 300,
    requiredPoints: 4500,
    color: 'text-indigo-400',
    gradient: 'from-indigo-600/30 via-purple-500/20 to-blue-500/10',
    border: 'border-indigo-500/40',
    shadow: 'shadow-indigo-500/20',
    badgeIcon: <Gem className="w-5 h-5 text-indigo-400" />,
    canDo: [
      'Interact with native speakers fluently without strain',
      'Discuss complex cultural topics and negotiate terms',
      'Present arguments and weigh pros and cons dynamically'
    ]
  },
  {
    level: 'C1',
    title: 'Effective Proficiency',
    subtitle: 'Advanced Speaker',
    requiredLessons: 50,
    requiredMinutes: 600,
    requiredPoints: 8000,
    color: 'text-purple-400',
    gradient: 'from-purple-600/30 via-pink-500/20 to-indigo-500/10',
    border: 'border-purple-500/40',
    shadow: 'shadow-purple-500/20',
    badgeIcon: <Crown className="w-5 h-5 text-purple-400" />,
    canDo: [
      'Express ideas fluently and spontaneously with idiom mastery',
      'Use language flexibly for social, academic, and professional goals',
      'Produce clear, well-structured, detailed discourse on complex topics'
    ]
  },
  {
    level: 'C2',
    title: 'Mastery',
    subtitle: 'Near-Native Master',
    requiredLessons: 75,
    requiredMinutes: 1000,
    requiredPoints: 12000,
    color: 'text-amber-300',
    gradient: 'from-amber-400/40 via-yellow-500/30 to-rose-500/20',
    border: 'border-amber-300/50',
    shadow: 'shadow-amber-400/30',
    badgeIcon: <Trophy className="w-5 h-5 text-amber-300" />,
    canDo: [
      'Effortless understanding of anything heard or read',
      'Reconstruct arguments from diverse sources coherently',
      'Spontaneous, precise expression differentiating finer shades of nuance'
    ]
  }
];

export const CefrBadgeSystem: React.FC<{
  currentLevel?: CEFRLevel;
  totalCompletedLessons?: number;
  totalMinutes?: number;
  totalPoints?: number;
}> = ({
  currentLevel = 'A2',
  totalCompletedLessons = 7,
  totalMinutes = 48,
  totalPoints = 1240
}) => {
  const [selectedTier, setSelectedTier] = useState<BadgeTier | null>(null);

  const currentIndex = CEFR_TIERS.findIndex(t => t.level === currentLevel);
  const activeBadge = CEFR_TIERS[currentIndex >= 0 ? currentIndex : 1];
  const nextBadge = currentIndex < CEFR_TIERS.length - 1 ? CEFR_TIERS[currentIndex + 1] : null;

  // Calculate progress toward next badge
  let progressPercent = 100;
  if (nextBadge) {
    const currentBase = activeBadge.requiredLessons;
    const nextTarget = nextBadge.requiredLessons;
    const progress = (totalCompletedLessons - currentBase) / (nextTarget - currentBase);
    progressPercent = Math.min(Math.max(Math.round(progress * 100), 15), 90);
  }

  return (
    <div className="rounded-3xl bg-slate-900/90 border border-white/10 p-5 shadow-xl space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400">
            <Award className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-100 dark:text-slate-100 light-mode:text-slate-900 flex items-center gap-2">
              <span>CEFR Language Proficiency Badge</span>
            </h3>
            <p className="text-[11px] text-slate-400 dark:text-slate-400 light-mode:text-slate-500">
              Verified by completed scenario lessons & speaking volume
            </p>
          </div>
        </div>

        <span className="px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs font-black">
          Level {activeBadge.level}
        </span>
      </div>

      {/* Main Active Badge Card */}
      <div className={`rounded-2xl bg-gradient-to-br ${activeBadge.gradient} border ${activeBadge.border} p-4 shadow-lg ${activeBadge.shadow} relative overflow-hidden`}>
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3.5">
            <div className={`w-14 h-14 rounded-2xl bg-slate-950/80 border ${activeBadge.border} flex items-center justify-center text-2xl shadow-md shrink-0`}>
              {activeBadge.badgeIcon}
            </div>

            <div>
              <div className="flex items-center gap-2">
                <span className="text-base font-black text-white">
                  {activeBadge.level} · {activeBadge.title}
                </span>
                <span className="px-2 py-0.2 rounded-full bg-white/10 text-[10px] font-bold text-slate-200">
                  {activeBadge.subtitle}
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-1 line-clamp-1">
                Unlocked with {totalCompletedLessons} lessons completed & {totalMinutes}m spoken practice
              </p>
            </div>
          </div>
        </div>

        {/* Progress to next badge */}
        {nextBadge && (
          <div className="mt-3 pt-3 border-t border-white/10 space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-300 font-semibold flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                <span>Next Badge: {nextBadge.level} ({nextBadge.title})</span>
              </span>
              <span className="text-cyan-400 font-bold">{progressPercent}%</span>
            </div>
            <div className="w-full h-2 rounded-full bg-slate-950/80 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-emerald-500 via-teal-400 to-cyan-400 rounded-full transition-all duration-500"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
            <div className="text-[10px] text-slate-400 flex items-center justify-between">
              <span>{totalCompletedLessons} / {nextBadge.requiredLessons} completed lessons</span>
              <span>{Math.max(nextBadge.requiredLessons - totalCompletedLessons, 1)} lessons to level up</span>
            </div>
          </div>
        )}
      </div>

      {/* Tier Badges Strip */}
      <div className="space-y-2">
        <label className="text-xs font-bold text-slate-300 block">
          Proficiency Tier Roadmap (Click any tier to inspect competencies)
        </label>

        <div className="grid grid-cols-6 gap-1.5">
          {CEFR_TIERS.map((tier, idx) => {
            const isUnlocked = idx <= currentIndex;
            const isCurrent = tier.level === currentLevel;

            return (
              <button
                key={tier.level}
                type="button"
                onClick={() => setSelectedTier(tier)}
                className={`py-2 px-1 rounded-2xl border text-center transition-all cursor-pointer flex flex-col items-center gap-1 ${
                  isCurrent
                    ? `${tier.border} bg-white/10 ring-2 ring-emerald-400 shadow-md`
                    : isUnlocked
                    ? 'border-emerald-500/30 bg-emerald-500/10 text-slate-200'
                    : 'border-white/5 bg-slate-950/60 text-slate-500 hover:border-white/10'
                }`}
              >
                <div className={`w-6 h-6 rounded-xl flex items-center justify-center text-xs ${
                  isUnlocked ? 'text-white' : 'text-slate-600'
                }`}>
                  {isUnlocked ? tier.badgeIcon : <Lock className="w-3.5 h-3.5" />}
                </div>

                <span className={`text-[11px] font-black ${isUnlocked ? 'text-white' : 'text-slate-500'}`}>
                  {tier.level}
                </span>

                <span className={`text-[8px] font-bold uppercase truncate max-w-full px-0.5 ${
                  isCurrent ? 'text-emerald-400' : isUnlocked ? 'text-slate-400' : 'text-slate-600'
                }`}>
                  {isUnlocked ? 'Unlocked' : `${tier.requiredLessons}L`}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Modal / Card for inspecting competencies of selected tier */}
      {selectedTier && (
        <div className="p-3.5 rounded-2xl bg-slate-950 border border-white/10 space-y-2 animate-in fade-in">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className={`p-1.5 rounded-lg bg-white/5 ${selectedTier.color}`}>
                {selectedTier.badgeIcon}
              </div>
              <div>
                <h4 className="text-xs font-bold text-white">
                  Level {selectedTier.level} · {selectedTier.title} ({selectedTier.subtitle})
                </h4>
                <p className="text-[10px] text-slate-400">
                  Target: {selectedTier.requiredLessons} completed lessons · {selectedTier.requiredMinutes}m speaking time
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setSelectedTier(null)}
              className="text-xs text-slate-400 hover:text-white px-2 py-1 rounded bg-slate-800"
            >
              ✕
            </button>
          </div>

          <div className="space-y-1 pt-1">
            <span className="text-[10px] font-bold text-slate-300 uppercase tracking-wider block">
              Competencies Unlocked at this Level:
            </span>
            {selectedTier.canDo.map((item, i) => (
              <div key={i} className="flex items-start gap-1.5 text-[11px] text-slate-300">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 mt-0.5 shrink-0" />
                <span>{item}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
