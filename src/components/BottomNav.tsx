import React from 'react';
import { useApp } from '../context/AppContext';
import { Home, MessageCircle, BarChart2, Compass, User } from 'lucide-react';

export const BottomNav: React.FC = () => {
  const { activeView, setActiveView } = useApp();

  const navItems = [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'chat', label: 'Chat', icon: MessageCircle },
    { id: 'learn', label: 'Learn', icon: BarChart2 },
    { id: 'explore', label: 'Explore', icon: Compass },
    { id: 'profile', label: 'Profile', icon: User }
  ] as const;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 pointer-events-none">
      {/* Mobile Navbar Gradient Blur Container - smooth visual separation for underlying content */}
      <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-[#070b12] via-[#070b12]/85 to-transparent backdrop-blur-md pointer-events-none" />

      <div className="max-w-md mx-auto px-4 pb-[max(env(safe-area-inset-bottom,0px),0.75rem)] relative z-10 pointer-events-auto">
        <nav className="flex items-center justify-around glass-nav rounded-3xl p-1.5 shadow-2xl transition-colors">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeView === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveView(item.id)}
                className={`flex flex-col items-center justify-center py-2 px-3.5 rounded-2xl transition-all duration-200 cursor-pointer ${
                  isActive
                    ? 'text-emerald-400 font-bold bg-emerald-500/15 shadow-sm'
                    : 'text-slate-400 dark:text-slate-400 light-mode:text-slate-500 hover:text-slate-200 dark:hover:text-slate-100 light-mode:hover:text-slate-900 hover:bg-white/5'
                }`}
              >
                <Icon
                  className={`w-5 h-5 mb-0.5 transition-transform duration-200 ${
                    isActive ? 'scale-110 stroke-[2.5]' : 'stroke-[1.8]'
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
