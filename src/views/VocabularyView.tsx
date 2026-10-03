import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { useAudio } from '../context/AudioContext';
import { Layers, Volume2, Search, BookOpen, Star, WifiOff, Compass } from 'lucide-react';

export const VocabularyView: React.FC = () => {
  const { vocabulary, activeJourney, isOnline, setActiveView } = useApp();
  const { replayMessage, playingMessageId, isSpeaking, replayErrorId } = useAudio();
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
            <span>Learned Vocabulary Bank</span>
          </h1>
          <p className="text-xs text-slate-400 dark:text-slate-400 light-mode:text-slate-500 mt-0.5">
            {vocabulary.length} words acquired during conversations in {activeJourney?.targetLanguage.toUpperCase()}
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

      {/* Offline Mode Alert */}
      {!isOnline && (
        <div className="flex items-center gap-2 p-2.5 rounded-2xl bg-amber-500/15 border border-amber-500/30 text-amber-300 text-xs animate-in fade-in">
          <WifiOff className="w-4 h-4 text-amber-400 shrink-0" />
          <span>Offline Review Mode — Serving all {vocabulary.length} cached vocabulary items from Service Worker.</span>
        </div>
      )}

      {/* Search Input (only if vocab exists) */}
      {vocabulary.length > 0 && (
        <div className="relative">
          <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search acquired words or translations..."
            className="w-full bg-slate-950/60 dark:bg-slate-950/60 light-mode:bg-white border border-white/10 dark:border-white/10 light-mode:border-slate-200 rounded-2xl pl-10 pr-4 py-2.5 text-xs text-slate-100 dark:text-slate-100 light-mode:text-slate-900 placeholder-slate-500 focus:outline-none focus:border-purple-400 transition-colors"
          />
        </div>
      )}

      {/* Empty State vs Vocab Cards List */}
      {vocabulary.length === 0 ? (
        <div className="rounded-3xl glass-card p-8 text-center space-y-3">
          <div className="w-12 h-12 rounded-full bg-purple-500/15 border border-purple-500/25 flex items-center justify-center mx-auto text-purple-400">
            <BookOpen className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-slate-100 dark:text-slate-100 light-mode:text-slate-900">
            You'll see your useful words here as you learn
          </h3>
          <p className="text-xs text-slate-400 dark:text-slate-400 light-mode:text-slate-600 max-w-xs mx-auto leading-relaxed">
            Every conversation you hold with Yoe extracts high-frequency vocabulary and saves it to your personal memory bank.
          </p>
          <button
            onClick={() => setActiveView('explore')}
            className="mt-2 py-2.5 px-5 rounded-xl bg-gradient-to-r from-emerald-400 to-teal-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 mx-auto shadow-md cursor-pointer"
          >
            <Compass className="w-4 h-4" />
            <span>Start a Scenario to Collect Words</span>
          </button>
        </div>
      ) : filteredVocab.length === 0 ? (
        <div className="rounded-2xl glass-card p-6 text-center text-slate-400 text-xs">
          No words matching "{searchQuery}".
        </div>
      ) : (
        <div className="space-y-3">
          {filteredVocab.map((item) => (
            <div
              key={item.id}
              className="rounded-2xl glass-card p-4 shadow-md transition-all hover:border-purple-500/30"
            >
              <div className="flex items-start justify-between gap-3 mb-1.5">
                <div>
                  <h3 className="text-base font-extrabold text-slate-100 dark:text-slate-100 light-mode:text-slate-900 flex items-center gap-2">
                    <span>{item.word}</span>
                    {item.phonetic && (
                      <span className="text-[11px] font-normal text-purple-400 dark:text-purple-300">
                        {item.phonetic}
                      </span>
                    )}
                  </h3>
                  <p className="text-xs text-slate-300 dark:text-slate-300 light-mode:text-slate-700 font-medium">
                    {item.translation}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => replayMessage(item.id, item.word)}
                  className={`p-2 rounded-full glass-pill transition-colors cursor-pointer ${
                    playingMessageId === item.id && isSpeaking
                      ? 'border-purple-400 text-purple-400 bg-purple-500/20 animate-pulse'
                      : replayErrorId === item.id
                      ? 'border-rose-400 text-rose-400 bg-rose-500/20'
                      : 'hover:border-purple-400 text-slate-400 hover:text-purple-400'
                  }`}
                  title={playingMessageId === item.id && isSpeaking ? 'Stop playback' : 'Listen pronunciation'}
                >
                  <Volume2 className={`w-4 h-4 ${playingMessageId === item.id && isSpeaking ? 'stroke-[2.5]' : ''}`} />
                </button>
              </div>

              {item.exampleSentence && (
                <div className="mt-2 pt-2 border-t border-white/5 dark:border-white/5 light-mode:border-slate-200 text-[11px] space-y-0.5">
                  <p className="text-slate-300 dark:text-slate-300 light-mode:text-slate-700 italic">
                    "{item.exampleSentence}"
                  </p>
                  {item.exampleTranslation && (
                    <p className="text-slate-500 dark:text-slate-500 light-mode:text-slate-500 text-[10px]">
                      {item.exampleTranslation}
                    </p>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

    </div>
  );
};
