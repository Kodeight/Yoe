import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { useAudio } from '../context/AudioContext';
import { PushNotificationScheduler } from '../components/PushNotificationScheduler';
import { Toggle } from '../components/Toggle';
import { getTranslation } from '../utils/i18n';
import {
  ArrowLeft,
  Settings,
  Globe,
  Moon,
  Sun,
  LogOut,
  Volume2,
  Bell,
  ShieldCheck,
  Check,
  Eye,
  RefreshCw,
  HardDrive
} from 'lucide-react';
import { LanguageCode } from '../types';

export const SettingsView: React.FC = () => {
  const {
    user,
    theme,
    setThemeMode,
    uiLanguage,
    setUiLanguage,
    setActiveView,
    logout,
    cacheLearnedLessonsForOffline
  } = useApp();

  const {
    notificationSoundsEnabled,
    speechFeedbackEnabled,
    toggleNotificationSounds,
    toggleSpeechFeedback
  } = useAudio();

  const t = getTranslation(uiLanguage);

  const [cacheStatus, setCacheStatus] = useState<string>('');

  const handleManualCache = () => {
    cacheLearnedLessonsForOffline();
    setCacheStatus(t.cachedSuccess);
    setTimeout(() => setCacheStatus(''), 4000);
  };

  const interfaceLanguages: Array<{ code: LanguageCode; name: string; nativeName: string; flag: string }> = [
    { code: 'en', name: 'English', nativeName: 'English', flag: '🇺🇸' },
    { code: 'fr', name: 'French', nativeName: 'Français', flag: '🇫🇷' },
    { code: 'ar', name: 'Arabic', nativeName: 'العربية', flag: '🇸🇦' },
    { code: 'es', name: 'Spanish', nativeName: 'Español', flag: '🇪🇸' },
    { code: 'it', name: 'Italian', nativeName: 'Italiano', flag: '🇮🇹' },
    { code: 'ru', name: 'Russian', nativeName: 'Русский', flag: '🇷🇺' },
    { code: 'tr', name: 'Turkish', nativeName: 'Türkçe', flag: '🇹🇷' },
    { code: 'pt', name: 'Portuguese', nativeName: 'Português', flag: '🇧🇷' }
  ];

  return (
    <div className="pb-28 pt-4 px-4 max-w-md mx-auto space-y-4 animate-in slide-in-from-right duration-250">

      {/* Top Child Navigation Header Bar */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => setActiveView('profile')}
          className="p-2.5 rounded-2xl glass-pill hover:border-emerald-500/40 text-slate-300 dark:text-slate-300 light-mode:text-slate-700 transition-colors cursor-pointer shrink-0"
          title={t.backToProfile}
        >
          <ArrowLeft className="w-4 h-4 rtl-mirror" />
        </button>
        <div>
          <h1 className="text-xl font-bold text-[var(--text-primary)] tracking-tight">
            {t.settingsTitle}
          </h1>
          <p className="text-[11px] text-[var(--text-secondary)]">
            {t.settingsPageSubtitle}
          </p>
        </div>
      </div>

      {/* SECTION 1: APPEARANCE & INTERFACE LANGUAGE */}
      <div className="rounded-3xl glass-card p-4.5 shadow-md space-y-4">
        <div className="flex items-center gap-2">
          <Globe className="w-4 h-4 text-emerald-400" />
          <h3 className="text-xs font-bold text-[var(--text-primary)] uppercase tracking-wider">
            {t.appearance}
          </h3>
        </div>

        {/* Theme Mode Toggle */}
        <div className="space-y-1.5">
          <label className="text-[11px] font-semibold text-[var(--text-secondary)]">
            {t.themeMode}
          </label>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setThemeMode('dark')}
              className={`p-2.5 rounded-2xl text-xs font-bold flex items-center justify-center gap-2 cursor-pointer transition-all ${
                theme === 'dark'
                  ? 'bg-emerald-500/20 border border-emerald-500/50 text-emerald-300 shadow-sm'
                  : 'glass-pill text-[var(--text-secondary)] hover:border-white/20'
              }`}
            >
              <Moon className="w-3.5 h-3.5" />
              <span>{t.themeDark}</span>
            </button>
            <button
              type="button"
              onClick={() => setThemeMode('light')}
              className={`p-2.5 rounded-2xl text-xs font-bold flex items-center justify-center gap-2 cursor-pointer transition-all ${
                theme === 'light'
                  ? 'bg-emerald-500/20 border border-emerald-500/50 text-emerald-300 shadow-sm'
                  : 'glass-pill text-[var(--text-secondary)] hover:border-white/20'
              }`}
            >
              <Sun className="w-3.5 h-3.5" />
              <span>{t.themeLight}</span>
            </button>
          </div>
        </div>

        {/* Interface Language Selector (Immediate Translation + RTL) */}
        <div className="space-y-1.5 pt-2 border-t border-white/5 dark:border-white/5 light-mode:border-slate-100">
          <label className="text-[11px] font-semibold text-[var(--text-secondary)] flex items-center justify-between">
            <span>{t.interfaceLanguage}</span>
            <span className="text-[10px] text-emerald-400 font-bold uppercase">
              {uiLanguage}
            </span>
          </label>
          <div className="grid grid-cols-2 gap-2">
            {interfaceLanguages.map((lang) => {
              const isCurrent = uiLanguage === lang.code;
              return (
                <button
                  key={lang.code}
                  type="button"
                  onClick={() => setUiLanguage(lang.code)}
                  className={`p-2.5 rounded-2xl text-xs font-bold flex items-center justify-between cursor-pointer transition-all ${
                    isCurrent
                      ? 'bg-emerald-500/20 border border-emerald-500/50 text-emerald-300 shadow-sm'
                      : 'glass-pill text-[var(--text-secondary)] hover:border-emerald-500/30'
                  }`}
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="text-base">{lang.flag}</span>
                    <span className="truncate">{lang.nativeName}</span>
                  </div>
                  {isCurrent && <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* SECTION 2: NOTIFICATIONS (Fixed Push Test Flow) */}
      <PushNotificationScheduler />

      {/* SECTION 3: AUDIO & SPEECH FEEDBACK */}
      <div className="rounded-3xl glass-card p-4.5 shadow-md space-y-3">
        <div className="flex items-center gap-2">
          <Volume2 className="w-4 h-4 text-cyan-400" />
          <h3 className="text-xs font-bold text-[var(--text-primary)] uppercase tracking-wider">
            {t.audioVoice}
          </h3>
        </div>

        {/* Notification Sound Toggle */}
        <div className="flex items-center justify-between py-1">
          <div>
            <h4 className="text-xs font-bold text-[var(--text-primary)]">
              {t.notificationSounds}
            </h4>
            <p className="text-[10px] text-[var(--text-secondary)]">
              Play sound chime for new learning turns
            </p>
          </div>
          <Toggle
            checked={notificationSoundsEnabled}
            onChange={toggleNotificationSounds}
            aria-label={t.notificationSounds}
          />
        </div>

        {/* Speech Feedback Sound Toggle */}
        <div className="flex items-center justify-between py-1 border-t border-white/5 dark:border-white/5 light-mode:border-slate-100">
          <div>
            <h4 className="text-xs font-bold text-[var(--text-primary)]">
              {t.soundEffects}
            </h4>
            <p className="text-[10px] text-[var(--text-secondary)]">
              Audio confirmation tones when voice recording starts/ends
            </p>
          </div>
          <Toggle
            checked={speechFeedbackEnabled}
            onChange={toggleSpeechFeedback}
            aria-label={t.soundEffects}
          />
        </div>
      </div>

      {/* SECTION 4: PRIVACY & OFFLINE CACHE */}
      <div className="rounded-3xl glass-card p-4.5 shadow-md space-y-3">
        <div className="flex items-center gap-2">
          <HardDrive className="w-4 h-4 text-emerald-400" />
          <h3 className="text-xs font-bold text-[var(--text-primary)] uppercase tracking-wider">
            {t.privacySecurity}
          </h3>
        </div>

        <p className="text-[11px] text-[var(--text-secondary)]">
          {t.offlineCacheDesc}
        </p>

        <button
          type="button"
          onClick={handleManualCache}
          className="w-full py-2.5 px-3.5 rounded-2xl glass-pill hover:border-emerald-500/40 text-xs font-bold text-emerald-400 flex items-center justify-center gap-2 cursor-pointer transition-all"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>{t.cacheNow}</span>
        </button>

        {cacheStatus && (
          <p className="text-[11px] text-emerald-400 text-center font-semibold animate-in fade-in">
            {cacheStatus}
          </p>
        )}
      </div>

      {/* SECTION 5: ACCOUNT & LOGOUT */}
      <div className="rounded-3xl glass-card p-4.5 shadow-md space-y-3">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-slate-400" />
          <h3 className="text-xs font-bold text-[var(--text-primary)] uppercase tracking-wider">
            {t.account}
          </h3>
        </div>

        <div className="text-xs text-[var(--text-secondary)]">
          <p className="font-mono text-[11px]">{user?.email || 'Logged in learner'}</p>
        </div>

        <button
          type="button"
          onClick={logout}
          className="w-full py-3 px-4 rounded-2xl bg-rose-500/15 hover:bg-rose-500/25 border border-rose-500/30 text-rose-300 text-xs font-bold flex items-center justify-center gap-2 cursor-pointer transition-all"
        >
          <LogOut className="w-4 h-4" />
          <span>{t.signOut}</span>
        </button>
      </div>

    </div>
  );
};
