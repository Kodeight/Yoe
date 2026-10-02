import React from 'react';
import { CheckCircle2, AlertCircle, Volume2, BookOpen, Clock, Award, ArrowRight, RotateCcw, X } from 'lucide-react';
import { CorrectionDetail, Scenario, ScenarioObjective } from '../types';

export interface SessionSummaryData {
  scenario: Scenario;
  durationMinutes: number;
  totalTurns: number;
  completedObjectives: ScenarioObjective[];
  mistakes: CorrectionDetail[];
  vocabularyLearned: Array<{ word: string; translation: string; phonetic?: string }>;
}

export const SessionSummaryModal: React.FC<{
  summary: SessionSummaryData;
  onClose: () => void;
  onRestart: () => void;
  onGoHome: () => void;
}> = ({ summary, onClose, onRestart, onGoHome }) => {
  const { scenario, durationMinutes, totalTurns, completedObjectives, mistakes, vocabularyLearned } = summary;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in">
      <div className="bg-slate-900 border border-white/10 rounded-3xl max-w-lg w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">

        {/* Modal Header */}
        <div className="p-5 border-b border-white/10 flex items-center justify-between bg-gradient-to-r from-emerald-500/10 via-teal-500/10 to-transparent">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <Award className="w-6 h-6" />
            </div>
            <div>
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-400 block">
                Session Debrief & Review
              </span>
              <h2 className="text-base font-black text-white">
                {scenario.title}
              </h2>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white cursor-pointer transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable Content Body */}
        <div className="p-5 overflow-y-auto space-y-4">

          {/* Quick Stats Grid */}
          <div className="grid grid-cols-3 gap-2 text-center">
            <div className="p-3 rounded-2xl bg-slate-950 border border-white/5">
              <Clock className="w-4 h-4 text-emerald-400 mx-auto mb-1" />
              <div className="text-base font-black text-white">{durationMinutes}m</div>
              <div className="text-[10px] text-slate-400">Duration</div>
            </div>

            <div className="p-3 rounded-2xl bg-slate-950 border border-white/5">
              <Volume2 className="w-4 h-4 text-cyan-400 mx-auto mb-1" />
              <div className="text-base font-black text-white">{totalTurns}</div>
              <div className="text-[10px] text-slate-400">Turns Spoken</div>
            </div>

            <div className="p-3 rounded-2xl bg-slate-950 border border-white/5">
              <CheckCircle2 className="w-4 h-4 text-amber-400 mx-auto mb-1" />
              <div className="text-base font-black text-white">
                {completedObjectives.length} / {scenario.objectives.length}
              </div>
              <div className="text-[10px] text-slate-400">Objectives</div>
            </div>
          </div>

          {/* Bullet-Point Summary: Grammar & Syntax Mistakes Learned */}
          <div className="p-4 rounded-2xl bg-slate-950 border border-white/5 space-y-3">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-amber-400" />
              <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider">
                Key Grammar & Language Patterns Learned ({mistakes.length})
              </h3>
            </div>

            {mistakes.length > 0 ? (
              <ul className="space-y-2.5">
                {mistakes.map((m, idx) => (
                  <li key={idx} className="p-2.5 rounded-xl bg-slate-900 border border-white/5 space-y-1 text-xs">
                    <div className="flex items-center gap-1.5 text-red-400">
                      <span className="font-bold">❌ You said:</span>
                      <span className="italic line-through opacity-80">"{m.original}"</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-emerald-400 font-semibold">
                      <span>✅ Better:</span>
                      <span>"{m.corrected}"</span>
                    </div>
                    {m.explanation && (
                      <p className="text-[11px] text-slate-400 pl-4 border-l-2 border-emerald-500/30 mt-1">
                        💡 {m.explanation}
                      </p>
                    )}
                  </li>
                ))}
              </ul>
            ) : (
              <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Impressive accuracy! No major grammar or syntax errors detected in this session.</span>
              </div>
            )}
          </div>

          {/* Bullet-Point Summary: Vocabulary Acquired */}
          <div className="p-4 rounded-2xl bg-slate-950 border border-white/5 space-y-3">
            <div className="flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-teal-400" />
              <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider">
                Vocabulary & Phrases Used ({vocabularyLearned.length})
              </h3>
            </div>

            {vocabularyLearned.length > 0 ? (
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {vocabularyLearned.map((v, idx) => (
                  <li key={idx} className="p-2.5 rounded-xl bg-slate-900 border border-white/5 flex flex-col justify-between text-xs">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-white">{v.word}</span>
                      {v.phonetic && <span className="text-[10px] text-teal-400 font-mono">{v.phonetic}</span>}
                    </div>
                    <span className="text-[11px] text-slate-400 mt-0.5">{v.translation}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-xs text-slate-400">
                General everyday dialogue practiced without new vocabulary flagged.
              </p>
            )}
          </div>

          {/* Objectives Achieved */}
          <div className="p-4 rounded-2xl bg-slate-950 border border-white/5 space-y-2">
            <span className="text-xs font-bold text-slate-300 uppercase tracking-wider block">
              Mission Objectives Accomplished
            </span>
            <div className="space-y-1.5">
              {scenario.objectives.map((obj) => {
                const isDone = completedObjectives.some(o => o.id === obj.id);
                return (
                  <div key={obj.id} className="flex items-center gap-2 text-xs">
                    <CheckCircle2 className={`w-4 h-4 ${isDone ? 'text-emerald-400' : 'text-slate-600'}`} />
                    <span className={isDone ? 'text-slate-200 line-through opacity-80' : 'text-slate-400'}>
                      {obj.text}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-white/10 bg-slate-950 flex items-center justify-between gap-2">
          <button
            onClick={onRestart}
            className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-300 flex items-center gap-1.5 cursor-pointer transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Practice Again</span>
          </button>

          <button
            onClick={onGoHome}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-400 text-slate-950 font-black text-xs flex items-center gap-1.5 shadow-md shadow-emerald-500/20 cursor-pointer hover:opacity-95 transition-opacity"
          >
            <span>Done & Return</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

      </div>
    </div>
  );
};
