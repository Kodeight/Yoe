import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { useAudio } from '../context/AudioContext';
import { Layers, Volume2, Search, BookOpen, Star, WifiOff, ShieldCheck } from 'lucide-react';

export const VocabularyView: React.FC = () => {
  const { vocabulary, activeJourney, isOnline } = useApp();
  const { speakText, isSpeaking } = useAudio();
  const [searchQuery, setSearchQuery] = useState('');

  const filteredVocab = vocabulary.filter(v =>
    v.word.toLowerCase().includes(searchQuery.toLowerCase()) ||
    v.translation.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="pb-24 pt-4 px-4 max-w-md mx-auto space-y-4 animate-in fade-in duration-300">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-100 dark:text-slate-100 light-mode:text-slate-900 tracking-tight flex items-center gap-2">
            <Layers className="w-5 h-5 text-purple-400" />
            <span>Learned Vocabulary</span>
          </h1>
          <p className="text-xs text-slate-400 dark:text-slate-400 light-mode:text-slate-500 mt-0.5">
            {vocabulary.length} words acquired during conversations
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

      {/* Offline Mode Alert */}
      {!isOnline && (
        <div className="flex items-center gap-2 p-2.5 rounded-2xl bg-amber-500/15 border border-amber-500/30 text-amber-300 text-xs animate-in fade-in">
          <WifiOff className="w-4 h-4 text-amber-400 shrink-0" />
          <span>Offline Review Mode — Reviewing cached vocabulary from Service Worker.</span>
        </div>
      )}

      {/* Search Input */}
      <div className="relative">
        <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search words or translations..."
          className="w-full bg-slate-900/80 dark:bg-slate-900/80 light-mode:bg-white border border-white/10 dark:border-white/10 light-mode:border-slate-200 rounded-2xl pl-10 pr-4 py-2.5 text-xs text-slate-100 dark:text-slate-100 light-mode:text-slate-900 placeholder-slate-500 focus:outline-none focus:border-purple-400 transition-colors"
        />
      </div>

      {/* Vocab Cards List */}
      {filteredVocab.length === 0 ? (
        <div className="text-center py-12 px-4 rounded-2xl bg-slate-900/40 border border-white/5 text-slate-400">
          <BookOpen className="w-8 h-8 text-slate-600 mx-auto mb-2" />
          <p className="text-xs font-semibold">No vocabulary found</p>
          <p className="text-[11px] text-slate-500 mt-1">
            Start conversations to collect and practice new words!
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredVocab.map((item) => (
            <div
              key={item.id}
              className="rounded-2xl bg-slate-900/80 dark:bg-slate-900/80 light-mode:bg-white border border-white/10 dark:border-white/10 light-mode:border-slate-200 p-4 shadow-md transition-all hover:border-purple-500/30"
            >
              <div className="flex items-start justify-between gap-3 mb-1.5">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-extrabold text-slate-100 dark:text-slate-100 light-mode:text-slate-900">
                      {item.word}
                    </h3>
                    {item.phonetic && (
                      <span className="text-xs font-mono text-purple-400">
                        {item.phonetic}
                      </span>
                    )}
                  </div>
                  <p className="text-xs font-semibold text-emerald-400 mt-0.5">
                    {item.translation}
                  </p>
                </div>

                <button
                  onClick={() => speakText(item.word, activeJourney?.targetLanguage)}
                  className="p-2 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400 hover:bg-purple-500/20 transition-colors cursor-pointer"
                  title="Listen"
                >
                  <Volume2 className="w-4 h-4" />
                </button>
              </div>

              {/* Example sentence */}
              {item.exampleSentence && (
                <div className="mt-2.5 pt-2.5 border-t border-white/10 dark:border-white/10 light-mode:border-slate-200 text-xs">
                  <p className="text-slate-300 dark:text-slate-300 light-mode:text-slate-700 italic">
                    "{item.exampleSentence}"
                  </p>
                  {item.exampleTranslation && (
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      "{item.exampleTranslation}"
                    </p>
                  )}
                </div>
              )}

              {/* Familiarity Score Meter */}
              <div className="mt-3 flex items-center justify-between text-[10px] text-slate-400">
                <div className="flex items-center gap-1.5 flex-1 max-w-[180px]">
                  <span>Mastery</span>
                  <div className="flex-1 h-1.5 rounded-full bg-slate-800 dark:bg-slate-800 light-mode:bg-slate-200 overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-purple-500 to-indigo-400 rounded-full"
                      style={{ width: `${item.familiarity}%` }}
                    />
                  </div>
                  <span className="font-bold text-purple-400">{item.familiarity}%</span>
                </div>

                <div className="flex items-center gap-1 text-yellow-400">
                  <Star className="w-3 h-3 fill-yellow-400" />
                  <span>Exposed {item.exposureCount}x</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

    </div>
  );
};
