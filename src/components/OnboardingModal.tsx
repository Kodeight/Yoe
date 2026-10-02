import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { SUPPORTED_LANGUAGES } from '../constants/languages';
import { LanguageCode } from '../types';
import { YoeLogo } from './YoeLogo';
import { ArrowRight, Check, Sparkles, CheckCircle2 } from 'lucide-react';

export const OnboardingModal: React.FC = () => {
  const { createNewJourney, dismissOnboarding } = useApp();

  const [step, setStep] = useState<number>(1);
  const [targetLang, setTargetLang] = useState<LanguageCode>('es');
  const [supportLang, setSupportLang] = useState<LanguageCode>('en');
  const [experience, setExperience] = useState<string>('A1');
  const [motivation, setMotivation] = useState<string>('travel');
  const [answers, setAnswers] = useState<string[]>(['', '', '']);
  const [isCalibrating, setIsCalibrating] = useState<boolean>(false);
  const [calibrationResult, setCalibrationResult] = useState<any>(null);

  const handleNextStep = async () => {
    if (step === 5) {
      // Trigger AI calibration baseline
      setIsCalibrating(true);
      setStep(6);
      try {
        const res = await fetch('/api/ai/calibrate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            targetLanguage: targetLang,
            supportLanguage: supportLang,
            experienceLevel: experience,
            motivation,
            answers
          })
        });
        const data = await res.json();
        setCalibrationResult(data);
      } catch (e) {
        console.error('Calibration error:', e);
      } finally {
        setIsCalibrating(false);
      }
      return;
    }

    if (step === 6) {
      // Complete onboarding and create journey
      await createNewJourney(targetLang, supportLang, calibrationResult?.estimatedCefrLevel || experience || 'A1');
      dismissOnboarding();
      return;
    }

    setStep(prev => prev + 1);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xl flex items-center justify-center p-4">
      <div className="w-full max-w-md glass-card rounded-3xl p-6 shadow-2xl relative overflow-hidden text-slate-100 dark:text-slate-100 light-mode:text-slate-900 animate-in zoom-in-95 duration-200 flex flex-col max-h-[92dvh]">

        {/* Top Progress Indicator */}
        <div className="flex items-center justify-between mb-5 shrink-0">
          <YoeLogo size="sm" />
          <div className="flex items-center gap-1.5">
            {[1, 2, 3, 4, 5, 6].map((s) => (
              <div
                key={s}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  s === step
                    ? 'w-6 bg-gradient-to-r from-emerald-400 to-teal-400'
                    : s < step
                    ? 'w-2 bg-emerald-500/50'
                    : 'w-2 bg-slate-700/60 dark:bg-slate-700/60 light-mode:bg-slate-300'
                }`}
              />
            ))}
          </div>
        </div>

        {/* Scrollable Step Content Container */}
        <div className="flex-1 overflow-y-auto pr-1 no-scrollbar space-y-4">

          {/* Step 1: Target Language Selection (Large Mobile-Friendly Cards) */}
          {step === 1 && (
            <div className="space-y-3">
              <div>
                <span className="text-[10px] font-extrabold text-emerald-400 uppercase tracking-widest block mb-0.5">
                  Step 1 of 5
                </span>
                <h2 className="text-lg font-black text-slate-100 dark:text-slate-100 light-mode:text-slate-900">
                  What language do you want to speak?
                </h2>
                <p className="text-xs text-slate-400 dark:text-slate-400 light-mode:text-slate-500">
                  Select the primary language you want to practice:
                </p>
              </div>

              <div className="space-y-2">
                {SUPPORTED_LANGUAGES.map((lang) => {
                  const isSelected = targetLang === lang.code;
                  return (
                    <button
                      key={lang.code}
                      type="button"
                      onClick={() => setTargetLang(lang.code)}
                      className={`w-full p-4 rounded-2xl border text-left flex items-center justify-between transition-all cursor-pointer ${
                        isSelected
                          ? 'border-emerald-400 bg-emerald-500/15 text-slate-100 dark:text-slate-100 light-mode:text-slate-900 shadow-md ring-1 ring-emerald-400/40'
                          : 'glass-pill text-slate-300 dark:text-slate-300 light-mode:text-slate-700 hover:border-emerald-500/30'
                      }`}
                    >
                      <div className="flex items-center gap-3.5">
                        <span className="text-2xl">{lang.flag}</span>
                        <div>
                          <div className="text-sm font-bold text-slate-100 dark:text-slate-100 light-mode:text-slate-900">
                            {lang.name}
                          </div>
                          <div className="text-xs text-slate-400 dark:text-slate-400 light-mode:text-slate-500">
                            {lang.nativeName}
                          </div>
                        </div>
                      </div>

                      {isSelected && (
                        <div className="w-6 h-6 rounded-full bg-emerald-400 text-slate-950 flex items-center justify-center font-bold text-xs shadow-sm">
                          <Check className="w-3.5 h-3.5 stroke-[3]" />
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Step 2: Support / Explanation Language Selection */}
          {step === 2 && (
            <div className="space-y-3">
              <div>
                <span className="text-[10px] font-extrabold text-emerald-400 uppercase tracking-widest block mb-0.5">
                  Step 2 of 5
                </span>
                <h2 className="text-lg font-black text-slate-100 dark:text-slate-100 light-mode:text-slate-900">
                  Select your explanation language
                </h2>
                <p className="text-xs text-slate-400 dark:text-slate-400 light-mode:text-slate-500">
                  Yoe will explain grammar rules & vocabulary tips in this language:
                </p>
              </div>

              <div className="space-y-2">
                {SUPPORTED_LANGUAGES.map((lang) => {
                  const isSelected = supportLang === lang.code;
                  return (
                    <button
                      key={lang.code}
                      type="button"
                      onClick={() => setSupportLang(lang.code)}
                      className={`w-full p-4 rounded-2xl border text-left flex items-center justify-between transition-all cursor-pointer ${
                        isSelected
                          ? 'border-emerald-400 bg-emerald-500/15 text-slate-100 dark:text-slate-100 light-mode:text-slate-900 shadow-md ring-1 ring-emerald-400/40'
                          : 'glass-pill text-slate-300 dark:text-slate-300 light-mode:text-slate-700 hover:border-emerald-500/30'
                      }`}
                    >
                      <div className="flex items-center gap-3.5">
                        <span className="text-2xl">{lang.flag}</span>
                        <div>
                          <div className="text-sm font-bold text-slate-100 dark:text-slate-100 light-mode:text-slate-900">
                            {lang.name}
                          </div>
                          <div className="text-xs text-slate-400 dark:text-slate-400 light-mode:text-slate-500">
                            {lang.nativeName}
                          </div>
                        </div>
                      </div>

                      {isSelected && (
                        <div className="w-6 h-6 rounded-full bg-emerald-400 text-slate-950 flex items-center justify-center font-bold text-xs shadow-sm">
                          <Check className="w-3.5 h-3.5 stroke-[3]" />
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Step 3: Prior Experience Level */}
          {step === 3 && (
            <div className="space-y-3">
              <div>
                <span className="text-[10px] font-extrabold text-emerald-400 uppercase tracking-widest block mb-0.5">
                  Step 3 of 5
                </span>
                <h2 className="text-lg font-black text-slate-100 dark:text-slate-100 light-mode:text-slate-900">
                  How much experience do you have?
                </h2>
                <p className="text-xs text-slate-400 dark:text-slate-400 light-mode:text-slate-500">
                  This helps calibrate scenario difficulty and speaking speed:
                </p>
              </div>

              <div className="space-y-2.5">
                {[
                  { id: 'A1', title: 'Complete Beginner', desc: 'Just starting out, learning basic greetings and words' },
                  { id: 'A2', title: 'Elementary Communicator', desc: 'Can order food, introduce myself, and ask simple questions' },
                  { id: 'B1', title: 'Intermediate Speaker', desc: 'Can hold casual conversations and navigate routine situations' },
                  { id: 'B2', title: 'Upper Intermediate', desc: 'Can speak with spontaneous fluency on familiar topics' }
                ].map((exp) => {
                  const isSelected = experience === exp.id;
                  return (
                    <button
                      key={exp.id}
                      type="button"
                      onClick={() => setExperience(exp.id)}
                      className={`w-full p-4 rounded-2xl border text-left transition-all cursor-pointer flex items-center justify-between ${
                        isSelected
                          ? 'border-emerald-400 bg-emerald-500/15 text-slate-100 dark:text-slate-100 light-mode:text-slate-900 shadow-md ring-1 ring-emerald-400/40'
                          : 'glass-pill text-slate-300 dark:text-slate-300 light-mode:text-slate-700 hover:border-emerald-500/30'
                      }`}
                    >
                      <div>
                        <div className="text-sm font-bold text-emerald-400">{exp.title}</div>
                        <div className="text-xs text-slate-400 dark:text-slate-400 light-mode:text-slate-500 mt-0.5">{exp.desc}</div>
                      </div>

                      {isSelected && (
                        <div className="w-6 h-6 rounded-full bg-emerald-400 text-slate-950 flex items-center justify-center font-bold text-xs shrink-0 ml-2">
                          <Check className="w-3.5 h-3.5 stroke-[3]" />
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Step 4: Motivation & Goals */}
          {step === 4 && (
            <div className="space-y-3">
              <div>
                <span className="text-[10px] font-extrabold text-emerald-400 uppercase tracking-widest block mb-0.5">
                  Step 4 of 5
                </span>
                <h2 className="text-lg font-black text-slate-100 dark:text-slate-100 light-mode:text-slate-900">
                  What is your primary learning goal?
                </h2>
                <p className="text-xs text-slate-400 dark:text-slate-400 light-mode:text-slate-500">
                  We will prioritize scenario worlds matching your objective:
                </p>
              </div>

              <div className="space-y-2.5">
                {[
                  { id: 'travel', title: '✈️ Travel & Living Abroad', desc: 'Airports, hotel check-ins, local cafes, asking directions' },
                  { id: 'work', title: '💼 Career & Business', desc: 'Meetings, presentations, negotiations, networking' },
                  { id: 'conversation', title: '💬 Friendship & Social Connection', desc: 'Making friends, casual chatting, storytelling' },
                  { id: 'culture', title: '🎭 Culture, Movies & Hobbies', desc: 'Understanding cinema, literature, cuisine, and arts' }
                ].map((mot) => {
                  const isSelected = motivation === mot.id;
                  return (
                    <button
                      key={mot.id}
                      type="button"
                      onClick={() => setMotivation(mot.id)}
                      className={`w-full p-4 rounded-2xl border text-left transition-all cursor-pointer flex items-center justify-between ${
                        isSelected
                          ? 'border-emerald-400 bg-emerald-500/15 text-slate-100 dark:text-slate-100 light-mode:text-slate-900 shadow-md ring-1 ring-emerald-400/40'
                          : 'glass-pill text-slate-300 dark:text-slate-300 light-mode:text-slate-700 hover:border-emerald-500/30'
                      }`}
                    >
                      <div>
                        <div className="text-sm font-bold text-emerald-400">{mot.title}</div>
                        <div className="text-xs text-slate-400 dark:text-slate-400 light-mode:text-slate-500 mt-0.5">{mot.desc}</div>
                      </div>

                      {isSelected && (
                        <div className="w-6 h-6 rounded-full bg-emerald-400 text-slate-950 flex items-center justify-center font-bold text-xs shrink-0 ml-2">
                          <Check className="w-3.5 h-3.5 stroke-[3]" />
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Step 5: Quick Baseline Assessment */}
          {step === 5 && (
            <div className="space-y-3">
              <div>
                <span className="text-[10px] font-extrabold text-emerald-400 uppercase tracking-widest block mb-0.5">
                  Step 5 of 5
                </span>
                <h2 className="text-lg font-black text-slate-100 dark:text-slate-100 light-mode:text-slate-900">
                  Conversational Baseline
                </h2>
                <p className="text-xs text-slate-400 dark:text-slate-400 light-mode:text-slate-500">
                  Answer briefly (in target or support language) to tune your AI tutor:
                </p>
              </div>

              <div className="space-y-2.5">
                <div>
                  <label className="text-[11px] text-slate-300 dark:text-slate-300 light-mode:text-slate-700 font-semibold block mb-1">
                    1. How would you greet someone at a café?
                  </label>
                  <input
                    type="text"
                    value={answers[0]}
                    onChange={(e) => setAnswers([e.target.value, answers[1], answers[2]])}
                    placeholder="e.g. Hello, coffee please!"
                    className="w-full bg-slate-950/60 dark:bg-slate-950/60 light-mode:bg-white border border-white/10 dark:border-white/10 light-mode:border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-100 dark:text-slate-100 light-mode:text-slate-900 focus:outline-none focus:border-emerald-400"
                  />
                </div>

                <div>
                  <label className="text-[11px] text-slate-300 dark:text-slate-300 light-mode:text-slate-700 font-semibold block mb-1">
                    2. How do you ask for the bill / check?
                  </label>
                  <input
                    type="text"
                    value={answers[1]}
                    onChange={(e) => setAnswers([answers[0], e.target.value, answers[2]])}
                    placeholder="e.g. Can I have the bill please?"
                    className="w-full bg-slate-950/60 dark:bg-slate-950/60 light-mode:bg-white border border-white/10 dark:border-white/10 light-mode:border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-100 dark:text-slate-100 light-mode:text-slate-900 focus:outline-none focus:border-emerald-400"
                  />
                </div>

                <div>
                  <label className="text-[11px] text-slate-300 dark:text-slate-300 light-mode:text-slate-700 font-semibold block mb-1">
                    3. What is something you like doing in your free time?
                  </label>
                  <input
                    type="text"
                    value={answers[2]}
                    onChange={(e) => setAnswers([answers[0], answers[1], e.target.value])}
                    placeholder="e.g. I like exploring new cities"
                    className="w-full bg-slate-950/60 dark:bg-slate-950/60 light-mode:bg-white border border-white/10 dark:border-white/10 light-mode:border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-100 dark:text-slate-100 light-mode:text-slate-900 focus:outline-none focus:border-emerald-400"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Step 6: Calibration Results & Welcome to Journey */}
          {step === 6 && (
            <div className="text-center space-y-4 my-2">
              {isCalibrating ? (
                <div className="py-8 space-y-3">
                  <div className="w-10 h-10 border-3 border-emerald-400 border-t-transparent rounded-full animate-spin mx-auto" />
                  <p className="text-xs font-bold text-emerald-400">Yoe is calibrating your learning journey...</p>
                </div>
              ) : (
                <>
                  <div className="w-14 h-14 rounded-2xl bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 flex items-center justify-center mx-auto text-2xl shadow-lg">
                    <Sparkles className="w-7 h-7" />
                  </div>

                  <h2 className="text-xl font-black text-slate-100 dark:text-slate-100 light-mode:text-slate-900">
                    Your Learning Journey is Ready!
                  </h2>

                  <div className="glass-card p-4 rounded-2xl border border-white/10 text-left space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-400">Target Language:</span>
                      <span className="font-bold text-slate-100 dark:text-slate-100 light-mode:text-slate-900">
                        {SUPPORTED_LANGUAGES.find(l => l.code === targetLang)?.name}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-400">Calibrated Level:</span>
                      <span className="font-extrabold text-emerald-400 px-2 py-0.5 rounded bg-emerald-500/20">
                        Level {calibrationResult?.estimatedCefrLevel || experience || 'A1'}
                      </span>
                    </div>

                    <p className="font-brand font-semibold text-xs text-emerald-300 dark:text-emerald-300 light-mode:text-emerald-700 pt-2 border-t border-white/10 dark:border-white/10 light-mode:border-slate-200 leading-relaxed italic">
                      "{calibrationResult?.welcomeMessage || 'Welcome to Yoe! Let us begin our first scenario conversation.'}"
                    </p>
                  </div>
                </>
              )}
            </div>
          )}

        </div>

        {/* Bottom CTA Action Button */}
        <div className="mt-5 pt-3 border-t border-white/10 dark:border-white/10 light-mode:border-slate-200 shrink-0">
          <button
            type="button"
            onClick={handleNextStep}
            disabled={isCalibrating}
            className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-400 text-slate-950 font-black text-xs flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 hover:opacity-95 active:scale-98 transition-all cursor-pointer"
          >
            <span>{step === 6 ? 'Start Speaking with Yoe' : 'Continue'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

      </div>
    </div>
  );
};
