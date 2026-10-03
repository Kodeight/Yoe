import React from 'react';
import { useApp } from '../context/AppContext';
import { getTranslation } from '../utils/i18n';
import {
  User as UserIcon,
  Settings,
  ChevronRight,
  Flame,
  Star,
  Clock,
  Compass,
  Award,
  Globe,
  CheckCircle2,
  BookOpen
} from 'lucide-react';
import { SUPPORTED_LANGUAGES } from '../constants/languages';

export const ProfileView: React.FC = () => {
  const {
    user,
    journeys,
    activeJourney,
    setActiveJourney,
    setActiveView,
    vocabulary,
    mistakes,
    uiLanguage
  } = useApp();

  const t = getTranslation(uiLanguage);

  const targetLangMeta = SUPPORTED_LANGUAGES.find(
    (l) => l.code === (activeJourney?.targetLanguage || 'es')
  );
  const supportLangMeta = SUPPORTED_LANGUAGES.find(
    (l) => l.code === (activeJourney?.supportLanguage || 'en')
  );

  return (
    <div className="pb-28 pt-4 px-4 max-w-md mx-auto space-y-4 animate-in fade-in duration-300">

      {/* Profile Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-[var(--text-primary)] tracking-tight flex items-center gap-2">
            <UserIcon className="w-5 h-5 text-emerald-400" />
            <span>{t.profileTitle}</span>
          </h1>
          <p className="text-xs text-[var(--text-secondary)] mt-0.5">
            {t.profileSubtitle}
          </p>
        </div>

        {/* Quick Settings Icon Button - Theme Contrast Neutral Surface (Requirement 10) */}
        <button
          onClick={() => setActiveView('profile-settings')}
          className="p-2.5 rounded-2xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800/80 dark:hover:bg-slate-700/80 border border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-200 shadow-sm transition-all cursor-pointer"
          title={t.openSettings}
          aria-label={t.openSettings}
        >
          <Settings className="w-4 h-4 text-slate-700 dark:text-slate-200" />
        </button>
      </div>

      {/* SECTION 1: USER IDENTITY CARD */}
      <div className="rounded-3xl glass-card p-4.5 shadow-md space-y-3.5">
        <div className="flex items-center gap-3.5">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-emerald-400 via-teal-400 to-cyan-400 flex items-center justify-center text-slate-950 font-black text-xl shadow-lg shrink-0">
            {user?.name ? user.name[0].toUpperCase() : 'Y'}
          </div>
          <div className="min-w-0 flex-1">
            <h2 className="text-base font-bold text-[var(--text-primary)] truncate">
              {user?.name || 'Language Learner'}
            </h2>
            <p className="text-xs text-[var(--text-secondary)] font-mono truncate">
              @{user?.username || 'learner'}
            </p>
            <p className="text-[11px] text-[var(--text-muted)] truncate mt-0.5">
              {user?.email || 'No email registered'}
            </p>
          </div>
        </div>

        {/* Real Journey Metrics Banner */}
        {activeJourney && (
          <div className="pt-3 border-t border-white/10 dark:border-white/10 light-mode:border-slate-200 grid grid-cols-3 gap-2 text-center">
            <div className="p-2.5 rounded-xl glass-pill">
              <div className="text-[10px] text-[var(--text-muted)] font-medium flex items-center justify-center gap-1">
                <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />
                <span>{t.points}</span>
              </div>
              <div className="text-xs font-black text-emerald-400 mt-1">
                {activeJourney.points || 0} XP
              </div>
            </div>
            <div className="p-2.5 rounded-xl glass-pill">
              <div className="text-[10px] text-[var(--text-muted)] font-medium flex items-center justify-center gap-1">
                <Flame className="w-3 h-3 text-amber-500 fill-amber-500" />
                <span>{t.streak}</span>
              </div>
              <div className="text-xs font-black text-amber-400 mt-1">
                {activeJourney.streakDays || 1}d
              </div>
            </div>
            <div className="p-2.5 rounded-xl glass-pill">
              <div className="text-[10px] text-[var(--text-muted)] font-medium flex items-center justify-center gap-1">
                <Clock className="w-3 h-3 text-cyan-400" />
                <span>{t.spokenTime}</span>
              </div>
              <div className="text-xs font-black text-cyan-400 mt-1">
                {activeJourney.totalMinutesSpoken || 0}m
              </div>
            </div>
          </div>
        )}
      </div>

      {/* SECTION 2: ACTIVE LEARNING PROFILE & JOURNEY */}
      <div className="rounded-3xl glass-card p-4.5 shadow-md space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Compass className="w-4 h-4 text-emerald-400" />
            <h3 className="text-xs font-bold text-[var(--text-primary)]">
              {t.activeJourneys}
            </h3>
          </div>
          <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
            {activeJourney?.cefrLevel || 'A1'}
          </span>
        </div>

        {activeJourney ? (
          <div className="p-3.5 rounded-2xl bg-white/5 dark:bg-white/5 light-mode:bg-white border border-white/10 dark:border-white/10 light-mode:border-slate-200 space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <span className="text-2xl">{targetLangMeta?.flag || '🌐'}</span>
                <div>
                  <h4 className="text-xs font-bold text-[var(--text-primary)]">
                    {targetLangMeta?.name || 'Spanish'} ({targetLangMeta?.nativeName || 'Español'})
                  </h4>
                  <p className="text-[10px] text-[var(--text-secondary)]">
                    Explanation Language: {supportLangMeta?.name || 'English'}
                  </p>
                </div>
              </div>
              <div className="px-2 py-1 rounded-xl bg-emerald-500/15 text-emerald-400 text-[10px] font-black">
                Active
              </div>
            </div>

            <div className="flex items-center justify-between text-[11px] text-[var(--text-muted)] pt-1 border-t border-white/5 dark:border-white/5 light-mode:border-slate-100">
              <span className="flex items-center gap-1">
                <BookOpen className="w-3 h-3 text-emerald-400" />
                <span>Vocabulary Bank: {vocabulary.length} words</span>
              </span>
              <span>Review items: {mistakes.length}</span>
            </div>
          </div>
        ) : (
          <p className="text-xs text-[var(--text-secondary)]">No active learning journey selected.</p>
        )}

        {/* Multiple Journeys Switcher if user has more than 1 */}
        {journeys.length > 1 && (
          <div className="pt-2 space-y-1.5">
            <span className="text-[10px] text-[var(--text-muted)] uppercase tracking-wider font-bold">
              Switch Target Language
            </span>
            <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
              {journeys.map((j) => {
                const lang = SUPPORTED_LANGUAGES.find((l) => l.code === j.targetLanguage);
                const isSelected = j.id === activeJourney?.id;
                return (
                  <button
                    key={j.id}
                    onClick={() => setActiveJourney(j)}
                    className={`py-1.5 px-3 rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer shrink-0 transition-all ${
                      isSelected
                        ? 'bg-emerald-500 text-white shadow-sm'
                        : 'glass-pill text-[var(--text-secondary)] hover:border-emerald-500/40'
                    }`}
                  >
                    <span>{lang?.flag || '🌐'}</span>
                    <span>{lang?.name}</span>
                    <span className="text-[10px] opacity-80 uppercase">({j.cefrLevel})</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* SECTION 3: WEEKLY SPEAKING GOAL */}
      <div className="rounded-3xl glass-card p-4.5 shadow-md space-y-2.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Award className="w-4 h-4 text-amber-400" />
            <h3 className="text-xs font-bold text-[var(--text-primary)]">
              {t.learningGoals}
            </h3>
          </div>
          <span className="text-xs font-black text-emerald-400">
            {Math.min(7, activeJourney?.streakDays || 1)} / 7 Days
          </span>
        </div>

        <div className="w-full bg-slate-800/80 rounded-full h-2 overflow-hidden">
          <div
            className="bg-gradient-to-r from-emerald-400 to-cyan-400 h-full rounded-full transition-all duration-500"
            style={{ width: `${Math.min(100, Math.round(((activeJourney?.streakDays || 1) / 7) * 100))}%` }}
          />
        </div>
        <p className="text-[11px] text-[var(--text-muted)] italic">
          {t.practiceMore}
        </p>
      </div>

      {/* SECTION 4: CHILD NAVIGATION LINK TO SETTINGS */}
      <div className="rounded-3xl glass-card p-2 shadow-md">
        <button
          type="button"
          onClick={() => setActiveView('profile-settings')}
          className="w-full p-3 rounded-2xl glass-pill hover:bg-emerald-500/10 hover:border-emerald-500/40 transition-all flex items-center justify-between cursor-pointer group"
        >
          <div className="flex items-center gap-3 text-start">
            <div className="p-2 rounded-xl bg-emerald-500/15 text-emerald-400 group-hover:scale-105 transition-transform">
              <Settings className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-[var(--text-primary)] group-hover:text-emerald-400 transition-colors">
                {t.openSettings}
              </h4>
              <p className="text-[10px] text-[var(--text-muted)]">
                {t.settingsSubtitle}
              </p>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-emerald-400 group-hover:translate-x-0.5 rtl:group-hover:-translate-x-0.5 rtl-mirror transition-all" />
        </button>
      </div>

    </div>
  );
};
