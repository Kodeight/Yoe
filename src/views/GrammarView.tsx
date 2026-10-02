import React from 'react';
import { useApp } from '../context/AppContext';
import { Target, AlertTriangle, CheckCircle2, WifiOff, Compass } from 'lucide-react';

export const GrammarView: React.FC = () => {
  const { mistakes, setActiveView, isOnline } = useApp();

  return (
    <div className="pb-24 pt-4 px-4 max-w-md mx-auto space-y-4 animate-in fade-in duration-300">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-100 dark:text-slate-100 light-mode:text-slate-900 tracking-tight flex items-center gap-2">
            <Target className="w-5 h-5 text-amber-400" />
            <span>Grammar & Memory Bank</span>
          </h1>
          <p className="text-xs text-slate-400 dark:text-slate-400 light-mode:text-slate-500 mt-0.5">
            Recurring structural patterns Yoe is helping you master naturally
          </p>
        </div>

        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
          isOnline
            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
            : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
        }`}>
          {isOnline ? 'Active Sync' : 'Offline Ready'}
        </span>
      </div>

      {/* Offline Alert */}
      {!isOnline && (
        <div className="flex items-center gap-2 p-2.5 rounded-2xl bg-amber-500/15 border border-amber-500/30 text-amber-300 text-xs animate-in fade-in">
          <WifiOff className="w-4 h-4 text-amber-400 shrink-0" />
          <span>Offline Review Mode — Reviewing cached grammar rules & memory patterns.</span>
        </div>
      )}

      {/* Empty State vs Mistakes List */}
      {mistakes.length === 0 ? (
        <div className="rounded-3xl glass-card p-8 text-center space-y-3">
          <div className="w-12 h-12 rounded-full bg-amber-500/15 border border-amber-500/25 flex items-center justify-center mx-auto text-amber-400">
            <Target className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-slate-100 dark:text-slate-100 light-mode:text-slate-900">
            No Grammar Patterns Recorded Yet
          </h3>
          <p className="text-xs text-slate-400 dark:text-slate-400 light-mode:text-slate-600 max-w-xs mx-auto leading-relaxed">
            As you practice conversations in scenario worlds, Yoe will gently record grammar tips, sentence order notes, and verb agreements here for your review.
          </p>
          <button
            onClick={() => setActiveView('explore')}
            className="mt-2 py-2.5 px-5 rounded-xl bg-gradient-to-r from-emerald-400 to-teal-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 mx-auto shadow-md cursor-pointer"
          >
            <Compass className="w-4 h-4" />
            <span>Practice in a Scenario</span>
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {mistakes.map((m) => (
            <div
              key={m.id}
              className="rounded-2xl glass-card p-4 shadow-md space-y-2.5"
            >
              <div className="flex items-center justify-between">
                <span className="px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20 text-[10px] font-bold uppercase tracking-wide">
                  {m.category.replace('_', ' ')}
                </span>
                <span className="text-[10px] text-slate-400">
                  Noticed {m.occurrenceCount}x
                </span>
              </div>

              <h3 className="text-sm font-bold text-slate-100 dark:text-slate-100 light-mode:text-slate-900">
                {m.pattern}
              </h3>

              <div className="bg-slate-950/60 dark:bg-slate-950/60 light-mode:bg-white rounded-xl p-3 text-xs space-y-1.5 border border-white/5 dark:border-white/5 light-mode:border-slate-200">
                <div className="flex items-start gap-1.5">
                  <AlertTriangle className="w-3.5 h-3.5 text-red-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="text-[10px] text-slate-500 uppercase font-bold block">User Said:</span>
                    <span className="text-red-300 dark:text-red-400 light-mode:text-red-600 font-medium line-through">"{m.exampleUserSaid}"</span>
                  </div>
                </div>

                <div className="flex items-start gap-1.5 pt-1 border-t border-white/5 dark:border-white/5 light-mode:border-slate-200">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="text-[10px] text-slate-500 uppercase font-bold block">Natural Form:</span>
                    <span className="text-emerald-400 dark:text-emerald-400 light-mode:text-emerald-700 font-bold">"{m.correctedForm}"</span>
                  </div>
                </div>
              </div>

              {m.explanation && (
                <p className="text-[11px] text-slate-400 dark:text-slate-400 light-mode:text-slate-600 leading-relaxed">
                  {m.explanation}
                </p>
              )}
            </div>
          ))}
        </div>
      )}

    </div>
  );
};
