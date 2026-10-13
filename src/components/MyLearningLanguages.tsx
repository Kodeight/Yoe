import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { SUPPORTED_LANGUAGES } from '../constants/languages';
import { LanguageFlag } from './LanguageFlag';
import { LanguageCode, CEFRLevel } from '../types';
import {
  Globe2,
  Plus,
  Check,
  Trash2,
  AlertCircle,
  X,
  Sparkles,
  ArrowRight,
  Flame,
  Star,
  Clock,
  Compass
} from 'lucide-react';

const CEFR_LEVELS: { level: CEFRLevel; label: string; desc: string }[] = [
  { level: 'A1', label: 'A1 · Beginner', desc: 'Starting from basics' },
  { level: 'A2', label: 'A2 · Elementary', desc: 'Simple everyday conversations' },
  { level: 'B1', label: 'B1 · Intermediate', desc: 'Comfortable speaking with natives' },
  { level: 'B2', label: 'B2 · Upper Int.', desc: 'Complex topics & fluent speech' },
  { level: 'C1', label: 'C1 · Advanced', desc: 'Professional fluency & nuance' }
];

const LEARNING_GOALS = [
  { id: 'Daily Conversation', label: 'Daily Conversation', icon: '💬' },
  { id: 'Travel', label: 'Travel & Exploration', icon: '✈️' },
  { id: 'Career & Work', label: 'Career & Business', icon: '💼' },
  { id: 'Culture & Media', label: 'Culture & Entertainment', icon: '🎭' },
  { id: 'Brain Workout', label: 'Brain Workout & Fluency', icon: '🧠' }
];

interface MyLearningLanguagesProps {
  onLanguageSwitched?: () => void;
  className?: string;
}

