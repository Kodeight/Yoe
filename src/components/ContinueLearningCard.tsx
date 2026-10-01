import React from 'react';
import { useApp } from '../context/AppContext';
import { Play, ChevronRight } from 'lucide-react';

export const ContinueLearningCard: React.FC = () => {
  const { activeScenario, setActiveView } = useApp();

  const title = activeScenario?.title || 'At the airport';
  const description = activeScenario?.description || 'Practice travel conversations';
  const imageUrl = activeScenario?.imageUrl || 'https://images.unsplash.com/photo-1530521954074-e64f6810b32d?auto=format&fit=crop&w=600&q=80';

  return (
    <section className="my-5">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-base font-bold text-slate-100 dark:text-slate-100 light-mode:text-slate-900 tracking-tight">
          Continue learning
        </h2>
        <button
          onClick={() => setActiveView('explore')}
          className="text-xs font-semibold text-emerald-400 hover:text-emerald-300 flex items-center gap-0.5 cursor-pointer"
        >
          <span>See all</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>

      <div
        onClick={() => setActiveView('chat')}
        className="group relative overflow-hidden rounded-2xl bg-slate-900/80 dark:bg-slate-900/80 light-mode:bg-white border border-white/10 dark:border-white/10 light-mode:border-slate-200 p-3.5 flex items-center gap-3.5 transition-all hover:border-emerald-500/40 cursor-pointer shadow-md"
      >
        {/* Scenario Image */}
        <div className="relative w-20 h-20 rounded-xl overflow-hidden shrink-0">
          <img
            src={imageUrl}
            alt={title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="inline-block px-2 py-0.5 rounded-md bg-emerald-500/10 text-[10px] font-bold text-emerald-400 border border-emerald-500/20 mb-1">
            Conversation
          </div>

          <h3 className="text-sm font-bold text-slate-100 dark:text-slate-100 light-mode:text-slate-900 truncate">
            {title}
          </h3>

          <p className="text-[11px] text-slate-400 dark:text-slate-400 light-mode:text-slate-500 truncate mb-2">
            {description}
          </p>

          {/* Progress Bar */}
          <div className="flex items-center gap-2">
            <div className="flex-1 h-1.5 rounded-full bg-slate-800 dark:bg-slate-800 light-mode:bg-slate-200 overflow-hidden">
              <div className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full w-[60%]" />
            </div>
            <span className="text-[10px] font-bold text-slate-400 dark:text-slate-400 light-mode:text-slate-500">
              60%
            </span>
          </div>
        </div>

        {/* Play CTA Button */}
        <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center text-white shadow-lg shadow-emerald-500/25 group-hover:scale-110 transition-transform shrink-0">
          <Play className="w-5 h-5 fill-white ml-0.5" />
        </div>
      </div>
    </section>
  );
};
