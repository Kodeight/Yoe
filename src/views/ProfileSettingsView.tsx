import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { useAudio } from '../context/AudioContext';
import { PushNotificationScheduler } from '../components/PushNotificationScheduler';
import {
  User as UserIcon,
  Settings,
  Globe,
  Moon,
  Sun,
  LogOut,
  Volume2,
  Palette,
  Wifi,
  WifiOff,
  RefreshCw,
  Check,
  Compass,
  Award,
  BookOpen
} from 'lucide-react';
import { LanguageCode, CEFRLevel } from '../types';
import { SUPPORTED_LANGUAGES } from '../constants/languages';

export const ProfileSettingsView: React.FC = () => {
  const {
    user,
    journeys,
    activeJourney,
    setActiveJourney,
    updateActiveJourney,
    theme,
    setThemeMode,
    uiLanguage,
    setUiLanguage,
    logout,
    isOnline,
    cacheLearnedLessonsForOffline,
    vocabulary,
    mistakes
  } = useApp();

  const {
    notificationSoundsEnabled,
    speechFeedbackEnabled,
    toggleNotificationSounds,
    toggleSpeechFeedback
  } = useAudio();

  const [syncStatus, setSyncStatus] = useState<string>('');

  const handleManualCacheSync = () => {
    cacheLearnedLessonsForOffline();
    setSyncStatus('Lessons, vocabulary, and grammar cached to service worker!');
    setTimeout(() => setSyncStatus(''), 4000);
  };

  const handleSupportLangChange = (langCode: LanguageCode) => {
    if (activeJourney) {
      updateActiveJourney({ supportLanguage: langCode });
    }
  };

  const handleTargetJourneyChange = (journeyId: string) => {
    const match = journeys.find(j => j.id === journeyId);
    if (match) {
      setActiveJourney(match);
    }
  };

  const handleCefrLevelChange = (level: CEFRLevel) => {
    if (activeJourney) {
      updateActiveJourney({ cefrLevel: level });
    }
  };

  return (
    <div className="pb-28 pt-4 px-4 max-w-md mx-auto space-y-4 animate-in fade-in duration-300">

      {/* Page Title & Subtitle */}
      <div>
        <h1 className="text-xl font-bold text-[var(--text-primary)] tracking-tight flex items-center gap-2">
          <Settings className="w-5 h-5 text-emerald-400" />
          <span>Profile & Learning Settings</span>
        </h1>
        <p className="text-xs text-[var(--text-secondary)] mt-0.5">
          Manage your active learning journey, explanation language, and display theme
        </p>
      </div>

      {/* SECTION 1: ACCOUNT PROFILE */}
      <div className="rounded-3xl glass-card p-4.5 shadow-md space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-400 via-teal-400 to-cyan-400 flex items-center justify-center text-slate-950 font-black text-lg shadow-md">
              {user?.name ? user.name[0].toUpperCase() : 'Y'}
            </div>
            <div>
              <h2 className="text-sm font-bold text-[var(--text-primary)] flex items-center gap-1.5">
                <span>{user?.name || 'Language Learner'}</span>
              </h2>
              <p className="text-xs text-[var(--text-secondary)] font-mono">
                @{user?.username || 'learner'} · {user?.email || ''}
              </p>
            </div>
          </div>

          <button
            onClick={logout}
            className="p-2.5 rounded-2xl glass-pill hover:border-red-500/40 text-red-400 transition-colors cursor-pointer"
            title="Sign out of Yoe"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>

        {/* Real Journey Metrics Banner */}
        {activeJourney && (
          <div className="pt-2 border-t border-white/10 dark:border-white/10 light-mode:border-slate-200 grid grid-cols-3 gap-2 text-center">
            <div className="p-2 rounded-xl glass-pill">
              <div className="text-[10px] text-[var(--text-muted)] font-medium">Points</div>
              <div className="text-xs font-black text-emerald-400 mt-0.5">{activeJourney.points || 0} XP</div>
            </div>
            <div className="p-2 rounded-xl glass-pill">
              <div className="text-[10px] text-[var(--text-muted)] font-medium">Streak</div>
              <div className="text-xs font-black text-amber-400 mt-0.5">🔥 {activeJourney.streakDays || 1}d</div>
            </div>
            <div className="p-2 rounded-xl glass-pill">
              <div className="text-[10px] text-[var(--text-muted)] font-medium">Spoken</div>
              <div className="text-xs font-black text-cyan-400 mt-0.5">{activeJourney.totalMinutesSpoken || 0} min</div>
            </div>
          </div>
        )}
      </div>

      {/* SECTION 2: LEARNING JOURNEY & LANGUAGE SELECTORS OVERHAUL */}
      <div className="rounded-3xl glass-card p-4.5 shadow-md space-y-4">
        <div className="flex items-center gap-2 mb-1">
          <Globe className="w-4 h-4 text-emerald-400" />
          <h3 className="text-xs font-bold text-[var(--text-primary)]">
            Active Journey & Language Configuration
          </h3>
        </div>

        {/* Active Target Language Journey Selector */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-[var(--text-primary)] block">
            Active Learning Language / Journey:
          </label>
          <select
            value={activeJourney?.id || ''}
            onChange={(e) => handleTargetJourneyChange(e.target.value)}
            className="settings-select"
          >
            {journeys.map((j) => {
              const langInfo = SUPPORTED_LANGUAGES.find(l => l.code === j.targetLanguage) || { flag: '🌐', name: j.targetLanguage };
              return (
                <option
                  key={j.id}
                  value={j.id}
                  className="bg-slate-900 text-white dark:bg-slate-900 light-mode:bg-white light-mode:text-slate-900 font-semibold"
                >
                  {langInfo.flag} {langInfo.name} Journey ({j.cefrLevel || 'A1'})
                </option>
              );
            })}
          </select>
        </div>

        {/* Support / Explanation Language Selector */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-[var(--text-primary)] block">
            Explanation / Support Language:
          </label>
          <p className="text-[11px] text-[var(--text-secondary)] -mt-1 mb-1">
            Language Yoe uses to explain grammar, clarify meanings, and assist you when you need help
          </p>
          <select
            value={activeJourney?.supportLanguage || 'en'}
            onChange={(e) => handleSupportLangChange(e.target.value as LanguageCode)}
            className="settings-select"
          >
            {SUPPORTED_LANGUAGES.map((l) => (
              <option
                key={l.code}
                value={l.code}
                className="bg-slate-900 text-white dark:bg-slate-900 light-mode:bg-white light-mode:text-slate-900 font-semibold"
              >
                {l.flag} {l.name} ({l.nativeName})
              </option>
            ))}
          </select>
        </div>

        {/* Working CEFR Level Selector */}
        <div className="space-y-1.5 pt-1">
          <label className="text-xs font-bold text-[var(--text-primary)] block">
            Learner CEFR Proficiency Level:
          </label>
          <select
            value={activeJourney?.cefrLevel || 'A1'}
            onChange={(e) => handleCefrLevelChange(e.target.value as CEFRLevel)}
            className="settings-select"
          >
            <option value="A1" className="bg-slate-900 text-white dark:bg-slate-900 light-mode:bg-white light-mode:text-slate-900">
              A1 — Beginner (Basic phrases & simple daily expressions)
            </option>
            <option value="A2" className="bg-slate-900 text-white dark:bg-slate-900 light-mode:bg-white light-mode:text-slate-900">
              A2 — Elementary (Everyday routine conversations & travel)
            </option>
            <option value="B1" className="bg-slate-900 text-white dark:bg-slate-900 light-mode:bg-white light-mode:text-slate-900">
              B1 — Intermediate (Spontaneous dialogue & opinions)
            </option>
            <option value="B2" className="bg-slate-900 text-white dark:bg-slate-900 light-mode:bg-white light-mode:text-slate-900">
              B2 — Upper Intermediate (Technical topics & fluent discussion)
            </option>
            <option value="C1" className="bg-slate-900 text-white dark:bg-slate-900 light-mode:bg-white light-mode:text-slate-900">
              C1 — Advanced (Nuanced, effortless professional speech)
            </option>
            <option value="C2" className="bg-slate-900 text-white dark:bg-slate-900 light-mode:bg-white light-mode:text-slate-900">
              C2 — Mastery (Native-level precision & idiom mastery)
            </option>
          </select>
        </div>

        {/* App UI Interface Language Selector */}
        <div className="space-y-1.5 pt-1">
          <label className="text-xs font-bold text-[var(--text-primary)] block">
            App Interface Language:
          </label>
          <select
            value={uiLanguage}
            onChange={(e) => setUiLanguage(e.target.value as LanguageCode)}
            className="settings-select"
          >
            {SUPPORTED_LANGUAGES.map((l) => (
              <option
                key={l.code}
                value={l.code}
                className="bg-slate-900 text-white dark:bg-slate-900 light-mode:bg-white light-mode:text-slate-900 font-semibold"
              >
                {l.flag} {l.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* SECTION 3: THEME MODE (LIGHT / DARK) */}
      <div className="rounded-3xl glass-card p-4.5 shadow-md space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Palette className="w-4 h-4 text-emerald-400" />
            <div>
              <h3 className="text-xs font-bold text-[var(--text-primary)]">
                Display Theme Mode
              </h3>
              <p className="text-[10px] text-[var(--text-secondary)]">
                Select your preferred visual theme
              </p>
            </div>
          </div>

          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-emerald-500/15 text-emerald-400 border border-emerald-500/25">
            {theme === 'dark' ? 'Dark Mode' : 'Light Mode'}
          </span>
        </div>

        {/* Segmented Theme Mode Selector */}
        <div className="grid grid-cols-2 gap-2 pt-1">
          <button
            type="button"
            onClick={() => setThemeMode('dark')}
            className={`py-3 px-3 rounded-2xl text-xs font-bold flex items-center justify-center gap-2 cursor-pointer border transition-all ${
              theme === 'dark'
                ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 shadow-md font-extrabold'
                : 'glass-pill text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
            }`}
          >
            <Moon className="w-4 h-4 text-cyan-400" />
            <span>Dark Mode</span>
            {theme === 'dark' && <Check className="w-3.5 h-3.5 text-emerald-400 ml-1" />}
          </button>

          <button
            type="button"
            onClick={() => setThemeMode('light')}
            className={`py-3 px-3 rounded-2xl text-xs font-bold flex items-center justify-center gap-2 cursor-pointer border transition-all ${
              theme === 'light'
                ? 'bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border-emerald-500/40 shadow-md font-extrabold'
                : 'glass-pill text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
            }`}
          >
            <Sun className="w-4 h-4 text-amber-500" />
            <span>Light Mode</span>
            {theme === 'light' && <Check className="w-3.5 h-3.5 text-emerald-600 ml-1" />}
          </button>
        </div>
      </div>

      {/* SECTION 4: VOICE & AUDIO FEEDBACK */}
      <div className="rounded-3xl glass-card p-4.5 shadow-md space-y-3">
        <div className="flex items-center gap-2 mb-1">
          <Volume2 className="w-4 h-4 text-emerald-400" />
          <h3 className="text-xs font-bold text-[var(--text-primary)]">
            Speech & Audio Feedback
          </h3>
        </div>

        <div className="flex items-center justify-between">
          <div>
            <div className="text-xs font-semibold text-[var(--text-primary)]">
              Notification Chimes
            </div>
            <div className="text-[10px] text-[var(--text-secondary)]">
              Play sound feedback when messages and corrections arrive
            </div>
          </div>
          <button
            onClick={toggleNotificationSounds}
            className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer ${
              notificationSoundsEnabled ? 'bg-emerald-500' : 'bg-slate-700'
            }`}
          >
            <div
              className={`w-4 h-4 rounded-full bg-white transition-transform absolute top-1 left-1 ${
                notificationSoundsEnabled ? 'translate-x-5' : 'translate-x-0'
              }`}
            />
          </button>
        </div>

        <div className="flex items-center justify-between pt-2 border-t border-white/5 dark:border-white/5 light-mode:border-slate-200">
          <div>
            <div className="text-xs font-semibold text-[var(--text-primary)]">
              Scenario Speech Synthesis
            </div>
            <div className="text-[10px] text-[var(--text-secondary)]">
              Pronounces tutor dialogue in target language
            </div>
          </div>
          <button
            onClick={toggleSpeechFeedback}
            className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer ${
              speechFeedbackEnabled ? 'bg-emerald-500' : 'bg-slate-700'
            }`}
          >
            <div
              className={`w-4 h-4 rounded-full bg-white transition-transform absolute top-1 left-1 ${
                speechFeedbackEnabled ? 'translate-x-5' : 'translate-x-0'
              }`}
            />
          </button>
        </div>
      </div>

      {/* SECTION 5: PUSH REMINDERS */}
      <PushNotificationScheduler />

      {/* SECTION 6: OFFLINE LESSONS & STORAGE CACHE */}
      <div className="rounded-3xl glass-card p-4.5 shadow-md space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {isOnline ? <Wifi className="w-4 h-4 text-emerald-400" /> : <WifiOff className="w-4 h-4 text-amber-400" />}
            <div>
              <h3 className="text-xs font-bold text-[var(--text-primary)]">
                Offline Review Cache
              </h3>
              <p className="text-[10px] text-[var(--text-secondary)]">
                Service Worker caches vocabulary & grammar for offline study
              </p>
            </div>
          </div>

          <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
            isOnline
              ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
              : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
          }`}>
            {isOnline ? 'Online' : 'Offline Mode'}
          </span>
        </div>

        <div className="p-3 rounded-2xl glass-pill flex items-center justify-between text-xs">
          <div className="space-y-0.5">
            <div className="font-semibold text-[var(--text-primary)]">
              Cached for Offline Review:
            </div>
            <div className="text-[10px] text-[var(--text-secondary)]">
              {vocabulary.length} vocabulary words · {mistakes.length} grammar patterns
            </div>
          </div>

          <button
            type="button"
            onClick={handleManualCacheSync}
            className="px-3 py-1.5 rounded-xl bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/25 text-emerald-400 font-bold text-xs flex items-center gap-1 cursor-pointer transition-colors"
          >
            <RefreshCw className="w-3 h-3" />
            <span>Cache Now</span>
          </button>
        </div>

        {syncStatus && (
          <div className="p-2.5 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-[11px] font-medium flex items-center gap-1.5 animate-in fade-in">
            <Check className="w-3.5 h-3.5 text-emerald-400" />
            <span>{syncStatus}</span>
          </div>
        )}
      </div>

    </div>
  );
};
