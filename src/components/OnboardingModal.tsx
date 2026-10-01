import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { SUPPORTED_LANGUAGES } from '../server/db';
import { LanguageCode } from '../types';
import { YoeLogo } from './YoeLogo';
import { YoeOrb } from './YoeOrb';
import { ArrowRight, Check, Sparkles } from 'lucide-react';

export const OnboardingModal: React.FC = () => {
  const { createNewJourney, dismissOnboarding } = useApp();

  const [step, setStep] = useState<number>(1);
  const [targetLang, setTargetLang] = useState<LanguageCode>('en');
  const [supportLang, setSupportLang] = useState<LanguageCode>('es');
  const [experience, setExperience] = useState<string>('beginner');
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
        setCalibrationResult(data.result);
      } catch (e) {
        console.error('Calibration error:', e);
      } finally {
        setIsCalibrating(false);
      }
      return;
    }

    if (step === 7) {
      // Complete onboarding and create journey
      await createNewJourney(targetLang, supportLang, calibrationResult?.estimatedCefrLevel || 'A1');
      dismissOnboarding();
      return;
    }

    setStep(prev => prev + 1);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-2xl flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-slate-900 border border-white/10 rounded-3xl p-6 shadow-2xl relative overflow-hidden text-slate-100">

        {/* Top Progress Dots */}
        <div className="flex items-center justify-between mb-6">
          <YoeLogo size="sm" />
          <div className="flex items-center gap-1">
            {[1, 2, 3, 4, 5, 6, 7].map((s) => (
              <div
                key={s}
                className={`w-2 h-2 rounded-full transition-all ${
                  s === step ? 'w-5 bg-emerald-400' : s < step ? 'bg-emerald-500/50' : 'bg-slate-800'
                }`}
              />
            ))}
          </div>
        </div>

        {/* Step 1: Welcome */}
        {step === 1 && (
          <div className="text-center space-y-4 my-2">
            <YoeOrb size="sm" />
            <h2 className="text-2xl font-black text-white tracking-tight">
              Welcome to Yoe
            </h2>
            <p className="text-xs text-slate-400 max-w-xs mx-auto leading-relaxed">
              Your AI-powered language companion. Enter realistic scenario worlds and learn by actually communicating!
            </p>
          </div>
        )}

        {/* Step 2: Target Language */}
        {step === 2 && (
          <div className="space-y-4">
            <h2 className="text-lg font-bold text-white">What language do you want to learn?</h2>
            <p className="text-xs text-slate-400">Select your primary target language:</p>

            <div className="grid grid-cols-2 gap-2.5 max-h-60 overflow-y-auto pr-1">
              {SUPPORTED_LANGUAGES.map((lang) => (
                <button
                  key={lang.code}
                  onClick={() => setTargetLang(lang.code)}
                  className={`p-3 rounded-2xl border text-left flex items-center gap-2.5 transition-all cursor-pointer ${
                    targetLang === lang.code
                      ? 'border-emerald-400 bg-emerald-500/10 text-white font-bold'
                      : 'border-white/10 bg-slate-950/60 text-slate-300 hover:border-emerald-500/30'
                  }`}
                >
                  <span className="text-xl">{lang.flag}</span>
                  <div>
                    <div className="text-xs">{lang.name}</div>
                    <div className="text-[10px] text-slate-500">{lang.nativeName}</div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Step 3: Support Language */}
        {step === 3 && (
          <div className="space-y-4">
            <h2 className="text-lg font-bold text-white">Select your explanation language</h2>
            <p className="text-xs text-slate-400">Yoe will use this language to explain grammar tips & translations:</p>

            <div className="grid grid-cols-2 gap-2.5 max-h-60 overflow-y-auto pr-1">
              {SUPPORTED_LANGUAGES.map((lang) => (
                <button
                  key={lang.code}
                  onClick={() => setSupportLang(lang.code)}
                  className={`p-3 rounded-2xl border text-left flex items-center gap-2.5 transition-all cursor-pointer ${
                    supportLang === lang.code
                      ? 'border-emerald-400 bg-emerald-500/10 text-white font-bold'
                      : 'border-white/10 bg-slate-950/60 text-slate-300 hover:border-emerald-500/30'
                  }`}
                >
                  <span className="text-xl">{lang.flag}</span>
                  <div className="text-xs">{lang.name}</div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Step 4: Prior Experience */}
        {step === 4 && (
          <div className="space-y-4">
            <h2 className="text-lg font-bold text-white">How much experience do you have?</h2>

            {[
              { id: 'A1', title: 'Complete Beginner', desc: 'Just starting out, know a few words' },
              { id: 'A2', title: 'Elementary', desc: 'Can introduce myself and order food' },
              { id: 'B1', title: 'Intermediate', desc: 'Can hold basic routine conversations' },
              { id: 'B2', title: 'Upper Intermediate', desc: 'Can express opinions and speak fluently' }
            ].map((exp) => (
              <button
                key={exp.id}
                onClick={() => setExperience(exp.id)}
                className={`w-full p-3.5 rounded-2xl border text-left transition-all cursor-pointer ${
                  experience === exp.id
                    ? 'border-emerald-400 bg-emerald-500/10 text-white'
                    : 'border-white/10 bg-slate-950/60 text-slate-300 hover:border-emerald-500/30'
                }`}
              >
                <div className="text-xs font-bold text-emerald-400">{exp.title}</div>
                <div className="text-[11px] text-slate-400">{exp.desc}</div>
              </button>
            ))}
          </div>
        )}

        {/* Step 5: Motivation */}
        {step === 5 && (
          <div className="space-y-4">
            <h2 className="text-lg font-bold text-white">What is your main learning goal?</h2>

            {[
              { id: 'travel', title: '✈️ Travel & Exploration', desc: 'Navigating airports, hotels, and local markets' },
              { id: 'work', title: '💼 Career & Business', desc: 'Meetings, interviews, and professional network' },
              { id: 'conversation', title: '💬 Social & Friendship', desc: 'Making friends and chatting naturally' },
              { id: 'culture', title: '🎭 Culture & Hobby', desc: 'Enjoying movies, literature, and culture' }
            ].map((mot) => (
              <button
                key={mot.id}
                onClick={() => setMotivation(mot.id)}
                className={`w-full p-3.5 rounded-2xl border text-left transition-all cursor-pointer ${
                  motivation === mot.id
                    ? 'border-emerald-400 bg-emerald-500/10 text-white'
                    : 'border-white/10 bg-slate-950/60 text-slate-300 hover:border-emerald-500/30'
                }`}
              >
                <div className="text-xs font-bold text-emerald-400">{mot.title}</div>
                <div className="text-[11px] text-slate-400">{mot.desc}</div>
              </button>
            ))}
          </div>
        )}

        {/* Step 6: Quick Playful Calibration */}
        {step === 6 && (
          <div className="space-y-3">
            <h2 className="text-lg font-bold text-white">Playful Level Calibration</h2>
            <p className="text-xs text-slate-400">Answer in any language (or write a quick sentence):</p>

            <div className="space-y-2">
              <div>
                <label className="text-[11px] text-slate-300 font-medium block mb-1">
                  1. How would you greet someone at a café?
                </label>
                <input
                  type="text"
                  value={answers[0]}
                  onChange={(e) => setAnswers([e.target.value, answers[1], answers[2]])}
                  placeholder="e.g. Hello, coffee please!"
                  className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-400"
                />
              </div>

              <div>
                <label className="text-[11px] text-slate-300 font-medium block mb-1">
                  2. How do you ask for the check / bill?
                </label>
                <input
                  type="text"
                  value={answers[1]}
                  onChange={(e) => setAnswers([answers[0], e.target.value, answers[2]])}
                  placeholder="e.g. Can I have the check?"
                  className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-400"
                />
              </div>

              <div>
                <label className="text-[11px] text-slate-300 font-medium block mb-1">
                  3. What do you like to do in your free time?
                </label>
                <input
                  type="text"
                  value={answers[2]}
                  onChange={(e) => setAnswers([answers[0], answers[1], e.target.value])}
                  placeholder="e.g. I like reading books and traveling"
                  className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-400"
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
                <div className="w-10 h-10 border-4 border-emerald-400 border-t-transparent rounded-full animate-spin mx-auto" />
                <p className="text-xs font-bold text-emerald-400">Yoe is calibrating your personalized journey...</p>
              </div>
            ) : (
              <>
                <div className="w-16 h-16 rounded-full bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 flex items-center justify-center mx-auto text-2xl shadow-lg">
                  <Sparkles className="w-8 h-8" />
                </div>

                <h2 className="text-xl font-black text-white">Your Journey is Ready!</h2>

                <div className="bg-slate-950 p-4 rounded-2xl border border-white/10 text-left space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-400">Calibrated Level:</span>
                    <span className="font-extrabold text-emerald-400 px-2 py-0.5 rounded bg-emerald-500/20">
                      Level {calibrationResult?.estimatedCefrLevel || 'A1'}
                    </span>
                  </div>

                  <p className="text-xs text-slate-300 italic pt-2 border-t border-white/10">
                    "{calibrationResult?.welcomeMessage || 'Welcome! Let us start speaking now.'}"
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
            className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-400 text-slate-950 font-black text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/25 hover:opacity-95 transition-opacity cursor-pointer"
          >
            <span>{step === 7 ? 'Start Speaking with Yoe' : 'Continue'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

      </div>
    </div>
  );
};
