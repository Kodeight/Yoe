import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { Scenario, Lesson, CourseUnit, LearningJourney } from '../types';
import { SUPPORTED_LANGUAGES } from '../constants/languages';
import { LanguageFlag } from './LanguageFlag';
import { getTranslation } from '../utils/i18n';
import {
  Plane,
  Briefcase,
  GraduationCap,
  MessageCircle,
  Sparkles,
  Mic,
  Headphones,
  BookOpen,
  Puzzle,
  Zap,
  ArrowRight,
  ArrowLeft,
  Check,
  Play,
  RotateCcw,
  Volume2
} from 'lucide-react';

export interface SessionSetupAnswers {
  name: string;
  motivation: string;
  focusAreas: string[];
  learningGoal: string;
}

interface PersonalizedSessionSetupProps {
  scenario: Scenario;
  lesson: Lesson | null;
  course: CourseUnit | null;
  journey: LearningJourney | null;
  onStartSession: (answers: SessionSetupAnswers) => void;
}

export const PersonalizedSessionSetup: React.FC<PersonalizedSessionSetupProps> = ({
  scenario,
  lesson,
  course,
  journey,
  onStartSession
}) => {
  const { user, updateUserProfile, updateActiveJourney, uiLanguage, isRtl } = useApp();
  const t = getTranslation(uiLanguage);

  // Resolve target language display
  const targetLangCode = journey?.targetLanguage || scenario.targetLanguage || 'es';
  const targetLangMeta = SUPPORTED_LANGUAGES.find((l) => l.code === targetLangCode) || SUPPORTED_LANGUAGES[2];
  const targetLangName = targetLangMeta?.name || 'Spanish';

  // Initial values from existing profile or journey
  const initialName = user?.name || journey?.learnerName || '';
  const initialMotivation = user?.motivation || journey?.motivation || journey?.goals || 'Conversation';
  const initialFocus = (user?.focusAreas && user.focusAreas[0]) || (journey?.focusAreas && journey.focusAreas[0]) || 'Speaking';

  // Check if learner has previously saved personalized answers
  const hasExistingAnswers = Boolean(
    initialName.trim() &&
    (user?.motivation || journey?.motivation) &&
    (user?.focusAreas?.[0] || journey?.focusAreas?.[0])
  );

  // Start on step 1 so every user experiences the conversational setup;
  // returning users can tap Continue or click the shortcut to review step (step 4)
  const [step, setStep] = useState<number>(1);
  const [name, setName] = useState<string>(initialName);
  const [motivation, setMotivation] = useState<string>(initialMotivation);
  const [focusArea, setFocusArea] = useState<string>(initialFocus);
  const [isSaving, setIsSaving] = useState<boolean>(false);

  const inputRef = useRef<HTMLInputElement>(null);

  // Focus name input when entering step 1
  useEffect(() => {
    if (step === 1 && inputRef.current) {
      const timer = setTimeout(() => {
        inputRef.current?.focus();
      }, 150);
      return () => clearTimeout(timer);
    }
  }, [step]);

  const triggerHaptic = () => {
    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      try {
        navigator.vibrate(15);
      } catch (e) {}
    }
  };

  const handleNameSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    triggerHaptic();
    const cleanName = name.trim() || user?.name || user?.username || 'Learner';
    setName(cleanName);
    setStep(2);
  };

  const handleSelectMotivation = (optId: string) => {
    triggerHaptic();
    setMotivation(optId);
    setStep(3);
  };

  const handleSelectFocus = (optId: string) => {
    triggerHaptic();
    setFocusArea(optId);
    setStep(4);
  };

  const handleStartPractice = async () => {
    triggerHaptic();
    setIsSaving(true);

    const resolvedName = name.trim() || user?.name || user?.username || 'Learner';
    const resolvedMotivation = motivation || 'Conversation';
    const resolvedFocus = focusArea || 'Speaking';
    const learningGoal = `Improve ${resolvedFocus} for ${resolvedMotivation}`;

    const answers: SessionSetupAnswers = {
      name: resolvedName,
      motivation: resolvedMotivation,
      focusAreas: [resolvedFocus],
      learningGoal
    };

    try {
      // 1. Persist to User profile in DB / settings
      await updateUserProfile({
        name: resolvedName,
        motivation: resolvedMotivation,
        focusAreas: [resolvedFocus],
        learningGoal
      });

      // 2. Persist to active LearningJourney in DB
      if (journey) {
        await updateActiveJourney({
          learnerName: resolvedName,
          motivation: resolvedMotivation,
          focusAreas: [resolvedFocus],
          goals: resolvedMotivation
        });
      }
    } catch (e) {
      console.warn('Session setup persistence note:', e);
    } finally {
      setIsSaving(false);
      // 3. Launch conversation with complete combined context
      onStartSession(answers);
    }
  };

  // Localized Motivation options
  const MOTIVATION_OPTIONS = [
    { id: 'Travel', label: t.goalTravel, description: t.goalTravelDesc, icon: Plane },
    { id: 'Work', label: t.goalWork, description: t.goalWorkDesc, icon: Briefcase },
    { id: 'School', label: t.goalSchool, description: t.goalSchoolDesc, icon: GraduationCap },
    { id: 'Conversation', label: t.goalConversation, description: t.goalConversationDesc, icon: MessageCircle },
    { id: 'Just for fun', label: t.goalFun, description: t.goalFunDesc, icon: Sparkles }
  ];

  // Localized Focus options
  const FOCUS_OPTIONS = [
    { id: 'Speaking', label: t.focusSpeaking, description: t.focusSpeakingDesc, icon: Mic },
    { id: 'Listening', label: t.focusListening, description: t.focusListeningDesc, icon: Headphones },
    { id: 'Vocabulary', label: t.focusVocabulary, description: t.focusVocabularyDesc, icon: BookOpen },
    { id: 'Grammar', label: t.focusGrammar, description: t.focusGrammarDesc, icon: Puzzle },
    { id: 'Pronunciation', label: t.focusPronunciation, description: t.focusPronunciationDesc, icon: Volume2 },
    { id: 'Everything', label: t.focusEverything, description: t.focusEverythingDesc, icon: Zap }
  ];

  return (
    <div className="flex-1 flex flex-col justify-between p-4 sm:p-6 w-full max-w-md mx-auto select-none animate-in fade-in duration-300">

      {/* Top Friendly Step Indicator */}
      <div className="shrink-0 flex items-center justify-between pt-1 pb-3">
        <div className="flex items-center gap-2">
          {step > 1 ? (
            <button
              type="button"
              onClick={() => {
                triggerHaptic();
                setStep((s) => Math.max(1, s - 1));
              }}
              className="p-1.5 rounded-full glass-pill text-slate-400 hover:text-slate-100 dark:hover:text-white light-mode:text-slate-600 light-mode:hover:text-slate-900 transition-colors cursor-pointer"
              title={t.backButton}
            >
              <ArrowLeft className={`w-3.5 h-3.5 ${isRtl ? 'rotate-180' : ''}`} />
            </button>
          ) : (
            <span className="w-6 h-6" />
          )}

          <span className="text-[11px] font-semibold tracking-wide text-emerald-600 dark:text-emerald-400 uppercase">
            {step === 4 ? t.sessionSetupTitle : t.stepIndicator.replace('{current}', String(step)).replace('{total}', '3')}
          </span>
        </div>

        {/* Step dots */}
        <div className="flex items-center gap-1.5">
          {[1, 2, 3, 4].map((s) => (
            <div
              key={s}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                s === step
                  ? 'w-5 bg-gradient-to-r from-emerald-400 to-teal-400'
                  : s < step
                  ? 'w-2 bg-emerald-500/50'
                  : 'w-2 bg-slate-300 dark:bg-slate-700/60'
              }`}
            />
          ))}
        </div>
      </div>

      {/* QUESTION 1: WHAT SHOULD I CALL YOU? */}
      {step === 1 && (
        <div className="flex-1 flex flex-col justify-center space-y-6 animate-in slide-in-from-right-4 duration-250 my-auto">
          <div className="space-y-2 text-center">
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-slate-100 tracking-tight">
              {t.nameQuestionTitle}
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 max-w-xs mx-auto leading-relaxed">
              {t.nameQuestionSubtitle}
            </p>
          </div>

          <form onSubmit={handleNameSubmit} className="space-y-4 max-w-sm mx-auto w-full">
            <div className="relative">
              <input
                ref={inputRef}
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={user?.name || user?.username || t.namePlaceholder}
                maxLength={40}
                className="w-full py-4 px-5 text-center text-lg font-bold rounded-2xl bg-white dark:bg-slate-900/80 border border-slate-300 dark:border-white/10 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-emerald-400/50 focus:border-emerald-400 transition-all shadow-sm"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 hover:from-emerald-400 hover:to-teal-400 text-white font-extrabold text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/25 active:scale-[0.98] transition-all cursor-pointer"
            >
              <span>{t.continueButton}</span>
              <ArrowRight className={`w-4 h-4 text-white ${isRtl ? 'rotate-180' : ''}`} />
            </button>

            {hasExistingAnswers && (
              <button
                type="button"
                onClick={() => {
                  triggerHaptic();
                  const cleanName = name.trim() || user?.name || user?.username || 'Learner';
                  setName(cleanName);
                  setStep(4);
                }}
                className="w-full py-2 text-center text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:underline cursor-pointer flex items-center justify-center gap-1.5 transition-colors"
              >
                <span>{t.useSavedSetup} ({motivation} • {focusArea})</span>
                <ArrowRight className={`w-3.5 h-3.5 ${isRtl ? 'rotate-180' : ''}`} />
              </button>
            )}
          </form>
        </div>
      )}

      {/* QUESTION 2: WHAT ARE YOU LEARNING FOR? */}
      {step === 2 && (
        <div className="flex-1 flex flex-col justify-center space-y-4 animate-in slide-in-from-right-4 duration-250 my-auto">
          <div className="space-y-1 text-center">
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-slate-100 tracking-tight">
              {t.goalQuestionTitle.replace('{language}', targetLangName)}
            </h2>
            <p className="text-xs text-slate-600 dark:text-slate-400 max-w-xs mx-auto leading-relaxed">
              {t.goalQuestionSubtitle}
            </p>
          </div>

          <div className="space-y-2 max-w-sm mx-auto w-full pt-1">
            {MOTIVATION_OPTIONS.map((opt) => {
              const Icon = opt.icon;
              const isSelected = motivation === opt.id;
              return (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => handleSelectMotivation(opt.id)}
                  className={`w-full p-3.5 rounded-2xl border text-left flex items-center justify-between transition-all cursor-pointer active:scale-[0.99] ${
                    isSelected
                      ? 'border-emerald-500 bg-emerald-500/15 text-slate-900 dark:text-slate-100 shadow-sm ring-1 ring-emerald-500/40'
                      : 'bg-white/80 dark:bg-slate-900/60 border-slate-200 dark:border-white/10 text-slate-800 dark:text-slate-200 hover:border-emerald-500/40 hover:bg-slate-50 dark:hover:bg-slate-800/60 shadow-xs'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-colors ${
                        isSelected
                          ? 'bg-emerald-500 text-white'
                          : 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                    </div>
                    <div className="min-w-0">
                      <div className="text-xs sm:text-sm font-bold text-slate-900 dark:text-slate-100">
                        {opt.label}
                      </div>
                      <div className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                        {opt.description}
                      </div>
                    </div>
                  </div>
                  {isSelected && (
                    <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 ml-2" />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* QUESTION 3: WHAT WOULD YOU LIKE TO IMPROVE MOST? */}
      {step === 3 && (
        <div className="flex-1 flex flex-col justify-center space-y-4 animate-in slide-in-from-right-4 duration-250 my-auto">
          <div className="space-y-1 text-center">
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-slate-100 tracking-tight">
              {t.focusQuestionTitle}
            </h2>
            <p className="text-xs text-slate-600 dark:text-slate-400 max-w-xs mx-auto leading-relaxed">
              {t.focusQuestionSubtitle}
            </p>
          </div>

          <div className="space-y-2 max-w-sm mx-auto w-full pt-1">
            {FOCUS_OPTIONS.map((opt) => {
              const Icon = opt.icon;
              const isSelected = focusArea === opt.id;
              return (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => handleSelectFocus(opt.id)}
                  className={`w-full p-3.5 rounded-2xl border text-left flex items-center justify-between transition-all cursor-pointer active:scale-[0.99] ${
                    isSelected
                      ? 'border-emerald-500 bg-emerald-500/15 text-slate-900 dark:text-slate-100 shadow-sm ring-1 ring-emerald-500/40'
                      : 'bg-white/80 dark:bg-slate-900/60 border-slate-200 dark:border-white/10 text-slate-800 dark:text-slate-200 hover:border-emerald-500/40 hover:bg-slate-50 dark:hover:bg-slate-800/60 shadow-xs'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-colors ${
                        isSelected
                          ? 'bg-emerald-500 text-white'
                          : 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                    </div>
                    <div className="min-w-0">
                      <div className="text-xs sm:text-sm font-bold text-slate-900 dark:text-slate-100">
                        {opt.label}
                      </div>
                      <div className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                        {opt.description}
                      </div>
                    </div>
                  </div>
                  {isSelected && (
                    <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 ml-2" />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* STEP 4: READY TO PRACTICE? (COMBINED DUAL-CONTEXT PREVIEW) */}
      {step === 4 && (
        <div className="flex-1 flex flex-col justify-center space-y-4 animate-in slide-in-from-right-4 duration-250 my-auto">
          <div className="space-y-1 text-center">
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-slate-100 tracking-tight">
              {t.readyTitle.replace('{name}', name || 'friend')}
            </h2>
            <p className="text-xs text-slate-600 dark:text-slate-400 max-w-xs mx-auto leading-relaxed">
              {t.readySubtitle}
            </p>
          </div>

          {/* Unified Context Summary Card */}
          <div className="max-w-sm mx-auto w-full p-4 rounded-3xl bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-white/10 shadow-md space-y-3">
            {/* Scenario Row */}
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-xl bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 font-bold">
                🎭
              </div>
              <div className="min-w-0 flex-1">
                <span className="text-[9px] font-black uppercase tracking-wider text-emerald-600 dark:text-emerald-400 block">
                  {t.scenarioSetting}
                </span>
                <div className="text-xs font-bold text-slate-900 dark:text-slate-100 truncate">
                  {scenario.title}
                </div>
                <div className="text-[10px] text-slate-500 dark:text-slate-400 truncate">
                  Role: {scenario.characterName} ({scenario.characterRole}) at {scenario.location}
                </div>
              </div>
            </div>

            {/* Curriculum Lesson Row */}
            <div className="flex items-start gap-3 pt-2 border-t border-slate-100 dark:border-white/5">
              <div className="w-9 h-9 rounded-xl bg-teal-500/15 text-teal-600 dark:text-teal-400 flex items-center justify-center shrink-0 font-bold">
                📚
              </div>
              <div className="min-w-0 flex-1">
                <span className="text-[9px] font-black uppercase tracking-wider text-teal-600 dark:text-teal-400 block">
                  {t.curriculumLesson}
                </span>
                <div className="text-xs font-bold text-slate-900 dark:text-slate-100 truncate">
                  {lesson?.title || scenario.relatedLessonTitle || 'Foundational Communication'}
                </div>
                <div className="text-[10px] text-slate-500 dark:text-slate-400 truncate">
                  {course?.title || `${targetLangName} Curriculum`} • CEFR {journey?.cefrLevel || scenario.cefrLevel || 'A1'}
                </div>
              </div>
            </div>

            {/* Learner Personalization Row */}
            <div className="flex items-start gap-3 pt-2 border-t border-slate-100 dark:border-white/5">
              <div className="w-9 h-9 rounded-xl bg-cyan-500/15 text-cyan-600 dark:text-cyan-400 flex items-center justify-center shrink-0 font-bold">
                🎯
              </div>
              <div className="min-w-0 flex-1">
                <span className="text-[9px] font-black uppercase tracking-wider text-cyan-600 dark:text-cyan-400 block">
                  {t.yourLearningGoal}
                </span>
                <div className="text-xs font-bold text-slate-900 dark:text-slate-100">
                  {motivation} • {focusArea}
                </div>
                <div className="text-[10px] text-slate-500 dark:text-slate-400 flex items-center gap-1.5 mt-0.5">
                  <LanguageFlag code={targetLangCode} size="xs" className="shadow-xs" />
                  <span>{targetLangName}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Change link */}
          <div className="text-center pt-0.5">
            <button
              type="button"
              onClick={() => {
                triggerHaptic();
                setStep(1);
              }}
              className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 hover:underline cursor-pointer inline-flex items-center gap-1"
            >
              <RotateCcw className="w-3 h-3" />
              <span>{t.changeGoals}</span>
            </button>
          </div>

          {/* Primary Action Button */}
          <div className="max-w-sm mx-auto w-full pt-1">
            <button
              type="button"
              disabled={isSaving}
              onClick={handleStartPractice}
              className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 hover:from-emerald-400 hover:to-teal-400 text-white font-black text-sm flex items-center justify-center gap-2.5 shadow-xl shadow-emerald-500/25 active:scale-[0.98] transition-all cursor-pointer disabled:opacity-70"
            >
              <Play className="w-5 h-5 fill-current text-white" />
              <span className="text-white font-extrabold">
                {isSaving ? 'Preparing session...' : t.startPractice}
              </span>
            </button>
          </div>
        </div>
      )}

      {/* Calm supportive hint footer */}
      <div className="shrink-0 text-center text-[10px] text-slate-500 dark:text-slate-500 py-1">
        <span>Yoe will practice with you through natural voice conversation.</span>
      </div>

    </div>
  );
};
