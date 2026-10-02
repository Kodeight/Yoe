import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { useAudio } from '../context/AudioContext';
import { PushNotificationScheduler } from '../components/PushNotificationScheduler';
import {
  User,
  Settings,
  Globe,
  Moon,
  Sun,
  CreditCard,
  ShieldCheck,
  Check,
  LogOut,
  Volume2,
  Bell,
  Mic,
  Palette,
  Wifi,
  WifiOff,
  RefreshCw,
  Database
} from 'lucide-react';
import { LanguageCode } from '../types';
import { SUPPORTED_LANGUAGES } from '../constants/languages';

export const ProfileSettingsView: React.FC = () => {
  const {
    user,
    activeJourney,
    theme,
    setThemeMode,
    uiLanguage,
    setUiLanguage,
    createNewJourney,
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
    toggleSpeechFeedback,
    playNotificationSound
  } = useAudio();

  const [selectedPlan, setSelectedPlan] = useState<'monthly' | 'yearly'>('yearly');
  const [syncStatus, setSyncStatus] = useState<string>('');

  const handleManualCacheSync = () => {
    cacheLearnedLessonsForOffline();
    setSyncStatus('Lessons, vocabulary, and grammar cached to service worker!');
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
          <Settings className="w-5 h-5 text-emerald-400" />
          <span>Profile & Preferences</span>
        </h1>
        <p className="text-xs text-slate-400 dark:text-slate-400 light-mode:text-slate-500 mt-0.5">
          Manage your learning journey, audio synthesis, and app settings
        </p>
      </div>

      {/* SECTION 1: ACCOUNT PROFILE */}
      <div className="rounded-2xl glass-card p-4 shadow-md space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-emerald-400 to-teal-400 flex items-center justify-center text-slate-950 font-black text-base shadow-md">
              {user?.name ? user.name[0].toUpperCase() : 'Y'}
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-100 dark:text-slate-100 light-mode:text-slate-900">
                {user?.name || 'Language Learner'}
              </h2>
              <p className="text-xs text-slate-400 dark:text-slate-400 light-mode:text-slate-500">
                {user?.email || 'Authenticated User'}
              </p>
            </div>
          </div>

          <button
            onClick={logout}
            className="p-2 rounded-xl glass-pill hover:border-red-500/40 text-red-400 transition-colors cursor-pointer"
            title="Sign out of Yoe"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* SECTION 2: LEARNING JOURNEY SETTINGS */}
      <div className="rounded-2xl glass-card p-4 shadow-md space-y-3">
        <div className="flex items-center gap-2 mb-1">
          <Globe className="w-4 h-4 text-cyan-400" />
          <h3 className="text-xs font-bold text-slate-100 dark:text-slate-100 light-mode:text-slate-900">
            Language Configuration
          </h3>
        </div>

        <div>
          <label className="text-[11px] font-medium text-slate-400 dark:text-slate-400 light-mode:text-slate-600 block mb-1">
            Explanation / Support Language:
          </label>
          <select
            value={activeJourney?.supportLanguage || 'en'}
            onChange={(e) => handleSupportLangChange(e.target.value as LanguageCode)}
            className="w-full bg-slate-950/60 dark:bg-slate-950/60 light-mode:bg-white border border-white/10 dark:border-white/10 light-mode:border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-100 dark:text-slate-100 light-mode:text-slate-900 focus:outline-none focus:border-emerald-400"
          >
            {SUPPORTED_LANGUAGES.map((l) => (
              <option key={l.code} value={l.code} className="bg-slate-900 text-white dark:bg-slate-900 light-mode:bg-white light-mode:text-slate-900">
                {l.flag} {l.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="text-[11px] font-medium text-slate-400 dark:text-slate-400 light-mode:text-slate-600 block mb-1">
            App UI Interface Language:
          </label>
          <select
            value={uiLanguage}
            onChange={(e) => setUiLanguage(e.target.value as LanguageCode)}
            className="w-full bg-slate-950/60 dark:bg-slate-950/60 light-mode:bg-white border border-white/10 dark:border-white/10 light-mode:border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-100 dark:text-slate-100 light-mode:text-slate-900 focus:outline-none focus:border-emerald-400"
          >
            {SUPPORTED_LANGUAGES.map((l) => (
              <option key={l.code} value={l.code} className="bg-slate-900 text-white dark:bg-slate-900 light-mode:bg-white light-mode:text-slate-900">
                {l.flag} {l.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* SECTION 3: GLOBAL THEME DISPLAY (LIGHT / DARK) */}
      <div className="rounded-2xl glass-card p-4 shadow-md space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Palette className="w-4 h-4 text-emerald-400" />
            <div>
              <h3 className="text-xs font-bold text-slate-100 dark:text-slate-100 light-mode:text-slate-900">
                Display Theme Mode
              </h3>
              <p className="text-[10px] text-slate-400 dark:text-slate-400 light-mode:text-slate-500">
                Persisted in local storage
              </p>
            </div>
          </div>

          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            {theme === 'dark' ? 'Dark Mode' : 'Light Mode'}
          </span>
        </div>

        {/* Segmented Liquid Glass Buttons */}
        <div className="grid grid-cols-2 gap-2 pt-1">
          <button
            type="button"
            onClick={() => setThemeMode('dark')}
            className={`py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-2 cursor-pointer border transition-all ${
              theme === 'dark'
                ? 'bg-gradient-to-r from-indigo-600 to-slate-800 text-white border-indigo-400/50 shadow-md'
                : 'glass-pill text-slate-400 hover:text-slate-200'
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
                : 'glass-pill text-slate-400 hover:text-slate-200'
            }`}
          >
            <Sun className="w-3.5 h-3.5 text-amber-500" />
            <span>Light Theme</span>
            {theme === 'light' && <span className="w-1.5 h-1.5 rounded-full bg-slate-950 ml-1" />}
          </button>
        </div>
      </div>

      {/* SECTION 4: VOICE & AUDIO FEEDBACK */}
      <div className="rounded-2xl glass-card p-4 shadow-md space-y-3">
        <div className="flex items-center gap-2 mb-1">
          <Volume2 className="w-4 h-4 text-emerald-400" />
          <h3 className="text-xs font-bold text-slate-100 dark:text-slate-100 light-mode:text-slate-900">
            Speech & Audio Feedback
          </h3>
        </div>

        <div className="flex items-center justify-between">
          <div>
            <div className="text-xs font-semibold text-slate-200 dark:text-slate-200 light-mode:text-slate-800">
              Notification Sounds
            </div>
            <div className="text-[10px] text-slate-400 dark:text-slate-400 light-mode:text-slate-500">
              Chimes when messages and corrections are received
            </div>
          </div>
          <button
            onClick={toggleNotificationSounds}
            className={`w-10 h-6 rounded-full transition-colors relative cursor-pointer ${
              notificationSoundsEnabled ? 'bg-emerald-500' : 'bg-slate-700'
            }`}
          >
            <div
              className={`w-4 h-4 rounded-full bg-white transition-transform absolute top-1 left-1 ${
                notificationSoundsEnabled ? 'translate-x-4' : 'translate-x-0'
              }`}
            />
          </button>
        </div>

        <div className="flex items-center justify-between pt-2 border-t border-white/5 dark:border-white/5 light-mode:border-slate-200">
          <div>
            <div className="text-xs font-semibold text-slate-200 dark:text-slate-200 light-mode:text-slate-800">
              Scenario Speech Synthesis
            </div>
            <div className="text-[10px] text-slate-400 dark:text-slate-400 light-mode:text-slate-500">
              Pronounces tutor dialogue in target language
            </div>
          </div>
          <button
            onClick={toggleSpeechFeedback}
            className={`w-10 h-6 rounded-full transition-colors relative cursor-pointer ${
              speechFeedbackEnabled ? 'bg-emerald-500' : 'bg-slate-700'
            }`}
          >
            <div
              className={`w-4 h-4 rounded-full bg-white transition-transform absolute top-1 left-1 ${
                speechFeedbackEnabled ? 'translate-x-4' : 'translate-x-0'
              }`}
            />
          </button>
        </div>
      </div>

      {/* SECTION 5: PUSH REMINDERS */}
      <PushNotificationScheduler />

      {/* SECTION 6: OFFLINE LESSONS & STORAGE CACHE */}
      <div className="rounded-2xl glass-card p-4 shadow-md space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {isOnline ? <Wifi className="w-4 h-4 text-emerald-400" /> : <WifiOff className="w-4 h-4 text-amber-400" />}
            <div>
              <h3 className="text-xs font-bold text-slate-100 dark:text-slate-100 light-mode:text-slate-900">
                Offline Review Cache
              </h3>
              <p className="text-[10px] text-slate-400 dark:text-slate-400 light-mode:text-slate-500">
                Service Worker caches vocabulary & grammar for offline study
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

        <div className="p-3 rounded-xl glass-pill flex items-center justify-between text-xs">
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

    </div>
  );
};
