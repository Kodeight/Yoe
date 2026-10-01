import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { useAudio } from '../context/AudioContext';
import { PushNotificationScheduler } from '../components/PushNotificationScheduler';
import { CefrBadgeSystem } from '../components/CefrBadgeSystem';
import { User, Settings, Globe, Moon, Sun, CreditCard, ShieldCheck, Check, LogOut, LogIn, Database, Volume2, Bell, Mic, Play, Palette, Wifi, WifiOff, RefreshCw } from 'lucide-react';
import { LanguageCode } from '../types';
import { SUPPORTED_LANGUAGES } from '../server/db';

export const ProfileSettingsView: React.FC = () => {
  const { user, activeJourney, theme, toggleTheme, setThemeMode, uiLanguage, setUiLanguage, createNewJourney, logout, setShowAuthModal, isOnline, cacheLearnedLessonsForOffline, vocabulary, mistakes } = useApp();
  const {
    notificationSoundsEnabled,
    speechFeedbackEnabled,
    toggleNotificationSounds,
    toggleSpeechFeedback,
    playNotificationSound,
    playFeedbackSound
  } = useAudio();
  const [selectedPlan, setSelectedPlan] = useState<'monthly' | 'yearly'>('yearly');
  const [syncStatus, setSyncStatus] = useState<string>('');

  const handleManualCacheSync = () => {
    cacheLearnedLessonsForOffline();
    setSyncStatus('Lessons, vocabulary, and grammar cached for offline review!');
    setTimeout(() => setSyncStatus(''), 4000);
  };

  const handleSupportLangChange = (langCode: LanguageCode) => {
    if (activeJourney) {
      createNewJourney(activeJourney.targetLanguage, langCode, activeJourney.cefrLevel);
    }
  };

  return (
    <div className="pb-24 pt-4 px-4 max-w-md mx-auto space-y-4 animate-in fade-in duration-300">

      {/* Header */}
      <div>
        <h1 className="text-xl font-bold text-slate-100 dark:text-slate-100 light-mode:text-slate-900 tracking-tight flex items-center gap-2">
          <User className="w-5 h-5 text-emerald-400" />
          <span>Profile & Settings</span>
        </h1>
        <p className="text-xs text-slate-400 dark:text-slate-400 light-mode:text-slate-500 mt-0.5">
          Manage language journeys, preferences, and subscription
        </p>
      </div>

      {/* User Card */}
      <div className="rounded-2xl bg-slate-900/80 dark:bg-slate-900/80 light-mode:bg-white border border-white/10 dark:border-white/10 light-mode:border-slate-200 p-4 flex items-center justify-between shadow-md">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-emerald-500 to-teal-400 text-slate-950 font-black text-lg flex items-center justify-center shrink-0">
            {user?.name?.[0] || 'A'}
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-100 dark:text-slate-100 light-mode:text-slate-900">
              {user?.name || 'Alex Rivera'}
            </h2>
            <p className="text-xs text-slate-400 dark:text-slate-400 light-mode:text-slate-500">
              {user?.email || 'learner@yoe.app'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setShowAuthModal(true)}
            className="px-2.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 flex items-center gap-1 border border-white/10 cursor-pointer transition-colors"
            title="Switch or Login Account"
          >
            <LogIn className="w-3.5 h-3.5 text-emerald-400" />
            <span className="hidden sm:inline">Switch</span>
          </button>
          <button
            onClick={logout}
            className="px-2.5 py-1.5 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-xs font-semibold text-red-400 flex items-center gap-1 border border-red-500/20 cursor-pointer transition-colors"
            title="Sign Out"
          >
            <LogOut className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Visual CEFR Language Proficiency Badge System */}
      <CefrBadgeSystem
        currentLevel={activeJourney?.cefrLevel || 'A2'}
        totalCompletedLessons={7}
        totalMinutes={activeJourney?.totalMinutesSpoken || 48}
        totalPoints={activeJourney?.points || 1240}
      />

      {/* Database Connection Ready Card */}
      <div className="rounded-2xl bg-slate-900/80 dark:bg-slate-900/80 light-mode:bg-white border border-white/10 dark:border-white/10 light-mode:border-slate-200 p-4 shadow-md space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Database className="w-4 h-4 text-emerald-400" />
            <h3 className="text-xs font-bold text-slate-100 dark:text-slate-100 light-mode:text-slate-900">
              Database Connection
            </h3>
          </div>
          <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] font-bold">
            PostgreSQL / Neon Ready
          </span>
        </div>
        <p className="text-[11px] text-slate-400 dark:text-slate-400 light-mode:text-slate-600">
          The app stores users, journeys, vocabulary, and mistake history locally and will connect to your Neon PostgreSQL database as soon as you provide <code className="bg-slate-950 px-1 py-0.5 rounded text-emerald-300 font-mono text-[10px]">DATABASE_URL</code> in environment secrets.
        </p>
      </div>

      {/* Language Concepts Settings */}
      <div className="rounded-2xl bg-slate-900/80 dark:bg-slate-900/80 light-mode:bg-white border border-white/10 dark:border-white/10 light-mode:border-slate-200 p-4 space-y-4 shadow-md">
        <h3 className="text-xs font-bold text-slate-200 dark:text-slate-200 light-mode:text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
          <Globe className="w-4 h-4 text-emerald-400" />
          <span>Language Preferences</span>
        </h3>

        {/* UI Language */}
        <div>
          <label className="text-xs font-semibold text-slate-300 dark:text-slate-300 light-mode:text-slate-700 block mb-1">
            UI Language (App Navigation)
          </label>
          <select
            value={uiLanguage}
            onChange={(e) => setUiLanguage(e.target.value as LanguageCode)}
            className="w-full bg-slate-950 dark:bg-slate-950 light-mode:bg-slate-100 border border-white/10 dark:border-white/10 light-mode:border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-100 dark:text-slate-100 light-mode:text-slate-900 focus:outline-none focus:border-emerald-400"
          >
            {SUPPORTED_LANGUAGES.map((lang) => (
              <option key={lang.code} value={lang.code}>
                {lang.flag} {lang.name} ({lang.nativeName})
              </option>
            ))}
          </select>
        </div>

        {/* Support / Explanation Language */}
        <div>
          <label className="text-xs font-semibold text-slate-300 dark:text-slate-300 light-mode:text-slate-700 block mb-1">
            Support Language (Explanations & Feedback)
          </label>
          <select
            value={activeJourney?.supportLanguage || 'en'}
            onChange={(e) => handleSupportLangChange(e.target.value as LanguageCode)}
            className="w-full bg-slate-950 dark:bg-slate-950 light-mode:bg-slate-100 border border-white/10 dark:border-white/10 light-mode:border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-100 dark:text-slate-100 light-mode:text-slate-900 focus:outline-none focus:border-emerald-400"
          >
            {SUPPORTED_LANGUAGES.map((lang) => (
              <option key={lang.code} value={lang.code}>
                {lang.flag} {lang.name} ({lang.nativeName})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Audio Settings */}
      <div className="rounded-2xl bg-slate-900/80 dark:bg-slate-900/80 light-mode:bg-white border border-white/10 dark:border-white/10 light-mode:border-slate-200 p-4 space-y-4 shadow-md">
        <div>
          <h3 className="text-xs font-bold text-slate-200 dark:text-slate-200 light-mode:text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
            <Volume2 className="w-4 h-4 text-emerald-400" />
            <span>Audio Settings</span>
          </h3>
          <p className="text-[10px] text-slate-400 dark:text-slate-400 light-mode:text-slate-500 mt-0.5">
            Control speech feedback sound cues and in-app sound effects
          </p>
        </div>

        {/* Toggle 1: Notification Sounds */}
        <div className="flex items-center justify-between gap-3 pt-1">
          <div className="flex items-start gap-2.5">
            <div className="p-1.5 rounded-lg bg-amber-500/10 text-amber-400 mt-0.5 shrink-0">
              <Bell className="w-3.5 h-3.5" />
            </div>
            <div>
              <div className="text-xs font-bold text-slate-100 dark:text-slate-100 light-mode:text-slate-900 flex items-center gap-2">
                <span>Notification Sounds</span>
                {notificationSoundsEnabled && (
                  <button
                    type="button"
                    onClick={playNotificationSound}
                    className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-amber-500/20 text-amber-400 hover:bg-amber-500/30 flex items-center gap-0.5 cursor-pointer transition-colors"
                    title="Play chime preview"
                  >
                    <Play className="w-2.5 h-2.5" />
                    <span>Test</span>
                  </button>
                )}
              </div>
              <p className="text-[10px] text-slate-400 dark:text-slate-400 light-mode:text-slate-500">
                Play soft chime on objective completion and tutor messages
              </p>
            </div>
          </div>

          {/* Toggle Switch */}
          <button
            type="button"
            role="switch"
            aria-checked={notificationSoundsEnabled}
            onClick={toggleNotificationSounds}
            className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer shrink-0 focus:outline-none ${
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

        {/* Toggle 2: Speech-to-Text Feedback Audio */}
        <div className="flex items-center justify-between gap-3 pt-2 border-t border-white/5 dark:border-white/5 light-mode:border-slate-100">
          <div className="flex items-start gap-2.5">
            <div className="p-1.5 rounded-lg bg-teal-500/10 text-teal-400 mt-0.5 shrink-0">
              <Mic className="w-3.5 h-3.5" />
            </div>
            <div>
              <div className="text-xs font-bold text-slate-100 dark:text-slate-100 light-mode:text-slate-900 flex items-center gap-2">
                <span>Speech-to-Text Feedback Audio</span>
                {speechFeedbackEnabled && (
                  <button
                    type="button"
                    onClick={() => playFeedbackSound('start')}
                    className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-teal-500/20 text-teal-400 hover:bg-teal-500/30 flex items-center gap-0.5 cursor-pointer transition-colors"
                    title="Play cue preview"
                  >
                    <Play className="w-2.5 h-2.5" />
                    <span>Test</span>
                  </button>
                )}
              </div>
              <p className="text-[10px] text-slate-400 dark:text-slate-400 light-mode:text-slate-500">
                Play subtle auditory tone when microphone starts listening and stops
              </p>
            </div>
          </div>

          {/* Toggle Switch */}
          <button
            type="button"
            role="switch"
            aria-checked={speechFeedbackEnabled}
            onClick={toggleSpeechFeedback}
            className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer shrink-0 focus:outline-none ${
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

      {/* Push Notification Daily Reminders */}
      <PushNotificationScheduler />

      {/* Global Theme Toggle with LocalStorage Persistence */}
      <div className="rounded-2xl bg-slate-900/80 dark:bg-slate-900/80 light-mode:bg-white border border-white/10 dark:border-white/10 light-mode:border-slate-200 p-4 shadow-md space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Palette className="w-4 h-4 text-emerald-400" />
            <div>
              <h3 className="text-xs font-bold text-slate-100 dark:text-slate-100 light-mode:text-slate-900">
                Global Theme Mode
              </h3>
              <p className="text-[10px] text-slate-400 dark:text-slate-400 light-mode:text-slate-500">
                Switches color scheme and saves preference to local storage
              </p>
            </div>
          </div>

          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            {theme === 'dark' ? 'Dark Mode' : 'Light Mode'}
          </span>
        </div>

        {/* Dual Segmented Buttons */}
        <div className="grid grid-cols-2 gap-2 pt-1">
          <button
            type="button"
            onClick={() => setThemeMode('dark')}
            className={`py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-2 cursor-pointer border transition-all ${
              theme === 'dark'
                ? 'bg-gradient-to-r from-indigo-600 to-slate-800 text-white border-indigo-400/50 shadow-md shadow-indigo-500/20'
                : 'bg-slate-950/60 dark:bg-slate-950/60 light-mode:bg-slate-100 text-slate-400 hover:text-slate-200 border-white/5 dark:border-white/5 light-mode:border-slate-200'
            }`}
          >
            <Moon className="w-3.5 h-3.5 text-indigo-400" />
            <span>Dark Theme</span>
            {theme === 'dark' && <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 ml-1" />}
          </button>

          <button
            type="button"
            onClick={() => setThemeMode('light')}
            className={`py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-2 cursor-pointer border transition-all ${
              theme === 'light'
                ? 'bg-gradient-to-r from-amber-400 to-orange-400 text-slate-950 border-amber-300 font-black shadow-md'
                : 'bg-slate-950/60 dark:bg-slate-950/60 light-mode:bg-slate-100 text-slate-400 hover:text-slate-200 border-white/5 dark:border-white/5 light-mode:border-slate-200'
            }`}
          >
            <Sun className="w-3.5 h-3.5 text-amber-500" />
            <span>Light Theme</span>
            {theme === 'light' && <span className="w-1.5 h-1.5 rounded-full bg-slate-950 ml-1" />}
          </button>
        </div>
      </div>

      {/* Offline Lessons & Review Cache Manager */}
      <div className="rounded-2xl bg-slate-900/80 dark:bg-slate-900/80 light-mode:bg-white border border-white/10 dark:border-white/10 light-mode:border-slate-200 p-4 shadow-md space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {isOnline ? <Wifi className="w-4 h-4 text-emerald-400" /> : <WifiOff className="w-4 h-4 text-amber-400" />}
            <div>
              <h3 className="text-xs font-bold text-slate-100 dark:text-slate-100 light-mode:text-slate-900">
                Offline Lessons & Review Cache
              </h3>
              <p className="text-[10px] text-slate-400 dark:text-slate-400 light-mode:text-slate-500">
                Service worker listener caches vocabulary & grammar for offline study
              </p>
            </div>
          </div>

          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
            isOnline
              ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
              : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
          }`}>
            {isOnline ? 'Online' : 'Offline Mode'}
          </span>
        </div>

        <div className="p-3 rounded-xl bg-slate-950/60 dark:bg-slate-950/60 light-mode:bg-slate-100 border border-white/5 dark:border-white/5 light-mode:border-slate-200 flex items-center justify-between text-xs">
          <div className="space-y-0.5">
            <div className="font-semibold text-slate-200 dark:text-slate-200 light-mode:text-slate-800">
              Cached for Offline Review:
            </div>
            <div className="text-[10px] text-slate-400 dark:text-slate-400 light-mode:text-slate-500">
              {vocabulary.length} vocabulary words · {mistakes.length} grammar patterns
            </div>
          </div>

          <button
            type="button"
            onClick={handleManualCacheSync}
            className="px-2.5 py-1.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/20 text-emerald-400 font-bold text-xs flex items-center gap-1 cursor-pointer transition-colors"
          >
            <RefreshCw className="w-3 h-3" />
            <span>Cache Now</span>
          </button>
        </div>

        {syncStatus && (
          <div className="p-2 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-[11px] font-medium flex items-center gap-1.5 animate-in fade-in">
            <Check className="w-3.5 h-3.5 text-emerald-400" />
            <span>{syncStatus}</span>
          </div>
        )}
      </div>

      {/* Subscription Section */}
      <div className="rounded-2xl bg-slate-900/80 dark:bg-slate-900/80 light-mode:bg-white border border-white/10 dark:border-white/10 light-mode:border-slate-200 p-4 space-y-3 shadow-md">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CreditCard className="w-4 h-4 text-emerald-400" />
            <h3 className="text-xs font-bold text-slate-100 dark:text-slate-100 light-mode:text-slate-900">
              Subscription
            </h3>
          </div>
          <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[10px] font-bold uppercase">
            7-Day Free Trial
          </span>
        </div>

        <p className="text-xs text-slate-400 dark:text-slate-400 light-mode:text-slate-600">
          Unlimited AI tutor conversations, scenario worlds, and adaptive memory bank.
        </p>

        <div className="grid grid-cols-2 gap-2 pt-2">
          <button
            onClick={() => setSelectedPlan('monthly')}
            className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
              selectedPlan === 'monthly'
                ? 'border-emerald-400 bg-emerald-500/10 text-slate-100'
                : 'border-white/10 bg-slate-950 text-slate-400'
            }`}
          >
            <div className="text-xs font-bold">Monthly Pro</div>
            <div className="text-sm font-extrabold text-emerald-400 mt-1">$9.99 / mo</div>
          </button>

          <button
            onClick={() => setSelectedPlan('yearly')}
            className={`p-3 rounded-xl border text-left transition-all cursor-pointer relative ${
              selectedPlan === 'yearly'
                ? 'border-emerald-400 bg-emerald-500/10 text-slate-100'
                : 'border-white/10 bg-slate-950 text-slate-400'
            }`}
          >
            <span className="absolute -top-2 right-2 px-1.5 py-0.2 rounded bg-amber-500 text-slate-950 text-[9px] font-black uppercase">
              Save 33%
            </span>
            <div className="text-xs font-bold">Yearly Pro</div>
            <div className="text-sm font-extrabold text-emerald-400 mt-1">$79.99 / yr</div>
          </button>
        </div>

        <div className="pt-2 text-[10px] text-slate-500 flex items-center gap-1">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
          <span>Progress is NEVER locked or reset upon subscription change.</span>
        </div>
      </div>

    </div>
  );
};
