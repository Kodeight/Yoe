import React from 'react';
import { useApp } from '../context/AppContext';
import { MessageSquare, Compass, Layers, Target, ChevronRight } from 'lucide-react';

export const QuickActionGrid: React.FC = () => {
  const { setActiveView, vocabulary, mistakes } = useApp();

  const actions = [
    {
      id: 'chat',
      title: 'Practice Speaking',
      subtitle: 'Live conversation with Yoe',
      icon: MessageSquare,
      iconBg: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/20'
    },
    {
      id: 'explore',
      title: 'Scenario Worlds',
      subtitle: 'Explore real-world missions',
      icon: Compass,
      iconBg: 'bg-cyan-500/15 text-cyan-400 border-cyan-500/20'
    },
    {
      id: 'vocab',
      title: 'Vocabulary Bank',
      subtitle: `${vocabulary.length} words acquired`,
      icon: Layers,
      iconBg: 'bg-purple-500/15 text-purple-400 border-purple-500/20'
    },
    {
      id: 'grammar',
      title: 'Grammar & Memory',
      subtitle: `${mistakes.length} recurring patterns`,
      icon: Target,
      iconBg: 'bg-amber-500/15 text-amber-400 border-amber-500/20'
    }
  ] as const;

  return (
    <div className="grid grid-cols-2 gap-2.5 my-4">
      {actions.map((act) => {
        const Icon = act.icon;
        return (
          <button
            key={act.id}
            onClick={() => setActiveView(act.id as any)}
            className="group relative text-left rounded-2xl glass-card p-3.5 transition-all hover:border-emerald-500/40 cursor-pointer shadow-md"
          >
            <div className="flex items-start justify-between mb-2.5">
              <div className={`p-2 rounded-xl border ${act.iconBg}`}>
                <Icon className="w-4 h-4" />
              </div>
              <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-emerald-400 group-hover:translate-x-0.5 transition-all" />
            </div>

            <div className="font-bold text-xs text-slate-100 dark:text-slate-100 light-mode:text-slate-900">
              {act.title}
            </div>
            <div className="text-[10px] text-slate-400 dark:text-slate-400 light-mode:text-slate-500 font-medium truncate mt-0.5">
              {act.subtitle}
            </div>
          </button>
        );
      })}
    </div>
  );
};
