import React from 'react';
import { useApp } from '../context/AppContext';
import { Play, ChevronRight, MapPin, Compass } from 'lucide-react';

export const ContinueLearningCard: React.FC = () => {
  const { activeScenario, scenarios, setActiveView, setActiveScenarioId } = useApp();

  const scenario = activeScenario || scenarios[0];

  if (!scenario) {
    return (
      <section className="my-4">
        <div className="glass-card rounded-2xl p-4 text-center">
          <Compass className="w-6 h-6 text-emerald-400 mx-auto mb-1.5" />
          <p className="text-xs font-bold text-slate-200 dark:text-slate-200 light-mode:text-slate-800">
            No Scenario Selected
          </p>
          <button
            onClick={() => setActiveView('explore')}
            className="mt-2 px-3 py-1 rounded-xl bg-emerald-500/20 text-emerald-400 text-xs font-bold"
          >
            Explore Scenarios
          </button>
        </div>
      </section>
    );
  }

  const handleOpenScenario = () => {
    setActiveScenarioId(scenario.id);
    setActiveView('chat');
  };

  return (
    <section className="my-4">
      <div className="flex items-center justify-between mb-2.5">
        <h2 className="text-sm font-bold text-slate-100 dark:text-slate-100 light-mode:text-slate-900 tracking-tight">
          Current Learning Scenario
        </h2>
        <button
          onClick={() => setActiveView('explore')}
          className="text-xs font-semibold text-emerald-400 dark:text-emerald-400 light-mode:text-emerald-600 hover:text-emerald-300 flex items-center gap-0.5 cursor-pointer"
        >
          <span>All Worlds</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>

      <div
        onClick={handleOpenScenario}
        className="group relative overflow-hidden rounded-2xl glass-card p-3.5 flex items-center gap-3.5 transition-all hover:border-emerald-500/40 cursor-pointer shadow-md"
      >
        {/* Scenario Image */}
        <div className="relative w-20 h-20 rounded-xl overflow-hidden shrink-0 bg-slate-800">
          <img
            src={scenario.imageUrl}
            alt={scenario.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
          <span className="absolute bottom-1 left-1.5 text-xs">{scenario.avatar}</span>
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 mb-1">
            <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-[9px] font-extrabold text-emerald-400 border border-emerald-500/20 uppercase">
              {scenario.cefrLevel}
            </span>
            <span className="text-[10px] text-slate-400 dark:text-slate-400 light-mode:text-slate-500 truncate flex items-center gap-0.5">
              <MapPin className="w-2.5 h-2.5" />
              {scenario.location}
            </span>
          </div>

          <h3 className="text-sm font-bold text-slate-100 dark:text-slate-100 light-mode:text-slate-900 truncate">
            {scenario.title}
          </h3>

          <p className="text-[11px] text-slate-400 dark:text-slate-400 light-mode:text-slate-500 truncate mb-1.5">
            Roleplay with {scenario.characterName} ({scenario.characterRole})
          </p>

          <div className="text-[10px] font-semibold text-emerald-400 dark:text-emerald-400 light-mode:text-emerald-600">
            {scenario.objectives.length} Missions Ready
          </div>
        </div>

        {/* Play CTA Button */}
        <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-emerald-400 to-teal-400 flex items-center justify-center text-slate-950 shadow-md shadow-emerald-500/20 group-hover:scale-110 transition-transform shrink-0">
          <Play className="w-4 h-4 fill-slate-950 ml-0.5" />
        </div>
      </div>
    </section>
  );
};
