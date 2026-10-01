import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { SUPPORTED_LANGUAGES } from '../server/db';
import { LanguageCode } from '../types';
import { YoeLogo } from './YoeLogo';
import { YoeOrb } from './YoeOrb';
import { ArrowRight, Check, Sparkles, Compass } from 'lucide-react';

export const OnboardingModal: React.FC = () => {
  const { createNewJourney, dismissOnboarding } = useApp();

  const [step, setStep] = useState<number>(1);
  const [targetLang, setTargetLang] = useState<LanguageCode>('en');
  const [supportLang, setSupportLang] = useState<LanguageCode>('es');
  const [experience, setExperience] = useState<string>('A1');
  const [motivation, setMotivation] = useState<string>('travel');
  const [answers, setAnswers] = useState<string[]>(['', '', '']);
  const [isCalibrating, setIsCalibrating] = useState<boolean>(false);
  const [calibrationResult, setCalibrationResult] = useState<any>(null);

  const handleNextStep = async () => {
    if (step === 6) {
      // Trigger AI calibration
      setIsCalibrating(true);
      setStep(7);
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

    if (step === 7) {
      // Complete onboarding and create journey
      await createNewJourney(targetLang, supportLang, calibrationResult?.estimatedCefrLevel || experience || 'A1');
      dismissOnboarding();
      return;
    }

    setStep(prev => prev + 1);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xl flex items-center justify-center p-4">
      <div className="w-full max-w-md glass-card rounded-3xl p-6 shadow-2xl relative overflow-hidden text-slate-100 dark:text-slate-100 light-mode:text-slate-900 animate-in zoom-in-95 duration-200">

        {/* Top Progress Dots */}
        <div className="flex items-center justify-between mb-6">
          <YoeLogo size="sm" />
          <div className="flex items-center gap-1.5">
            {[1, 2, 3, 4, 5, 6, 7].map((s) => (
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

        {/* Step 1: Welcome */}
        {step === 1 && (
          <div className="text-center space-y-4 my-2">
            <YoeOrb size="sm" state="idle" />
            <h2 className="text-2xl font-black text-slate-100 dark:text-slate-100 light-mode:text-slate-900 tracking-tight">
              Welcome to Yoe
            </h2>
            <p className="text-xs text-slate-400 dark:text-slate-400 light-mode:text-slate-600 max-w-xs mx-auto leading-relaxed">
              Your AI-powered language companion. Enter realistic scenario worlds and learn by actually communicating!
            </p>
          </div>
        )}

        {/* Step 2: Target Language */}
        {step === 2 && (
          <div className="space-y-4">
            <div>
              <h2 className="text-lg font-bold text-slate-100 dark:text-slate-100 light-mode:text-slate-900">What language do you want to learn?</h2>
              <p className="text-xs text-slate-400 dark:text-slate-400 light-mode:text-slate-500">Select your primary target language:</p>
            </div>

            <div className="grid grid-cols-2 gap-2 max-h-60 overflow-y-auto pr-1 no-scrollbar">
              {SUPPORTED_LANGUAGES.map((lang) => (
                <button
                  key={lang.code}
                  onClick={() => setTargetLang(lang.code)}
                  className={`p-3 rounded-2xl border text-left flex items-center gap-2.5 transition-all cursor-pointer ${
                    targetLang === lang.code
                      ? 'border-emerald-400 bg-emerald-500/15 text-slate-100 dark:text-slate-100 light-mode:text-slate-900 font-bold shadow-md'
                      : 'border-white/10 dark:border-white/10 light-mode:border-slate-200 glass-pill text-slate-300 dark:text-slate-300 light-mode:text-slate-700 hover:border-emerald-500/30'
                  }`}
                >
                  <span className="text-xl">{lang.flag}</span>
                  <div>
                    <div className="text-xs font-semibold">{lang.name}</div>
                    <div className="text-[10px] text-slate-400 opacity-80">{lang.nativeName}</div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Step 3: Support Language */}
        {step === 3 && (
          <div className="space-y-4">
            <div>
              <h2 className="text-lg font-bold text-slate-100 dark:text-slate-100 light-mode:text-slate-900">Select explanation language</h2>
              <p className="text-xs text-slate-400 dark:text-slate-400 light-mode:text-slate-500">Yoe will use this language to provide tips & translations:</p>
            </div>

            <div className="grid grid-cols-2 gap-2 max-h-60 overflow-y-auto pr-1 no-scrollbar">
              {SUPPORTED_LANGUAGES.map((lang) => (
                <button
                  key={lang.code}
                  onClick={() => setSupportLang(lang.code)}
                  className={`p-3 rounded-2xl border text-left flex items-center gap-2.5 transition-all cursor-pointer ${
                    supportLang === lang.code
                      ? 'border-emerald-400 bg-emerald-500/15 text-slate-100 dark:text-slate-100 light-mode:text-slate-900 font-bold shadow-md'
                      : 'border-white/10 dark:border-white/10 light-mode:border-slate-200 glass-pill text-slate-300 dark:text-slate-300 light-mode:text-slate-700 hover:border-emerald-500/30'
                  }`}
                >
                  <span className="text-xl">{lang.flag}</span>
                  <div className="text-xs font-semibold">{lang.name}</div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Step 4: Prior Experience */}
        {step === 4 && (
          <div className="space-y-3.5">
            <h2 className="text-lg font-bold text-slate-100 dark:text-slate-100 light-mode:text-slate-900">How much experience do you have?</h2>

            {[
              { id: 'A1', title: 'Complete Beginner', desc: 'Just starting out, learning the alphabet and basic words' },
              { id: 'A2', title: 'Elementary', desc: 'Can introduce myself and handle simple routine interactions' },
              { id: 'B1', title: 'Intermediate', desc: 'Can hold casual conversations and describe experiences' },
              { id: 'B2', title: 'Upper Intermediate', desc: 'Can express opinions and speak with spontaneous fluency' }
            ].map((exp) => (
              <button
                key={exp.id}
                onClick={() => setExperience(exp.id)}
                className={`w-full p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                  experience === exp.id
                    ? 'border-emerald-400 bg-emerald-500/15 text-slate-100 dark:text-slate-100 light-mode:text-slate-900 font-bold'
                    : 'glass-pill text-slate-300 dark:text-slate-300 light-mode:text-slate-700 hover:border-emerald-500/30'
                }`}
              >
                <div className="text-xs font-bold text-emerald-400">{exp.title}</div>
                <div className="text-[11px] text-slate-400 dark:text-slate-400 light-mode:text-slate-500">{exp.desc}</div>
              </button>
            ))}
          </div>
        )}

        {/* Step 5: Motivation */}
        {step === 5 && (
          <div className="space-y-3.5">
            <h2 className="text-lg font-bold text-slate-100 dark:text-slate-100 light-mode:text-slate-900">What is your main learning motivation?</h2>

            {[
              { id: 'travel', title: '✈️ Travel & Living Abroad', desc: 'Navigating transport, ordering food, exploring places' },
              { id: 'work', title: '💼 Career & Professional Growth', desc: 'Meetings, networking, international collaboration' },
              { id: 'conversation', title: '💬 Friendship & Social', desc: 'Speaking naturally with locals and friends' },
              { id: 'culture', title: '🎭 Culture, Movies & Hobby', desc: 'Connecting deeply with literature, arts, and cinema' }
            ].map((mot) => (
              <button
                key={mot.id}
                onClick={() => setMotivation(mot.id)}
                className={`w-full p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                  motivation === mot.id
                    ? 'border-emerald-400 bg-emerald-500/15 text-slate-100 dark:text-slate-100 light-mode:text-slate-900 font-bold'
                    : 'glass-pill text-slate-300 dark:text-slate-300 light-mode:text-slate-700 hover:border-emerald-500/30'
                }`}
              >
                <div className="text-xs font-bold text-emerald-400">{mot.title}</div>
                <div className="text-[11px] text-slate-400 dark:text-slate-400 light-mode:text-slate-500">{mot.desc}</div>
              </button>
            ))}
          </div>
        )}

        {/* Step 6: Quick Playful Calibration */}
        {step === 6 && (
          <div className="space-y-3">
            <div>
              <h2 className="text-lg font-bold text-slate-100 dark:text-slate-100 light-mode:text-slate-900">Conversational Baseline</h2>
              <p className="text-xs text-slate-400 dark:text-slate-400 light-mode:text-slate-500">Provide quick answers to help Yoe tune speech pace:</p>
            </div>

            <div className="space-y-2">
              <div>
                <label className="text-[11px] text-slate-300 dark:text-slate-300 light-mode:text-slate-700 font-medium block mb-1">
                  1. How would you greet someone at a café?
                </label>
                <input
                  type="text"
                  value={answers[0]}
                  onChange={(e) => setAnswers([e.target.value, answers[1], answers[2]])}
                  placeholder="e.g. Hello, one coffee please!"
                  className="w-full bg-slate-950/60 dark:bg-slate-950/60 light-mode:bg-white border border-white/10 dark:border-white/10 light-mode:border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-100 dark:text-slate-100 light-mode:text-slate-900 focus:outline-none focus:border-emerald-400"
                />
              </div>

              <div>
                <label className="text-[11px] text-slate-300 dark:text-slate-300 light-mode:text-slate-700 font-medium block mb-1">
                  2. How do you ask for the check / bill?
                </label>
                <input
                  type="text"
                  value={answers[1]}
                  onChange={(e) => setAnswers([answers[0], e.target.value, answers[2]])}
                  placeholder="e.g. Could I have the bill please?"
                  className="w-full bg-slate-950/60 dark:bg-slate-950/60 light-mode:bg-white border border-white/10 dark:border-white/10 light-mode:border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-100 dark:text-slate-100 light-mode:text-slate-900 focus:outline-none focus:border-emerald-400"
                />
              </div>

              <div>
                <label className="text-[11px] text-slate-300 dark:text-slate-300 light-mode:text-slate-700 font-medium block mb-1">
                  3. What is something you like doing on weekends?
                </label>
                <input
                  type="text"
                  value={answers[2]}
                  onChange={(e) => setAnswers([answers[0], answers[1], e.target.value])}
                  placeholder="e.g. I enjoy cooking and going for walks"
                  className="w-full bg-slate-950/60 dark:bg-slate-950/60 light-mode:bg-white border border-white/10 dark:border-white/10 light-mode:border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-100 dark:text-slate-100 light-mode:text-slate-900 focus:outline-none focus:border-emerald-400"
                />
              </div>
            </div>
          </div>
        )}

        {/* Step 7: Calibration Results & Welcome */}
        {step === 7 && (
          <div className="text-center space-y-4 my-2">
            {isCalibrating ? (
              <div className="py-8 space-y-3">
                <YoeOrb size="sm" state="thinking" />
                <p className="text-xs font-bold text-emerald-400">Yoe is personalizing your scenario journey...</p>
              </div>
            ) : (
              <>
                <div className="w-14 h-14 rounded-2xl bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 flex items-center justify-center mx-auto text-2xl shadow-lg">
                  <Sparkles className="w-7 h-7" />
                </div>

                <h2 className="text-xl font-black text-slate-100 dark:text-slate-100 light-mode:text-slate-900">Your Journey is Ready!</h2>

                <div className="glass-card p-4 rounded-2xl border border-white/10 text-left space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-400">Calibrated Starting Level:</span>
                    <span className="font-extrabold text-emerald-400 px-2 py-0.5 rounded bg-emerald-500/20">
                      Level {calibrationResult?.estimatedCefrLevel || experience || 'A1'}
                    </span>
                  </div>

                  <p className="text-xs text-slate-300 dark:text-slate-300 light-mode:text-slate-700 italic pt-2 border-t border-white/10 dark:border-white/10 light-mode:border-slate-200">
                    "{calibrationResult?.welcomeMessage || 'Welcome! Let us start communicating right now.'}"
                  </p>
                </div>
              </>
            )}
          </div>
        )}

        {/* Bottom CTA Action Button */}
        <div className="mt-6">
          <button
            onClick={handleNextStep}
            disabled={isCalibrating}
            className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-400 text-slate-950 font-black text-xs flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 hover:opacity-95 active:scale-98 transition-all cursor-pointer"
          >
            <span>{step === 7 ? 'Start Speaking with Yoe' : 'Continue'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

      </div>
    </div>
  );
};
