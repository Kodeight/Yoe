import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { useAudio } from '../context/AudioContext';
import { CourseUnit, Lesson, QuizQuestion } from '../types';
import { getUnitsForLanguage } from '../data/curriculumData';
import { ProgressView } from './ProgressView';
import {
  BookOpen,
  CheckCircle2,
  Lock,
  Play,
  Award,
  Volume2,
  ArrowRight,
  Flame,
  Star,
  Target,
  ChevronRight,
  HelpCircle,
  Puzzle,
  RotateCcw,
  Zap,
  Clock,
  Layers,
  Check,
  X
} from 'lucide-react';

export const LearnView: React.FC = () => {
  const { activeJourney, vocabulary, mistakes, setActiveView, setActiveScenarioId } = useApp();
  const { speakText, replayMessage, playingMessageId, loadingAudioId, isSpeaking, replayErrorId, playFeedbackSound } = useAudio();

  const [activeTab, setActiveTab] = useState<'course' | 'progress' | 'review'>('course');
  const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(null);

  // Lesson Runner state
  const [currentQuizIndex, setCurrentQuizIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isAnswerSubmitted, setIsAnswerSubmitted] = useState(false);
  const [quizScore, setQuizScore] = useState(0);

  // Mini-game state (Sentence builder / Word match)
  const [builtSentence, setBuiltSentence] = useState<string[]>([]);
  const [matchedPairs, setMatchedPairs] = useState<Record<string, string>>({});
  const [selectedLeft, setSelectedLeft] = useState<string | null>(null);

  // Completed lessons stored in local storage
  const [completedLessonIds, setCompletedLessonIds] = useState<Record<string, boolean>>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('yoe_completed_lessons');
      return saved ? JSON.parse(saved) : {};
    }
    return {};
  });

  const units = useMemo(() => {
    return getUnitsForLanguage(activeJourney?.targetLanguage);
  }, [activeJourney?.targetLanguage]);

  const activeUnit = units[0] || units[0];

  const handleOpenLesson = (lesson: Lesson) => {
    if (lesson.type === 'speaking' && lesson.speakingScenarioId) {
      setActiveScenarioId(lesson.speakingScenarioId);
      setActiveView('chat');
      return;
    }

    setSelectedLesson(lesson);
    setCurrentQuizIndex(0);
    setSelectedOption(null);
    setIsAnswerSubmitted(false);
    setQuizScore(0);
    setBuiltSentence([]);
    setMatchedPairs({});
    setSelectedLeft(null);
  };

  const handleCompleteLesson = (lessonId: string) => {
    playFeedbackSound('success');
    const nextCompleted = { ...completedLessonIds, [lessonId]: true };
    setCompletedLessonIds(nextCompleted);
    if (typeof window !== 'undefined') {
      localStorage.setItem('yoe_completed_lessons', JSON.stringify(nextCompleted));
    }
    setSelectedLesson(null);
  };

  return (
    <div className="pb-24 pt-3 px-5 sm:px-6 max-w-md mx-auto space-y-4">

      {/* Top Neutral Tab Navigation with Animated Left-to-Right Green Underline Bar */}
      <div className="relative border-b border-white/10 dark:border-white/10 light-mode:border-slate-200 pb-2 flex items-center justify-between gap-1">
        <button
          type="button"
          onClick={() => setActiveTab('course')}
          className={`relative flex-1 py-2 px-2 text-xs font-bold transition-colors cursor-pointer flex items-center justify-center gap-1.5 ${
            activeTab === 'course'
              ? 'text-emerald-400 dark:text-emerald-400 light-mode:text-emerald-600'
              : 'text-slate-400 dark:text-slate-400 light-mode:text-slate-600 hover:text-slate-200'
          }`}
        >
          <BookOpen className="w-3.5 h-3.5" />
          <span>Course Units</span>
          {activeTab === 'course' && (
            <span className="absolute bottom-0 left-1 right-1 h-0.5 rounded-full bg-gradient-to-r from-emerald-400 to-teal-400 animate-underline-expand" />
          )}
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('review')}
          className={`relative flex-1 py-2 px-2 text-xs font-bold transition-colors cursor-pointer flex items-center justify-center gap-1.5 ${
            activeTab === 'review'
              ? 'text-emerald-400 dark:text-emerald-400 light-mode:text-emerald-600'
              : 'text-slate-400 dark:text-slate-400 light-mode:text-slate-600 hover:text-slate-200'
          }`}
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Adaptive Memory</span>
          {activeTab === 'review' && (
            <span className="absolute bottom-0 left-1 right-1 h-0.5 rounded-full bg-gradient-to-r from-emerald-400 to-teal-400 animate-underline-expand" />
          )}
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('progress')}
          className={`relative flex-1 py-2 px-2 text-xs font-bold transition-colors cursor-pointer flex items-center justify-center gap-1.5 ${
            activeTab === 'progress'
              ? 'text-emerald-400 dark:text-emerald-400 light-mode:text-emerald-600'
              : 'text-slate-400 dark:text-slate-400 light-mode:text-slate-600 hover:text-slate-200'
          }`}
        >
          <Target className="w-3.5 h-3.5" />
          <span>Progress</span>
          {activeTab === 'progress' && (
            <span className="absolute bottom-0 left-1 right-1 h-0.5 rounded-full bg-gradient-to-r from-emerald-400 to-teal-400 animate-underline-expand" />
          )}
        </button>
      </div>

      {activeTab === 'progress' && <ProgressView />}

      {activeTab === 'review' && (
        <div className="space-y-4 animate-in fade-in duration-200">
          <div className="glass-card rounded-3xl p-5 shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-purple-500/15 text-purple-400">
                  <RotateCcw className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-100 dark:text-slate-100 light-mode:text-slate-900">
                    Spaced Repetition & Adaptive Memory
                  </h3>
                  <p className="text-[10px] text-slate-400 dark:text-slate-400 light-mode:text-slate-500">
                    Dynamic recall based on your real conversational turns
                  </p>
                </div>
              </div>
            </div>

            {/* Quick stats */}
            <div className="grid grid-cols-2 gap-2">
              <div className="p-3 rounded-2xl glass-pill flex items-center justify-between border border-white/10 dark:border-white/10 light-mode:border-slate-200 light-mode:bg-slate-50/80">
                <div>
                  <div className="text-[10px] text-slate-400 dark:text-slate-400 light-mode:text-slate-600">Weak Patterns</div>
                  <div className="text-base font-black text-amber-400 dark:text-amber-400 light-mode:text-amber-700">{mistakes.length} Recorded</div>
                </div>
                <Target className="w-4 h-4 text-amber-400/60 dark:text-amber-400/60 light-mode:text-amber-600" />
              </div>
              <div className="p-3 rounded-2xl glass-pill flex items-center justify-between border border-white/10 dark:border-white/10 light-mode:border-slate-200 light-mode:bg-slate-50/80">
                <div>
                  <div className="text-[10px] text-slate-400 dark:text-slate-400 light-mode:text-slate-600">Mastery Bank</div>
                  <div className="text-base font-black text-emerald-400 dark:text-emerald-400 light-mode:text-emerald-700">{vocabulary.length} Words</div>
                </div>
                <BookOpen className="w-4 h-4 text-emerald-400/60 dark:text-emerald-400/60 light-mode:text-emerald-600" />
              </div>
            </div>

            {/* Empty State with Clear CTAs if learner has no data */}
            {mistakes.length === 0 && vocabulary.length === 0 ? (
              <div className="p-6 rounded-2xl glass-pill text-center space-y-3 border border-white/10 dark:border-white/10 light-mode:border-slate-200 light-mode:bg-slate-50/80">
                <div className="w-10 h-10 rounded-full bg-purple-500/15 border border-purple-500/25 flex items-center justify-center mx-auto text-purple-400 dark:text-purple-400 light-mode:text-purple-700">
                  <RotateCcw className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-xs text-slate-100 dark:text-slate-100 light-mode:text-slate-900">
                    Your Memory Bank is Ready to Learn
                  </h4>
                  <p className="text-[11px] text-slate-400 dark:text-slate-400 light-mode:text-slate-600 max-w-xs mx-auto leading-relaxed mt-1">
                    As you practice conversations and complete course units, Yoe automatically captures your weak grammar patterns and new words here for spaced repetition.
                  </p>
                </div>
                <div className="flex gap-2 justify-center pt-1">
                  <button
                    onClick={() => setActiveTab('course')}
                    className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-bold text-xs shadow-md cursor-pointer hover:opacity-95"
                  >
                    Start First Lesson
                  </button>
                  <button
                    onClick={() => setActiveView('explore')}
                    className="px-3.5 py-2 rounded-xl glass-pill text-slate-200 dark:text-slate-200 light-mode:text-slate-800 border border-white/10 dark:border-white/10 light-mode:border-slate-200 text-xs font-bold hover:border-emerald-500/40 cursor-pointer"
                  >
                    Practice Speaking
                  </button>
                </div>
              </div>
            ) : (
              <>
                {/* Recent Mistakes List to Review */}
                {mistakes.length > 0 && (
                  <div className="space-y-2 pt-1">
                    <h4 className="text-xs font-bold text-slate-300 dark:text-slate-300 light-mode:text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                      <Target className="w-3.5 h-3.5 text-amber-400 dark:text-amber-400 light-mode:text-amber-600" />
                      <span>Grammar Patterns to Recast</span>
                    </h4>
                    <div className="space-y-2">
                      {mistakes.slice(0, 4).map((m) => {
                        const isMistakeLoading = loadingAudioId === m.id;
                        const isMistakePlaying = playingMessageId === m.id && isSpeaking;

                        return (
                          <div key={m.id} className="p-3 rounded-2xl glass-pill space-y-1 text-xs border border-white/10 dark:border-white/10 light-mode:border-slate-200 light-mode:bg-slate-50/80">
                            <div className="flex items-center justify-between">
                              <span className="font-bold text-amber-400 dark:text-amber-400 light-mode:text-amber-700 uppercase text-[10px]">{m.pattern}</span>
                              <button
                                disabled={isMistakeLoading}
                                onClick={() => replayMessage(m.id, m.correctedForm)}
                                className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                                  isMistakePlaying ? 'text-emerald-400 dark:text-emerald-400 light-mode:text-emerald-700 animate-pulse bg-emerald-500/20' : 'text-slate-400 dark:text-slate-400 light-mode:text-slate-600 hover:text-emerald-400'
                                }`}
                                title="Listen"
                              >
                                {isMistakeLoading ? (
                                  <div className="w-3.5 h-3.5 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
                                ) : (
                                  <Volume2 className={`w-3.5 h-3.5 ${isMistakePlaying ? 'stroke-[2.5]' : ''}`} />
                                )}
                              </button>
                            </div>
                            <div className="text-slate-300 dark:text-slate-300 light-mode:text-slate-800">
                              <span className="line-through text-red-300/70 dark:text-red-300/70 light-mode:text-red-600 mr-1.5">{m.exampleUserSaid}</span>
                              <span className="text-emerald-400 dark:text-emerald-400 light-mode:text-emerald-700 font-bold">→ {m.correctedForm}</span>
                            </div>
                            <p className="text-[10px] text-slate-400 dark:text-slate-400 light-mode:text-slate-600">{m.explanation}</p>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Vocabulary Items to Hear */}
                {vocabulary.length > 0 && (
                  <div className="space-y-2 pt-1">
                    <h4 className="text-xs font-bold text-slate-300 dark:text-slate-300 light-mode:text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                      <BookOpen className="w-3.5 h-3.5 text-emerald-400 dark:text-emerald-400 light-mode:text-emerald-700" />
                      <span>Vocabulary Bank to Recall</span>
                    </h4>
                    <div className="grid grid-cols-2 gap-2">
                      {vocabulary.slice(0, 6).map((v) => {
                        const isVocabLoading = loadingAudioId === v.id;
                        const isVocabPlaying = playingMessageId === v.id && isSpeaking;

                        return (
                          <div
                            key={v.id}
                            onClick={() => replayMessage(v.id, v.word)}
                            className={`p-2.5 rounded-xl glass-pill cursor-pointer transition-colors flex items-center justify-between group border border-white/10 dark:border-white/10 light-mode:border-slate-200 light-mode:bg-slate-50/80 ${
                              isVocabPlaying ? 'border-emerald-500/60 bg-emerald-500/10' : 'hover:border-emerald-500/40'
                            }`}
                          >
                            <div className="min-w-0 pr-1">
                              <div className="font-bold text-xs text-slate-100 dark:text-slate-100 light-mode:text-slate-900 truncate">{v.word}</div>
                              <div className="text-[10px] text-slate-400 dark:text-slate-400 light-mode:text-slate-600 truncate">{v.translation}</div>
                            </div>
                            {isVocabLoading ? (
                              <div className="w-3.5 h-3.5 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin shrink-0" />
                            ) : (
                              <Volume2 className={`w-3.5 h-3.5 shrink-0 ${
                                isVocabPlaying ? 'text-emerald-400 dark:text-emerald-400 light-mode:text-emerald-700 animate-pulse stroke-[2.5]' : 'text-slate-400 dark:text-slate-400 light-mode:text-slate-600 group-hover:text-emerald-400'
                              }`} />
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      )}

      {activeTab === 'course' && (
        <div className="space-y-4 animate-in fade-in duration-200">

          {/* Unit Roadmap Banner */}
          {units.map((unit) => {
            const completedCount = unit.lessons.filter(l => completedLessonIds[l.id]).length;
            const progressPercent = Math.round((completedCount / unit.lessons.length) * 100);

            return (
              <div key={unit.id} className="glass-card rounded-3xl p-5 shadow-xl space-y-4 relative overflow-hidden">
                {/* Unit Header */}
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-emerald-500/15 border border-emerald-500/25 flex items-center justify-center text-2xl shadow-md">
                      {unit.icon}
                    </div>
                    <div>
                      <div className="text-[10px] font-extrabold uppercase tracking-widest text-emerald-400 flex items-center gap-2">
                        <span>Unit {unit.unitNumber}</span>
                        <span className="px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-300 text-[9px]">
                          {unit.cefrLevel}
                        </span>
                      </div>
                      <h2 className="text-base font-black text-slate-100 dark:text-slate-100 light-mode:text-slate-900 tracking-tight">
                        {unit.title}
                      </h2>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="text-xs font-black text-emerald-400">{progressPercent}%</div>
                    <div className="text-[9px] text-slate-400">{completedCount}/{unit.lessons.length} done</div>
                  </div>
                </div>

                <p className="text-xs text-slate-400 dark:text-slate-400 light-mode:text-slate-600 leading-relaxed">
                  {unit.subtitle}
                </p>

                {/* Progress Bar */}
                <div className="w-full bg-slate-900/60 dark:bg-slate-900/60 light-mode:bg-slate-200 h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-emerald-400 to-teal-400 h-full rounded-full transition-all duration-500"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>

                {/* Lesson Stack */}
                <div className="space-y-2 pt-1">
                  {unit.lessons.map((lesson, idx) => {
                    const isDone = completedLessonIds[lesson.id];
                    const isSpeakingType = lesson.type === 'speaking';

                    return (
                      <div
                        key={lesson.id}
                        onClick={() => handleOpenLesson(lesson)}
                        className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
                          isDone
                            ? 'bg-emerald-500/10 border-emerald-500/30 hover:border-emerald-500/50'
                            : isSpeakingType
                            ? 'bg-gradient-to-r from-emerald-500/15 via-teal-500/10 to-transparent border-emerald-500/30 hover:border-emerald-500/50'
                            : 'glass-pill hover:border-emerald-500/40 hover:bg-white/5'
                        }`}
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 text-xs font-bold ${
                            isDone
                              ? 'bg-emerald-500 text-slate-950 shadow-md'
                              : 'bg-slate-800 text-slate-300 border border-white/10'
                          }`}>
                            {isDone ? <Check className="w-4 h-4 stroke-[3]" /> : idx + 1}
                          </div>

                          <div className="min-w-0">
                            <div className="flex items-center gap-1.5">
                              <span className="text-xs font-bold text-slate-100 dark:text-slate-100 light-mode:text-slate-900 truncate">
                                {lesson.title}
                              </span>
                              {isSpeakingType && (
                                <span className="px-1.5 py-0.2 rounded-full bg-emerald-500/20 text-emerald-400 text-[9px] font-black uppercase">
                                  Voice
                                </span>
                              )}
                            </div>
                            <div className="text-[10px] text-slate-400 dark:text-slate-400 light-mode:text-slate-500 truncate">
                              {lesson.description}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          <span className="text-[10px] font-semibold text-amber-400 flex items-center gap-0.5">
                            <Zap className="w-3 h-3" />
                            <span>+{lesson.xpReward} XP</span>
                          </span>
                          <ChevronRight className="w-4 h-4 text-slate-400" />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* INTERACTIVE LESSON RUNNER MODAL */}
      {selectedLesson && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 dark:bg-slate-950/80 light-mode:bg-slate-900/40 backdrop-blur-md p-4 flex flex-col justify-center animate-in fade-in duration-200">
          <div className="max-w-md w-full mx-auto glass-card rounded-3xl p-6 shadow-2xl border border-white/15 dark:border-white/15 light-mode:border-slate-200 light-mode:bg-white space-y-4 my-auto relative">

            {/* Header */}
            <div className="flex items-center justify-between pb-2 border-b border-white/10 dark:border-white/10 light-mode:border-slate-200">
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 dark:text-emerald-400 light-mode:text-emerald-700 text-[10px] font-black uppercase">
                  {selectedLesson.type}
                </span>
                <span className="text-xs font-bold text-slate-300 dark:text-slate-300 light-mode:text-slate-800">
                  {selectedLesson.title}
                </span>
              </div>

              <button
                onClick={() => setSelectedLesson(null)}
                className="p-1 rounded-full text-slate-400 dark:text-slate-400 light-mode:text-slate-600 hover:text-white dark:hover:text-white light-mode:hover:text-slate-900 cursor-pointer"
                title="Close modal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* 1. THEORY LESSON */}
            {selectedLesson.type === 'theory' && selectedLesson.theoryContent && (
              <div className="space-y-4 text-xs">
                <div className="p-3.5 rounded-2xl bg-emerald-500/10 dark:bg-emerald-500/10 light-mode:bg-emerald-50/90 border border-emerald-500/25 dark:border-emerald-500/25 light-mode:border-emerald-200">
                  <h4 className="font-black text-sm text-emerald-400 dark:text-emerald-400 light-mode:text-emerald-800 mb-1">
                    {selectedLesson.theoryContent.concept}
                  </h4>
                  <p className="text-slate-200 dark:text-slate-200 light-mode:text-slate-700 leading-relaxed font-normal">
                    {selectedLesson.theoryContent.explanation}
                  </p>
                </div>

                <div className="space-y-2">
                  <span className="font-bold text-[11px] text-slate-400 dark:text-slate-400 light-mode:text-slate-600 uppercase tracking-wider">
                    Interactive Examples
                  </span>
                  {selectedLesson.theoryContent.examples.map((ex, i) => {
                    const msgKey = `theory_${selectedLesson.id}_${i}`;
                    const isMsgPlaying = playingMessageId === msgKey && isSpeaking;
                    const isMsgLoading = loadingAudioId === msgKey;
                    const isMsgError = replayErrorId === msgKey;

                    return (
                      <div
                        key={i}
                        className="p-3 rounded-2xl glass-pill flex items-center justify-between gap-2 border border-white/10 dark:border-white/10 light-mode:border-slate-200 light-mode:bg-slate-50/80"
                      >
                        <div className="min-w-0 pr-2">
                          <div className="font-bold text-slate-100 dark:text-slate-100 light-mode:text-slate-900 text-xs">{ex.original}</div>
                          <div className="text-[11px] text-slate-400 dark:text-slate-400 light-mode:text-slate-600 mt-0.5">{ex.translation}</div>
                        </div>
                        <button
                          type="button"
                          disabled={isMsgLoading}
                          onClick={() => replayMessage(msgKey, ex.original)}
                          className={`p-2 rounded-xl transition-colors cursor-pointer shrink-0 ${
                            isMsgPlaying
                              ? 'bg-emerald-500/25 text-emerald-400 dark:text-emerald-400 light-mode:text-emerald-700 animate-pulse'
                              : isMsgLoading
                              ? 'bg-emerald-500/20 text-emerald-400 dark:text-emerald-400 light-mode:text-emerald-700'
                              : isMsgError
                              ? 'bg-red-500/20 text-red-400 dark:text-red-400 light-mode:text-red-600'
                              : 'bg-emerald-500/15 dark:bg-emerald-500/15 light-mode:bg-emerald-100/90 text-emerald-400 dark:text-emerald-400 light-mode:text-emerald-700 hover:bg-emerald-500/25 light-mode:hover:bg-emerald-200'
                          }`}
                          title={isMsgPlaying ? 'Stop playback' : isMsgLoading ? 'Loading audio...' : 'Listen'}
                        >
                          {isMsgLoading ? (
                            <div className="w-4 h-4 border-2 border-emerald-500 dark:border-emerald-400 light-mode:border-emerald-600 border-t-transparent rounded-full animate-spin" />
                          ) : (
                            <Volume2 className={`w-4 h-4 ${isMsgPlaying ? 'stroke-[2.5]' : ''}`} />
                          )}
                        </button>
                      </div>
                    );
                  })}
                </div>

                <div className="p-3 rounded-2xl bg-slate-900/50 dark:bg-slate-900/50 light-mode:bg-slate-100 border border-white/10 dark:border-white/10 light-mode:border-slate-200 text-slate-300 dark:text-slate-300 light-mode:text-slate-700">
                  <span className="font-bold text-emerald-400 dark:text-emerald-400 light-mode:text-emerald-700">Takeaway: </span>
                  <span className="font-normal">{selectedLesson.theoryContent.keyTakeaway}</span>
                </div>

                <button
                  onClick={() => handleCompleteLesson(selectedLesson.id)}
                  className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-black text-xs flex items-center justify-center gap-2 shadow-lg cursor-pointer hover:opacity-95"
                >
                  <CheckCircle2 className="w-4 h-4 text-white" />
                  <span className="text-white font-bold">Mark Completed (+{selectedLesson.xpReward} XP)</span>
                </button>
              </div>
            )}

            {/* 2. QUIZ / LISTENING LESSON */}
            {(selectedLesson.type === 'quiz' || selectedLesson.type === 'listening') && selectedLesson.quizQuestions && (
              <div className="space-y-4 text-xs">
                {(() => {
                  const q = selectedLesson.quizQuestions[currentQuizIndex];
                  if (!q) return null;
                  const quizMsgKey = `quiz_${selectedLesson.id}_${currentQuizIndex}`;
                  const isQuizLoading = loadingAudioId === quizMsgKey;
                  const isQuizPlaying = playingMessageId === quizMsgKey && isSpeaking;

                  return (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between text-[11px] text-slate-400 dark:text-slate-400 light-mode:text-slate-600">
                        <span>Question {currentQuizIndex + 1} of {selectedLesson.quizQuestions.length}</span>
                        <span className="text-amber-400 dark:text-amber-400 light-mode:text-amber-700 font-bold">Score: {quizScore}</span>
                      </div>

                      {q.audioText && (
                        <div className="p-4 rounded-2xl bg-cyan-500/10 dark:bg-cyan-500/10 light-mode:bg-cyan-50/90 border border-cyan-500/25 dark:border-cyan-500/25 light-mode:border-cyan-200 text-center space-y-2">
                          <button
                            type="button"
                            disabled={isQuizLoading}
                            onClick={() => replayMessage(quizMsgKey, q.audioText!)}
                            className={`py-2 px-4 rounded-xl text-white font-bold text-xs inline-flex items-center gap-2 shadow-md cursor-pointer hover:opacity-95 ${
                              isQuizPlaying
                                ? 'bg-cyan-600 animate-pulse'
                                : 'bg-cyan-500 dark:bg-cyan-500 light-mode:bg-cyan-600'
                            }`}
                          >
                            {isQuizLoading ? (
                              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            ) : (
                              <Volume2 className={`w-4 h-4 text-white ${isQuizPlaying ? 'stroke-[2.5]' : ''}`} />
                            )}
                            <span className="text-white">
                              {isQuizPlaying ? 'Stop playback' : isQuizLoading ? 'Loading Audio...' : 'Listen to Phrase'}
                            </span>
                          </button>
                        </div>
                      )}

                      <h4 className="text-sm font-bold text-slate-100 dark:text-slate-100 light-mode:text-slate-900">
                        {q.question}
                      </h4>

                      <div className="space-y-2">
                        {q.options?.map((opt, optIdx) => {
                          const isSelected = selectedOption === optIdx;
                          const isCorrect = optIdx === q.correctOptionIndex;

                          let btnClass = 'glass-pill text-slate-200 dark:text-slate-200 light-mode:text-slate-800 hover:border-emerald-500/40 light-mode:border-slate-200 light-mode:bg-slate-50/80';
                          if (isAnswerSubmitted) {
                            if (isCorrect) btnClass = 'bg-emerald-500/20 border-emerald-500 text-emerald-300 dark:text-emerald-300 light-mode:text-emerald-800 font-bold';
                            else if (isSelected) btnClass = 'bg-red-500/20 border-red-500 text-red-300 dark:text-red-300 light-mode:text-red-700';
                          } else if (isSelected) {
                            btnClass = 'bg-emerald-500/20 border-emerald-500 text-emerald-300 dark:text-emerald-300 light-mode:text-emerald-800 font-bold';
                          }

                          return (
                            <button
                              key={optIdx}
                              disabled={isAnswerSubmitted}
                              onClick={() => setSelectedOption(optIdx)}
                              className={`w-full p-3.5 rounded-2xl border text-left text-xs transition-all cursor-pointer flex items-center justify-between ${btnClass}`}
                            >
                              <span>{opt}</span>
                              {isAnswerSubmitted && isCorrect && <Check className="w-4 h-4 text-emerald-400 dark:text-emerald-400 light-mode:text-emerald-700" />}
                              {isAnswerSubmitted && isSelected && !isCorrect && <X className="w-4 h-4 text-red-400 dark:text-red-400 light-mode:text-red-600" />}
                            </button>
                          );
                        })}
                      </div>

                      {isAnswerSubmitted && (
                        <div className="p-3 rounded-2xl bg-emerald-500/10 dark:bg-emerald-500/10 light-mode:bg-emerald-50 border border-emerald-500/25 dark:border-emerald-500/25 light-mode:border-emerald-200 text-[11px] text-slate-200 dark:text-slate-200 light-mode:text-slate-700">
                          {q.explanation}
                        </div>
                      )}

                      {!isAnswerSubmitted ? (
                        <button
                          disabled={selectedOption === null}
                          onClick={() => {
                            setIsAnswerSubmitted(true);
                            if (selectedOption === q.correctOptionIndex) {
                              setQuizScore(prev => prev + 1);
                              playFeedbackSound('success');
                            } else {
                              playFeedbackSound('stop');
                            }
                          }}
                          className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-black text-xs disabled:opacity-40 cursor-pointer shadow-md"
                        >
                          Check Answer
                        </button>
                      ) : (
                        <button
                          onClick={() => {
                            if (currentQuizIndex + 1 < selectedLesson.quizQuestions!.length) {
                              setCurrentQuizIndex(prev => prev + 1);
                              setSelectedOption(null);
                              setIsAnswerSubmitted(false);
                            } else {
                              handleCompleteLesson(selectedLesson.id);
                            }
                          }}
                          className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-black text-xs cursor-pointer shadow-md flex items-center justify-center gap-2"
                        >
                          <span className="text-white font-bold">{currentQuizIndex + 1 < selectedLesson.quizQuestions!.length ? 'Next Question' : 'Complete Quiz'}</span>
                          <ArrowRight className="w-4 h-4 text-white" />
                        </button>
                      )}
                    </div>
                  );
                })()}
              </div>
            )}

            {/* 3. VOCABULARY MATCH MINI GAME */}
            {selectedLesson.type === 'vocabulary' && selectedLesson.miniGameData && (
              <div className="space-y-4 text-xs">
                <div className="text-center space-y-1">
                  <h4 className="font-bold text-sm text-slate-100 dark:text-slate-100 light-mode:text-slate-900">Match Vocabulary Pairs</h4>
                  <p className="text-[11px] text-slate-400 dark:text-slate-400 light-mode:text-slate-600">Tap a Spanish phrase then tap its English match</p>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  {selectedLesson.miniGameData.items?.map((item, idx) => {
                    const isMatched = !!matchedPairs[item.target];
                    const isSelected = selectedLeft === item.target;

                    return (
                      <React.Fragment key={idx}>
                        <button
                          disabled={isMatched}
                          onClick={() => setSelectedLeft(item.target)}
                          className={`p-3 rounded-2xl border text-center font-bold text-xs cursor-pointer transition-all ${
                            isMatched
                              ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-400 dark:text-emerald-400 light-mode:text-emerald-700 line-through opacity-60'
                              : isSelected
                              ? 'bg-emerald-500 text-white font-black shadow-md'
                              : 'glass-pill text-slate-200 dark:text-slate-200 light-mode:text-slate-800 light-mode:border-slate-200 light-mode:bg-slate-50/80'
                          }`}
                        >
                          {item.target}
                        </button>

                        <button
                          disabled={isMatched || !selectedLeft}
                          onClick={() => {
                            if (selectedLeft) {
                              const found = selectedLesson.miniGameData?.items?.find(it => it.target === selectedLeft);
                              if (found && found.match === item.match) {
                                setMatchedPairs(prev => ({ ...prev, [selectedLeft]: item.match }));
                                setSelectedLeft(null);
                                playFeedbackSound('success');
                              } else {
                                playFeedbackSound('stop');
                              }
                            }
                          }}
                          className={`p-3 rounded-2xl border text-center font-bold text-xs cursor-pointer transition-all ${
                            isMatched
                              ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-400 dark:text-emerald-400 light-mode:text-emerald-700 line-through opacity-60'
                              : 'glass-pill text-slate-200 dark:text-slate-200 light-mode:text-slate-800 light-mode:border-slate-200 light-mode:bg-slate-50/80'
                          }`}
                        >
                          {item.match}
                        </button>
                      </React.Fragment>
                    );
                  })}
                </div>

                {Object.keys(matchedPairs).length === (selectedLesson.miniGameData.items?.length || 0) && (
                  <button
                    onClick={() => handleCompleteLesson(selectedLesson.id)}
                    className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-black text-xs shadow-lg cursor-pointer flex items-center justify-center gap-2"
                  >
                    <CheckCircle2 className="w-4 h-4 text-white" />
                    <span className="text-white font-bold">Great Job! Claim +{selectedLesson.xpReward} XP</span>
                  </button>
                )}
              </div>
            )}

            {/* 4. SENTENCE BUILDER MINI GAME */}
            {selectedLesson.type === 'mini_game' && selectedLesson.miniGameData && (
              <div className="space-y-4 text-xs">
                <div className="text-center space-y-1">
                  <h4 className="font-bold text-sm text-slate-100 dark:text-slate-100 light-mode:text-slate-900">Construct the Sentence</h4>
                  <p className="text-[11px] text-emerald-400 dark:text-emerald-400 light-mode:text-emerald-700 font-bold">"{selectedLesson.miniGameData.sentenceTranslation}"</p>
                </div>

                {/* Built Sentence Slot */}
                <div className="min-h-[50px] p-3 rounded-2xl bg-slate-900/60 dark:bg-slate-900/60 light-mode:bg-slate-100 border border-white/10 dark:border-white/10 light-mode:border-slate-200 flex flex-wrap gap-2 items-center">
                  {builtSentence.map((w, i) => (
                    <button
                      key={i}
                      onClick={() => setBuiltSentence(prev => prev.filter((_, idx) => idx !== i))}
                      className="px-3 py-1.5 rounded-xl bg-emerald-500 text-white font-bold text-xs cursor-pointer shadow-sm"
                    >
                      {w}
                    </button>
                  ))}
                  {builtSentence.length === 0 && (
                    <span className="text-[11px] text-slate-500 dark:text-slate-500 light-mode:text-slate-600 italic">Tap words below to place them in order...</span>
                  )}
                </div>

                {/* Word Bank */}
                <div className="flex flex-wrap gap-2 justify-center pt-2">
                  {selectedLesson.miniGameData.wordsPool?.map((word, idx) => (
                    <button
                      key={idx}
                      onClick={() => setBuiltSentence(prev => [...prev, word])}
                      className="px-3 py-2 rounded-xl glass-pill text-xs font-bold text-slate-200 dark:text-slate-200 light-mode:text-slate-800 light-mode:border-slate-200 light-mode:bg-slate-50/80 hover:border-emerald-500/40 cursor-pointer"
                    >
                      {word}
                    </button>
                  ))}
                </div>

                <button
                  onClick={() => {
                    const sentenceStr = builtSentence.join(' ');
                    if (sentenceStr === selectedLesson.miniGameData?.targetSentence) {
                      handleCompleteLesson(selectedLesson.id);
                    } else {
                      playFeedbackSound('stop');
                    }
                  }}
                  className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-black text-xs cursor-pointer shadow-md hover:opacity-95"
                >
                  Verify Sentence
                </button>
              </div>
            )}

            {/* 5. REVIEW LESSON */}
            {selectedLesson.type === 'review' && (
              <div className="space-y-4 text-xs">
                <div className="p-4 rounded-2xl bg-emerald-500/10 dark:bg-emerald-500/10 light-mode:bg-emerald-50 border border-emerald-500/25 dark:border-emerald-500/25 light-mode:border-emerald-200 text-center space-y-2">
                  <Award className="w-8 h-8 text-emerald-400 dark:text-emerald-400 light-mode:text-emerald-700 mx-auto" />
                  <h4 className="font-black text-sm text-slate-100 dark:text-slate-100 light-mode:text-slate-900">Unit Review Completed</h4>
                  <p className="text-slate-300 dark:text-slate-300 light-mode:text-slate-700 text-[11px]">
                    You've practiced all core concepts, vocabulary, and grammar in this unit.
                  </p>
                </div>
                <button
                  onClick={() => handleCompleteLesson(selectedLesson.id)}
                  className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-black text-xs cursor-pointer shadow-md hover:opacity-95"
                >
                  Complete Review (+{selectedLesson.xpReward} XP)
                </button>
              </div>
            )}

          </div>
        </div>
      )}

    </div>
  );
};
