import React from 'react';
import { useApp } from '../context/AppContext';
import { MessageSquare, BookOpen, Layers, Target, ChevronRight } from 'lucide-react';

export const QuickActionGrid: React.FC = () => {
  const { setActiveView } = useApp();

  const actions = [
    {
      id: 'chat',
      title: 'Chat',
      subtitle: 'Practice speaking',
      icon: MessageSquare,
      gradient: 'from-emerald-500/20 to-teal-500/10',
      iconBg: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
    },
    {
      id: 'explore',
      title: 'Lessons',
      subtitle: 'Step by step',
      icon: BookOpen,
      gradient: 'from-blue-500/20 to-cyan-500/10',
      iconBg: 'bg-blue-500/20 text-blue-400 border-blue-500/30'
    },
    {
      id: 'vocab',
      title: 'Vocabulary',
      subtitle: 'Learn new words',
      icon: Layers,
      gradient: 'from-purple-500/20 to-indigo-500/10',
      iconBg: 'bg-purple-500/20 text-purple-400 border-purple-500/30'
    },
    {
      id: 'grammar',
      title: 'Grammar',
      subtitle: 'Get instant feedback',
      icon: Target,
      gradient: 'from-amber-500/20 to-orange-500/10',
      iconBg: 'bg-amber-500/20 text-amber-400 border-amber-500/30'
    }
  ] as const;

  return (
    <div className="grid grid-cols-2 gap-3 my-5">
      {actions.map((act) => {
        const Icon = act.icon;
        return (
          <button
            key={act.id}
            onClick={() => setActiveView(act.id as any)}
            className="group relative text-left rounded-2xl bg-slate-900/80 dark:bg-slate-900/80 light-mode:bg-white border border-white/10 dark:border-white/10 light-mode:border-slate-200 p-3.5 transition-all hover:border-emerald-500/40 hover:shadow-lg cursor-pointer"
          >
            <div className="flex items-start justify-between mb-3">
              <div className={`p-2 rounded-xl border ${act.iconBg}`}>
                <Icon className="w-5 h-5" />
              </div>
              <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-emerald-400 group-hover:translate-x-0.5 transition-all" />
            </div>

            <div className="font-bold text-sm text-slate-100 dark:text-slate-100 light-mode:text-slate-900">
              {act.title}
            </div>
            <div className="text-[11px] text-slate-400 dark:text-slate-400 light-mode:text-slate-500 font-medium">
              {act.subtitle}
            </div>
          </button>
        );
      })}
    </div>
  );
};
