import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Scenario } from '../types';
import { Compass, Play, MapPin, Sparkles } from 'lucide-react';

export const ScenariosView: React.FC = () => {
  const { scenarios, setActiveScenarioId, setActiveView, activeJourney } = useApp();
  const [selectedFilter, setSelectedFilter] = useState<string>('all');

  const filteredScenarios = scenarios.filter((s) => {
    if (selectedFilter === 'all') return true;
    if (['A1', 'A2', 'B1', 'B2'].includes(selectedFilter)) {
      return s.cefrLevel === selectedFilter;
    }
    return s.category === selectedFilter;
  });

  const handleStartScenario = (id: string) => {
    setActiveScenarioId(id);
    setActiveView('chat');
  };

  return (
    <div className="pb-24 pt-4 px-4 max-w-md mx-auto space-y-4 animate-in fade-in duration-300">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-100 dark:text-slate-100 light-mode:text-slate-900 tracking-tight flex items-center gap-2">
            <Compass className="w-5 h-5 text-emerald-400" />
            <span>Explore Scenarios</span>
          </h1>
          <p className="text-xs text-slate-400 dark:text-slate-400 light-mode:text-slate-500 mt-0.5">
            Real-world worlds to enter and practice in {activeJourney?.targetLanguage.toUpperCase()}
          </p>
        </div>
      </div>

      {/* Filter Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
        {['all', 'A1', 'A2', 'B1', 'travel', 'dining', 'shopping', 'social'].map((f) => (
          <button
            key={f}
            onClick={() => setSelectedFilter(f)}
            className={`px-3 py-1.5 rounded-full text-xs font-bold capitalize transition-all cursor-pointer whitespace-nowrap ${
              selectedFilter === f
                ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
                : 'bg-slate-900 dark:bg-slate-900 light-mode:bg-white text-slate-300 dark:text-slate-300 light-mode:text-slate-700 border border-white/10 dark:border-white/10 light-mode:border-slate-200 hover:border-emerald-500/40'
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      {/* Scenario Cards List */}
      <div className="space-y-3.5">
        {filteredScenarios.map((scen) => (
          <div
            key={scen.id}
            onClick={() => handleStartScenario(scen.id)}
            className="group relative overflow-hidden rounded-2xl bg-slate-900/80 dark:bg-slate-900/80 light-mode:bg-white border border-white/10 dark:border-white/10 light-mode:border-slate-200 p-4 transition-all hover:border-emerald-500/40 cursor-pointer shadow-lg"
          >
            {/* Top row */}
            <div className="flex items-start justify-between gap-3 mb-2">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-xl shrink-0">
                  {scen.avatar}
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-100 dark:text-slate-100 light-mode:text-slate-900 group-hover:text-emerald-400 transition-colors">
                    {scen.title}
                  </h3>
                  <div className="flex items-center gap-1 text-[11px] text-slate-400 dark:text-slate-400 light-mode:text-slate-500">
                    <MapPin className="w-3 h-3 text-emerald-400 shrink-0" />
                    <span className="truncate max-w-[180px]">{scen.location}</span>
                  </div>
                </div>
              </div>

              <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] font-extrabold uppercase shrink-0">
                {scen.cefrLevel}
              </span>
            </div>

            {/* Description */}
            <p className="text-xs text-slate-400 dark:text-slate-400 light-mode:text-slate-600 line-clamp-2 mb-3">
              {scen.description}
            </p>

            {/* Objectives summary */}
            <div className="pt-3 border-t border-white/10 dark:border-white/10 light-mode:border-slate-200 flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-[11px] text-slate-300 dark:text-slate-300 light-mode:text-slate-700">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>{scen.objectives.length} Missions</span>
              </div>

              <div className="flex items-center gap-1 text-xs font-bold text-emerald-400 group-hover:translate-x-1 transition-transform">
                <span>Enter Scenario</span>
                <Play className="w-3.5 h-3.5 fill-emerald-400" />
              </div>
            </div>
          </div>
        ))}
      </div>

    </div>
  );
};
