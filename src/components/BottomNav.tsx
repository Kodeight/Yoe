import React from 'react';
import { useApp } from '../context/AppContext';
import { getTranslation } from '../utils/i18n';
import { Home, MessageCircle, BarChart2, Compass, User } from 'lucide-react';
import { hapticSelection } from '../utils/haptics';

export const BottomNav: React.FC = () => {
  const { activeView, setActiveView, uiLanguage } = useApp();
  const t = getTranslation(uiLanguage);

  const navItems = [
    { id: 'home', label: t.navHome, icon: Home },
    { id: 'chat', label: t.navChat, icon: MessageCircle },
    { id: 'learn', label: t.navLearn, icon: BarChart2 },
    { id: 'explore', label: t.navExplore, icon: Compass },
    { id: 'profile', label: t.navProfile, icon: User }
  ] as const;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 pointer-events-none">
      {/* Subtle Atmospheric Bottom Gradient (Theme-Matched, Smooth Upward Fade Behind Navbar) */}
      <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-[#070b12]/95 via-[#070b12]/50 to-transparent dark:from-[#070b12]/95 dark:via-[#070b12]/50 light-mode:from-slate-100/95 light-mode:via-slate-100/50 pointer-events-none" />

      {/* Floating Pristine Liquid Glass Navigation Bar */}
      <div className="max-w-md mx-auto px-4 pb-[max(env(safe-area-inset-bottom,0px),0.75rem)] relative z-10 pointer-events-auto">
        <nav className="flex items-center justify-around glass-nav rounded-3xl p-1.5 transition-all shadow-xl">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeView === item.id || (item.id === 'profile' && activeView === 'profile-settings');
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => {
                  hapticSelection();
                  setActiveView(item.id);
                }}
                className={`flex flex-col items-center justify-center py-2 px-3.5 rounded-2xl transition-all duration-150 cursor-pointer ${
                  isActive
                    ? 'text-emerald-700 dark:text-emerald-400 font-bold bg-emerald-500/15 shadow-sm'
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-white/5'
                }`}
              >
                <Icon
                  className={`w-5 h-5 mb-0.5 transition-colors ${
                    isActive ? 'stroke-[2.5]' : 'stroke-[1.8]'
                  }`}
                />
                <span className="text-[10px] tracking-tight">{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>
    </div>
  );
};