export const MyLearningLanguages: React.FC<MyLearningLanguagesProps> = ({
  onLanguageSwitched,
  className = ''
}) => {
  const {
    journeys,
    activeJourney,
    switchJourney,
    createNewJourney,
    removeJourney,
    setActiveView
  } = useApp();

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [journeyToRemove, setJourneyToRemove] = useState<string | null>(null);
  const [removeError, setRemoveError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Add Language Form State
  const [selectedTargetLang, setSelectedTargetLang] = useState<LanguageCode>('ru');
  const [selectedLevel, setSelectedLevel] = useState<CEFRLevel>('A1');
  const [selectedGoal, setSelectedGoal] = useState<string>('Daily Conversation');
  const [activateImmediately, setActivateImmediately] = useState<boolean>(true);

  // Set default unlearned language when opening modal
  const handleOpenAddModal = () => {
    const existingLangCodes = journeys.map((j) => j.targetLanguage);
    const unlearned = SUPPORTED_LANGUAGES.find((l) => !existingLangCodes.includes(l.code));
    if (unlearned) {
      setSelectedTargetLang(unlearned.code);
    } else {
      setSelectedTargetLang('ru');
    }
    setSelectedLevel('A1');
    setSelectedGoal('Daily Conversation');
    setActivateImmediately(true);
    setIsAddModalOpen(true);
  };

  const handleCreateLanguage = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await createNewJourney(
        selectedTargetLang,
        activeJourney?.supportLanguage || 'en',
        selectedLevel,
        {
          motivation: selectedGoal,
          focusAreas: ['Speaking', 'Listening'],
          activateImmediately
        }
      );
      setIsAddModalOpen(false);
      if (activateImmediately && onLanguageSwitched) {
        onLanguageSwitched();
      }
    } catch (err) {
      console.error('Failed to add language:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleConfirmRemove = async () => {
    if (!journeyToRemove) return;
    setRemoveError(null);
    const res = await removeJourney(journeyToRemove);
    if (!res.success) {
      if (res.reason === 'cannot_remove_last') {
        setRemoveError('You must have at least one active learning language.');
      } else {
        setRemoveError('Could not remove language. Please try again.');
      }
      return;
    }
    setJourneyToRemove(null);
    if (onLanguageSwitched) {
      onLanguageSwitched();
    }
  };

  const targetToRemoveMeta = journeyToRemove
    ? SUPPORTED_LANGUAGES.find(
        (l) => l.code === journeys.find((j) => j.id === journeyToRemove)?.targetLanguage
      )
    : null;

  return (
    <div className={`space-y-3.5 ${className}`}>
      {/* Section Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Globe2 className="w-4 h-4 text-emerald-400" />
          <h3 className="text-xs font-bold text-[var(--text-primary)] uppercase tracking-wider">
            My Learning Languages
          </h3>
        </div>
        <button
          type="button"
          onClick={handleOpenAddModal}
          className="py-1.5 px-3 rounded-xl bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/30 text-emerald-300 text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-all active:scale-95"
          title="Add another language"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Add Language</span>
        </button>
      </div>

      {/* Language Journey Cards List */}
      <div className="space-y-2.5">
        {journeys.map((journey) => {
          const langMeta = SUPPORTED_LANGUAGES.find((l) => l.code === journey.targetLanguage);
          const isActive = journey.id === activeJourney?.id;

          return (
            <div
              key={journey.id}
              className={`p-3.5 rounded-2xl transition-all border ${
                isActive
                  ? 'bg-emerald-500/10 border-emerald-500/40 shadow-sm ring-1 ring-emerald-500/20'
                  : 'glass-card border-white/5 dark:border-white/5 light-mode:border-slate-200 hover:border-emerald-500/30'
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                {/* Language Info */}
                <div className="flex items-center gap-3 min-w-0">
                  <LanguageFlag
                    code={journey.targetLanguage}
                    size="lg"
                    className="shadow-sm shrink-0"
                  />
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="text-sm font-bold text-[var(--text-primary)] truncate">
                        {langMeta?.name || journey.targetLanguage.toUpperCase()}
                      </h4>
                      <span className="text-[11px] text-[var(--text-secondary)]">
                        · {langMeta?.nativeName}
                      </span>
                      <span className="px-2 py-0.5 rounded-md bg-white/10 text-emerald-300 font-mono text-[10px] font-bold">
                        {journey.cefrLevel || 'A1'}
                      </span>
                    </div>

                    {/* Progress Metrics & Goal */}
                    <div className="flex items-center gap-3 text-[11px] text-[var(--text-muted)] mt-1 flex-wrap">
                      <span className="flex items-center gap-1 text-yellow-400 font-semibold">
                        <Star className="w-3 h-3 fill-yellow-400" />
                        <span>{journey.points || 0} XP</span>
                      </span>
                      <span className="flex items-center gap-1 text-cyan-400 font-semibold">
                        <Clock className="w-3 h-3" />
                        <span>{journey.totalMinutesSpoken || 0}m spoken</span>
                      </span>
                      {journey.motivation && (
                        <span className="text-[10px] text-[var(--text-secondary)] italic truncate max-w-[140px]">
                          Goal: {journey.motivation}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Actions: Active Badge OR Switch Button + Delete */}
                <div className="flex items-center gap-1.5 shrink-0">
                  {isActive ? (
                    <span className="px-2.5 py-1 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-[11px] font-black flex items-center gap-1">
                      <Check className="w-3 h-3 text-emerald-400" />
                      <span>Active</span>
                    </span>
                  ) : (
                    <button
                      type="button"
                      onClick={() => {
                        switchJourney(journey.id);
                        if (onLanguageSwitched) onLanguageSwitched();
                      }}
                      className="py-1 px-3 rounded-xl glass-pill hover:border-emerald-500/40 text-emerald-400 text-xs font-bold flex items-center gap-1 cursor-pointer transition-all active:scale-95"
                      title={`Switch to ${langMeta?.name || journey.targetLanguage}`}
                    >
                      <span>Switch</span>
                      <ArrowRight className="w-3 h-3 rtl-mirror" />
                    </button>
                  )}

                  {/* Remove Button (disabled if only 1 language) */}
                  {journeys.length > 1 && (
                    <button
                      type="button"
                      onClick={() => {
                        setRemoveError(null);
                        setJourneyToRemove(journey.id);
                      }}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors cursor-pointer"
                      title={`Remove ${langMeta?.name || 'language'} from active list`}
                      aria-label={`Remove ${langMeta?.name || 'language'}`}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* ========================================================================= */}
      {/* ADD LANGUAGE MODAL */}
      {/* ========================================================================= */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-slate-900 border border-white/10 rounded-3xl p-5 max-w-md w-full shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-2 border-b border-white/5">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-emerald-500/15 text-emerald-400">
                  <Plus className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white tracking-tight">
                    Add a New Language
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    Start a parallel learning journey with independent progress
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="p-2 rounded-full text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateLanguage} className="space-y-4">
              {/* 1. Target Language Grid */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-300 block">
                  Select Language
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {SUPPORTED_LANGUAGES.map((lang) => {
                    const isAlreadyLearning = journeys.some((j) => j.targetLanguage === lang.code);
                    const isSelected = selectedTargetLang === lang.code;

                    return (
                      <button
                        key={lang.code}
                        type="button"
                        onClick={() => setSelectedTargetLang(lang.code)}
                        className={`p-2.5 rounded-2xl text-left border flex items-center justify-between transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-emerald-500/20 border-emerald-500 text-white shadow-sm'
                            : 'bg-slate-800/60 border-white/5 text-slate-300 hover:border-emerald-500/30'
                        }`}
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <LanguageFlag code={lang.code} size="xs" className="shadow-xs shrink-0" />
                          <div className="min-w-0">
                            <p className="text-xs font-bold truncate leading-tight">
                              {lang.name}
                            </p>
                            <p className="text-[10px] text-slate-400 truncate">
                              {lang.nativeName}
                            </p>
                          </div>
                        </div>
                        {isAlreadyLearning && (
                          <span className="text-[9px] bg-slate-700/80 text-emerald-300 px-1.5 py-0.5 rounded-md shrink-0">
                            Saved
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 2. Starting CEFR Level */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-300 block">
                  Starting Proficiency Level
                </label>
                <div className="grid grid-cols-1 gap-1.5">
                  {CEFR_LEVELS.map((item) => (
                    <button
                      key={item.level}
                      type="button"
                      onClick={() => setSelectedLevel(item.level)}
                      className={`p-2.5 rounded-xl text-left border flex items-center justify-between transition-all cursor-pointer ${
                        selectedLevel === item.level
                          ? 'bg-emerald-500/20 border-emerald-500/60 text-white shadow-sm'
                          : 'bg-slate-800/40 border-white/5 text-slate-400 hover:text-slate-200 hover:border-white/10'
                      }`}
                    >
                      <div>
                        <span className="text-xs font-bold block">{item.label}</span>
                        <span className="text-[10px] text-slate-400 block">{item.desc}</span>
                      </div>
                      {selectedLevel === item.level && (
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* 3. Learning Goal */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-300 block">
                  Primary Learning Goal
                </label>
                <div className="grid grid-cols-2 gap-1.5">
                  {LEARNING_GOALS.map((goal) => (
                    <button
                      key={goal.id}
                      type="button"
                      onClick={() => setSelectedGoal(goal.id)}
                      className={`p-2 rounded-xl text-left border flex items-center gap-2 transition-all cursor-pointer ${
                        selectedGoal === goal.id
                          ? 'bg-teal-500/20 border-teal-500/60 text-white shadow-sm'
                          : 'bg-slate-800/40 border-white/5 text-slate-400 hover:text-slate-200 hover:border-white/10'
                      }`}
                    >
                      <span className="text-sm">{goal.icon}</span>
                      <span className="text-[11px] font-bold truncate">{goal.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* 4. Activate Immediately Checkbox */}
              <label className="flex items-center gap-2.5 p-3 rounded-xl bg-slate-800/50 border border-white/5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={activateImmediately}
                  onChange={(e) => setActivateImmediately(e.target.checked)}
                  className="rounded text-emerald-500 focus:ring-emerald-400 w-4 h-4 bg-slate-900 border-slate-700"
                />
                <div className="text-left">
                  <p className="text-xs font-bold text-slate-200">
                    Switch to this language immediately
                  </p>
                  <p className="text-[10px] text-slate-400">
                    Your conversation tutor and starter scenarios will update right away
                  </p>
                </div>
              </label>

              {/* Submit Buttons */}
              <div className="flex items-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="w-1/3 py-2.5 rounded-xl border border-white/10 text-slate-300 hover:bg-white/5 text-xs font-bold cursor-pointer transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-2/3 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black text-xs flex items-center justify-center gap-1.5 shadow-md shadow-emerald-500/20 cursor-pointer transition-all disabled:opacity-50"
                >
                  <Sparkles className="w-3.5 h-3.5 fill-slate-950" />
                  <span>
                    {isSubmitting ? 'Setting up...' : 'Start Learning Language'}
                  </span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* REMOVE LANGUAGE CONFIRMATION MODAL */}
      {/* ========================================================================= */}
      {journeyToRemove && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-slate-900 border border-rose-500/30 rounded-3xl p-5 max-w-sm w-full shadow-2xl space-y-4">
            <div className="flex items-center gap-3 text-rose-400">
              <div className="p-2.5 rounded-xl bg-rose-500/15 border border-rose-500/20">
                <AlertCircle className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-white">
                  Remove {targetToRemoveMeta?.name || 'Language'}?
                </h4>
                <p className="text-[11px] text-slate-400">
                  From your active learning journeys
                </p>
              </div>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              Your historical vocabulary bank, completed scenarios, and earned XP are
              <strong className="text-emerald-400 font-semibold"> safely preserved</strong>. You can resume this journey anytime by adding {targetToRemoveMeta?.name} back.
            </p>

            {removeError && (
              <p className="text-xs text-rose-400 font-semibold bg-rose-500/10 p-2.5 rounded-xl border border-rose-500/20">
                {removeError}
              </p>
            )}

            <div className="flex items-center gap-2 pt-1">
              <button
                type="button"
                onClick={() => setJourneyToRemove(null)}
                className="w-1/2 py-2.5 rounded-xl border border-white/10 text-slate-300 hover:bg-white/5 text-xs font-bold cursor-pointer transition-colors"
              >
                Keep Language
              </button>
              <button
                type="button"
                onClick={handleConfirmRemove}
                className="w-1/2 py-2.5 rounded-xl bg-rose-500 hover:bg-rose-600 text-white font-bold text-xs cursor-pointer transition-colors shadow-sm shadow-rose-500/20"
              >
                Confirm Remove
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
