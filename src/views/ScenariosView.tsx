import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Compass, Play, MapPin, Target, Filter } from 'lucide-react';

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
            <span>Scenario Worlds</span>
          </h1>
          <p className="text-xs text-slate-400 dark:text-slate-400 light-mode:text-slate-500 mt-0.5">
            Interactive mission environments in {activeJourney?.targetLanguage.toUpperCase() || 'TARGET LANGUAGE'}
          </p>
        </div>
      </div>

      {/* Filter Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
        {['all', 'A1', 'A2', 'B1', 'travel', 'dining', 'shopping', 'social', 'business'].map((f) => (
          <button
            key={f}
            onClick={() => setSelectedFilter(f)}
            className={`px-3 py-1.5 rounded-full text-xs font-bold capitalize transition-all cursor-pointer whitespace-nowrap ${
              selectedFilter === f
                ? 'bg-gradient-to-r from-emerald-400 to-teal-400 text-slate-950 font-black shadow-md shadow-emerald-500/20'
                : 'glass-pill text-slate-300 dark:text-slate-300 light-mode:text-slate-700 hover:border-emerald-500/40'
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      {/* Scenario Cards List */}
      {filteredScenarios.length === 0 ? (
        <div className="rounded-3xl glass-card p-8 text-center space-y-3">
          <Filter className="w-8 h-8 text-slate-500 mx-auto" />
          <h3 className="text-sm font-bold text-slate-200">No Scenarios in this Category</h3>
          <button
            onClick={() => setSelectedFilter('all')}
            className="px-4 py-2 rounded-xl bg-emerald-500/20 text-emerald-400 text-xs font-bold"
          >
            Show All Scenarios
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredScenarios.map((scen) => (
            <div
              key={scen.id}
              onClick={() => handleStartScenario(scen.id)}
              className="group rounded-2xl glass-card p-3.5 transition-all hover:border-emerald-500/40 hover:shadow-lg cursor-pointer flex items-center gap-3.5"
            >
              {/* Image thumbnail with avatar badge */}
              <div className="relative w-20 h-20 rounded-xl overflow-hidden shrink-0 bg-slate-800">
                <img
                  src={scen.imageUrl}
                  alt={scen.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                <span className="absolute bottom-1 left-1.5 text-xs">{scen.avatar}</span>
              </div>

              {/* Scenario details */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5 mb-1">
                  <span className="px-1.5 py-0.2 rounded-full bg-emerald-500/15 text-[9px] font-black text-emerald-400 border border-emerald-500/20 uppercase">
                    {scen.cefrLevel}
                  </span>
                  <span className="text-[10px] text-slate-400 dark:text-slate-400 light-mode:text-slate-500 truncate flex items-center gap-0.5">
                    <MapPin className="w-2.5 h-2.5" />
                    {scen.location}
                  </span>
                </div>

                <h3 className="text-sm font-bold text-slate-100 dark:text-slate-100 light-mode:text-slate-900 truncate">
                  {scen.title}
                </h3>

                <p className="text-[11px] text-slate-400 dark:text-slate-400 light-mode:text-slate-500 truncate mb-1.5">
                  {scen.location}
                </p>

                <div className="flex items-center gap-1.5 text-[10px] text-emerald-400 font-semibold">
                  <Target className="w-3 h-3" />
                  <span>{scen.objectives.length} Missions</span>
                </div>
              </div>

              {/* Enter Button */}
              <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-emerald-400 to-teal-400 flex items-center justify-center text-slate-950 shadow-md group-hover:scale-110 transition-transform shrink-0">
                <Play className="w-4 h-4 fill-slate-950 ml-0.5" />
              </div>
            </div>
          ))}
        </div>
      )}

    </div>
  );
};
