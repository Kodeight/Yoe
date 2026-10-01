import React from 'react';
import { useApp } from '../context/AppContext';
import { YoeLogo } from './YoeLogo';
import { Flame, Star, Sun, Moon, Download, WifiOff } from 'lucide-react';

export const Header: React.FC = () => {
  const { activeJourney, theme, toggleTheme, pwaInstallPrompt, installPWA, isOnline } = useApp();

  const streakDays = activeJourney?.streakDays ?? 0;
  const points = activeJourney?.points ?? 0;

  return (
    <header className="sticky top-0 z-40 w-full glass-header px-4 py-3 transition-colors safe-top-padding">
      <div className="max-w-md mx-auto flex items-center justify-between">

        {/* Brand Logo only (NO language switcher dropdown in header) */}
        <div className="flex items-center">
          <YoeLogo size="md" />
        </div>

        {/* Real Stats & Controls */}
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

          {/* Real Streak */}
          <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-bold shadow-sm">
            <Flame className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
            <span>{streakDays}</span>
          </div>

          {/* Real XP Points */}
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

          {/* PWA Install Button if available */}
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
