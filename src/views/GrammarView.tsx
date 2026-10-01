import React from 'react';
import { useApp } from '../context/AppContext';
import { Target, AlertTriangle, CheckCircle, RefreshCw, Sparkles, WifiOff } from 'lucide-react';

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
            Recurring patterns Yoe is helping you master naturally
          </p>
        </div>

        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
          isOnline
            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
            : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
        }`}>
          {isOnline ? 'Cached & Synced' : 'Offline Ready'}
        </span>
      </div>

      {/* Offline Alert */}
      {!isOnline && (
        <div className="flex items-center gap-2 p-2.5 rounded-2xl bg-amber-500/15 border border-amber-500/30 text-amber-300 text-xs animate-in fade-in">
          <WifiOff className="w-4 h-4 text-amber-400 shrink-0" />
          <span>Offline Review Mode — Reviewing cached grammar rules & memory patterns.</span>
        </div>
      )}

      {mistakes.length === 0 ? (
        <div className="text-center py-12 px-4 rounded-2xl bg-slate-900/40 border border-white/5 text-slate-400">
          <CheckCircle className="w-8 h-8 text-emerald-400 mx-auto mb-2" />
          <p className="text-xs font-semibold text-slate-200">No active grammar mistakes!</p>
          <p className="text-[11px] text-slate-500 mt-1">
            Great job! As you converse, Yoe gently records area feedback here.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {mistakes.map((m) => (
            <div
              key={m.id}
              className="rounded-2xl bg-slate-900/80 dark:bg-slate-900/80 light-mode:bg-white border border-white/10 dark:border-white/10 light-mode:border-slate-200 p-4 shadow-md"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20 text-[10px] font-bold uppercase tracking-wide">
                  {m.category.replace('_', ' ')}
                </span>
                <span className="text-[10px] text-slate-400">
                  Noticed {m.occurrenceCount}x
                </span>
              </div>

              <h3 className="text-sm font-bold text-slate-100 dark:text-slate-100 light-mode:text-slate-900 mb-2">
                {m.pattern}
              </h3>

              <div className="bg-slate-950/80 rounded-xl p-3 text-xs space-y-1.5 border border-white/5 mb-3">
                <div className="flex items-start gap-1.5">
                  <AlertTriangle className="w-3.5 h-3.5 text-red-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="text-[10px] text-slate-500 uppercase font-bold block">User Said:</span>
                    <span className="text-red-300 font-medium line-through">"{m.exampleUserSaid}"</span>
                  </div>
                </div>

                <div className="flex items-start gap-1.5 pt-1 border-t border-white/5">
                  <CheckCircle className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="text-[10px] text-slate-500 uppercase font-bold block">Better Way:</span>
                    <span className="text-emerald-400 font-bold">"{m.correctedForm}"</span>
                  </div>
                </div>
              </div>

              <p className="text-xs text-slate-300 dark:text-slate-300 light-mode:text-slate-600 italic mb-3">
                "{m.explanation}"
              </p>

              <button
                onClick={() => setActiveView('chat')}
                className="w-full py-2 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/20 text-amber-400 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Practice this in a Scenario</span>
              </button>
            </div>
          ))}
        </div>
      )}

    </div>
  );
};
