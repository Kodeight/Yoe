import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { YoeLogo } from './YoeLogo';
import { SUPPORTED_LANGUAGES } from '../server/db';
import { Flame, Star, Bell, Sun, Moon, ChevronDown, Download, WifiOff } from 'lucide-react';
import { LanguageCode } from '../types';

export const Header: React.FC = () => {
  const { activeJourney, journeys, setActiveJourney, createNewJourney, theme, toggleTheme, pwaInstallPrompt, installPWA, isOnline } = useApp();
  const [showLangDropdown, setShowLangDropdown] = useState(false);

  const currentLang = SUPPORTED_LANGUAGES.find(l => l.code === activeJourney?.targetLanguage) || SUPPORTED_LANGUAGES[0];

  const handleSelectLanguage = (langCode: LanguageCode) => {
    setShowLangDropdown(false);
    const existing = journeys.find(j => j.targetLanguage === langCode);
    if (existing) {
      setActiveJourney(existing);
    } else {
      createNewJourney(langCode, activeJourney?.supportLanguage || 'en');
    }
  };

  return (
    <header className="sticky top-0 z-40 w-full backdrop-blur-xl bg-[#0b0f17]/80 dark:bg-[#0b0f17]/80 light-mode:bg-white/80 border-b border-white/10 dark:border-white/10 light-mode:border-slate-200 transition-colors px-4 py-3">
      <div className="max-w-md mx-auto flex items-center justify-between gap-2">

        {/* Brand Logo */}
        <div className="flex items-center">
          <YoeLogo size="sm" />
        </div>

        {/* Target Language Selector Dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowLangDropdown(!showLangDropdown)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-800/80 dark:bg-slate-800/80 light-mode:bg-slate-100 hover:bg-slate-700/80 border border-white/10 text-xs font-semibold text-slate-100 dark:text-slate-100 light-mode:text-slate-800 transition-all cursor-pointer shadow-sm"
          >
            <span className="text-sm">{currentLang.flag}</span>
            <span>{currentLang.name}</span>
            <ChevronDown className={`w-3.5 h-3.5 transition-transform ${showLangDropdown ? 'rotate-180' : ''}`} />
          </button>

          {showLangDropdown && (
            <div className="absolute top-full left-0 mt-2 w-48 py-2 rounded-2xl bg-slate-900/95 dark:bg-slate-900/95 light-mode:bg-white backdrop-blur-xl border border-white/10 dark:border-white/10 light-mode:border-slate-200 shadow-2xl z-50 animate-in fade-in zoom-in-95">
              <div className="px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-400 light-mode:text-slate-500">
                Learning Language
              </div>
              {SUPPORTED_LANGUAGES.map((lang) => (
                <button
                  key={lang.code}
                  onClick={() => handleSelectLanguage(lang.code)}
                  className={`w-full flex items-center justify-between px-3 py-2 text-xs font-medium transition-colors hover:bg-emerald-500/10 text-left ${
                    lang.code === activeJourney?.targetLanguage
                      ? 'text-emerald-400 font-bold bg-emerald-500/10'
                      : 'text-slate-300 dark:text-slate-300 light-mode:text-slate-700'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-base">{lang.flag}</span>
                    <span>{lang.name}</span>
                  </div>
                  {lang.code === activeJourney?.targetLanguage && (
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                  )}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Stats Pill Badges & Controls */}
        <div className="flex items-center gap-2">
          {/* Offline Indicator Badge */}
          {!isOnline && (
            <div
              className="flex items-center gap-1 px-2 py-1 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30 text-[10px] font-bold animate-pulse shadow-sm"
              title="Offline Mode — Cached lessons & vocabulary ready"
            >
              <WifiOff className="w-3 h-3" />
              <span className="hidden sm:inline">Offline</span>
            </div>
          )}

          {/* Streak */}
          <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-bold shadow-sm">
            <Flame className="w-3.5 h-3.5 text-amber-500 fill-amber-500 animate-pulse" />
            <span>{activeJourney?.streakDays || 12}</span>
          </div>

          {/* Points */}
          <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-yellow-500/10 border border-yellow-500/20 text-yellow-400 text-xs font-bold shadow-sm">
            <Star className="w-3.5 h-3.5 text-yellow-400 fill-yellow-400" />
            <span>{activeJourney ? `${(activeJourney.points / 1000).toFixed(1)}K` : '1.2K'}</span>
          </div>

          {/* Theme Switcher */}
          <button
            onClick={toggleTheme}
            className="p-1.5 rounded-full bg-slate-800/80 dark:bg-slate-800/80 light-mode:bg-slate-100 hover:bg-slate-700/80 text-slate-300 dark:text-slate-300 light-mode:text-slate-700 transition-colors cursor-pointer"
            title="Toggle theme"
          >
            {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-300" /> : <Moon className="w-4 h-4 text-indigo-600" />}
          </button>

          {/* PWA Install Button if available */}
          {pwaInstallPrompt && (
            <button
              onClick={installPWA}
              className="p-1.5 rounded-full bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/30 transition-colors cursor-pointer"
              title="Install App"
            >
              <Download className="w-4 h-4" />
            </button>
          )}

          {/* Notifications */}
          <button className="p-1.5 rounded-full bg-slate-800/80 dark:bg-slate-800/80 light-mode:bg-slate-100 hover:bg-slate-700/80 text-slate-300 dark:text-slate-300 light-mode:text-slate-700 transition-colors relative cursor-pointer">
            <Bell className="w-4 h-4" />
            <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-emerald-400" />
          </button>
        </div>

      </div>
    </header>
  );
};
