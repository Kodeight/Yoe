import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { YoeLogo } from './YoeLogo';
import { SUPPORTED_LANGUAGES } from '../server/db';
import { Flame, Star, Sun, Moon, ChevronDown, Download, WifiOff } from 'lucide-react';
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

  const streakDays = activeJourney?.streakDays ?? 0;
  const points = activeJourney?.points ?? 0;

  return (
    <header className="sticky top-0 z-40 w-full glass-header px-4 py-2.5 transition-colors">
      <div className="max-w-md mx-auto flex items-center justify-between">

        {/* Brand Logo & Active Language Selector */}
        <div className="flex items-center gap-2 relative">
          <YoeLogo size="md" />

          {/* Active Target Language Pill Button */}
          {activeJourney && (
            <button
              onClick={() => setShowLangDropdown(!showLangDropdown)}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-full glass-pill hover:border-emerald-500/40 text-xs font-semibold text-slate-200 dark:text-slate-200 light-mode:text-slate-800 transition-all cursor-pointer shadow-sm ml-1"
            >
              <span className="text-sm">{currentLang.flag}</span>
              <span className="font-bold text-[11px] uppercase tracking-wider">{currentLang.code}</span>
              <ChevronDown className={`w-3 h-3 text-slate-400 transition-transform ${showLangDropdown ? 'rotate-180' : ''}`} />
            </button>
          )}

          {/* Language Switcher Dropdown */}
          {showLangDropdown && (
            <div className="absolute top-full left-0 mt-2 w-52 py-2 rounded-2xl glass-nav border border-white/10 dark:border-white/10 light-mode:border-slate-200 shadow-2xl z-50 animate-in fade-in zoom-in-95">
              <div className="px-3.5 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-400 light-mode:text-slate-500">
                Switch Language Journey
              </div>
              {SUPPORTED_LANGUAGES.map((lang) => (
                <button
                  key={lang.code}
                  onClick={() => handleSelectLanguage(lang.code)}
                  className={`w-full px-3.5 py-2 text-left text-xs flex items-center justify-between hover:bg-emerald-500/10 transition-colors cursor-pointer ${
                    activeJourney?.targetLanguage === lang.code
                      ? 'text-emerald-400 font-bold bg-emerald-500/10'
                      : 'text-slate-300 dark:text-slate-300 light-mode:text-slate-700'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span>{lang.flag}</span>
                    <span>{lang.name}</span>
                  </div>
                  {journeys.some(j => j.targetLanguage === lang.code) && (
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                  )}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Real Stats Pill Badges & Theme Toggle */}
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

          {/* Real Streak (0 for fresh account) */}
          <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-bold shadow-sm">
            <Flame className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
            <span>{streakDays}</span>
          </div>

          {/* Real XP Points (0 for fresh account) */}
          <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-yellow-500/10 border border-yellow-500/20 text-yellow-400 text-xs font-bold shadow-sm">
            <Star className="w-3.5 h-3.5 text-yellow-400 fill-yellow-400" />
            <span>{points > 999 ? `${(points / 1000).toFixed(1)}K` : `${points}`}</span>
          </div>

          {/* Theme Switcher Toggle */}
          <button
            onClick={toggleTheme}
            className="p-2 rounded-full glass-pill hover:border-emerald-500/40 text-slate-300 dark:text-slate-300 light-mode:text-slate-700 transition-colors cursor-pointer"
            title="Toggle theme"
          >
            {theme === 'dark' ? <Sun className="w-3.5 h-3.5 text-amber-300" /> : <Moon className="w-3.5 h-3.5 text-indigo-600" />}
          </button>

          {/* PWA Install Button if prompt captured */}
          {pwaInstallPrompt && (
            <button
              onClick={installPWA}
              className="p-2 rounded-full bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/30 transition-colors cursor-pointer"
              title="Install Yoe App"
            >
              <Download className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

      </div>
    </header>
  );
};
