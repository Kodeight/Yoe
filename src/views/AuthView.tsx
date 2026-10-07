import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { SUPPORTED_LANGUAGES } from '../constants/languages';
import { LanguageCode, CEFRLevel, OnboardingRegistrationPayload } from '../types';
import { getTranslation } from '../utils/i18n';
import { YoeLogo } from '../components/YoeLogo';
import { VoiceBubble } from '../components/VoiceBubble';
import { LanguageFlag } from '../components/LanguageFlag';
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
  Volume2,
  Zap,
  ArrowRight,
  ArrowLeft,
  Check,
  Mail,
  Lock,
  User,
  AtSign,
  Eye,
  EyeOff,
  Globe,
  Compass
} from 'lucide-react';

export const AuthView: React.FC<{ onComplete?: () => void }> = ({ onComplete }) => {
  const { login, register, setActiveView, uiLanguage, isRtl } = useApp();
  const t = getTranslation(uiLanguage);

  const savedIdentifier = typeof window !== 'undefined' ? localStorage.getItem('yoe_last_identifier') || '' : '';

  // Views: 'welcome' (Step 0) | 'onboarding' (Steps 1-7) | 'signup' (Step 8) | 'login'
  const [viewMode, setViewMode] = useState<'welcome' | 'onboarding' | 'signup' | 'login'>('welcome');
  const [onboardingStep, setOnboardingStep] = useState<number>(1);

  // Onboarding Form State
  const [targetLang, setTargetLang] = useState<LanguageCode>('es');
  const [knownLangs, setKnownLangs] = useState<LanguageCode[]>(['en']);
  const [supportLang, setSupportLang] = useState<LanguageCode>('en');
  const [experience, setExperience] = useState<string>('never');
  const [name, setName] = useState<string>('');
  const [motivation, setMotivation] = useState<string>('Conversation');
  const [focusArea, setFocusArea] = useState<string>('Speaking');

  // Auth Form State
  const [username, setUsername] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [identifier, setIdentifier] = useState<string>(savedIdentifier);
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string>('');
  const [isDuplicate, setIsDuplicate] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const nameInputRef = useRef<HTMLInputElement>(null);

  // Subtle iPhone-style haptic feedback
  const triggerHaptic = () => {
    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      try {
        navigator.vibrate(15);
      } catch (e) {}
    }
  };

  // Focus name input on step 5
  useEffect(() => {
    if (viewMode === 'onboarding' && onboardingStep === 5) {
      const timer = setTimeout(() => {
        nameInputRef.current?.focus();
      }, 150);
      return () => clearTimeout(timer);
    }
  }, [viewMode, onboardingStep]);

  const targetLangMeta = SUPPORTED_LANGUAGES.find((l) => l.code === targetLang) || SUPPORTED_LANGUAGES[2];

  // Map previous experience to CEFR level
  const resolveCefr = (exp: string): CEFRLevel => {
    if (exp === 'comfortable') return 'B1';
    if (exp === 'basics') return 'A2';
    return 'A1';
  };

  const handleToggleKnownLang = (code: LanguageCode) => {
    triggerHaptic();
    setKnownLangs((prev) => {
      if (prev.includes(code)) {
        if (prev.length === 1) return prev; // Keep at least one
        const next = prev.filter((c) => c !== code);
        if (supportLang === code) {
          setSupportLang(next[0] || 'en');
        }
        return next;
      } else {
        return [...prev, code];
      }
    });
  };

  const handleKnownLangsSubmit = () => {
    triggerHaptic();
    if (knownLangs.length === 0) return;
    // Set default support language to first known language if not already set
    if (!knownLangs.includes(supportLang)) {
      setSupportLang(knownLangs[0]);
    }
    setOnboardingStep(3);
  };

  const handleNameSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    triggerHaptic();
    const cleanName = name.trim() || 'Learner';
    setName(cleanName);
    setOnboardingStep(6);
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setIsDuplicate(false);

    if (!identifier.trim() || !password.trim()) {
      setErrorMsg('Please enter your username or email and password.');
      return;
    }

    setIsLoading(true);
    try {
      const success = await login(identifier.trim(), password.trim());
      if (success) {
        triggerHaptic();
        if (typeof window !== 'undefined') {
          localStorage.setItem('yoe_last_identifier', identifier.trim());
        }
        if (onComplete) onComplete();
        else setActiveView('chat');
      } else {
        setErrorMsg('Invalid username/email or password.');
      }
    } catch (err: any) {
      setErrorMsg(err?.message || 'Authentication error. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignUpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setIsDuplicate(false);

    if (!name.trim() || !username.trim() || !email.trim() || !password.trim()) {
      setErrorMsg('Please complete all fields (Name, Username, Email, and Password).');
      return;
    }

    if (username.trim().length < 3) {
      setErrorMsg('Username must be at least 3 characters long.');
      return;
    }

    if (password.length < 6) {
      setErrorMsg('Password must be at least 6 characters.');
      return;
    }

    setIsLoading(true);

    const payload: OnboardingRegistrationPayload = {
      name: name.trim(),
      username: username.trim(),
      email: email.trim(),
      password: password.trim(),
      targetLanguage: targetLang,
      supportLanguage: supportLang,
      knownLanguages: knownLangs,
      previousExperience: experience,
      cefrLevel: resolveCefr(experience),
      motivation,
      focusAreas: [focusArea],
      learningGoal: `Improve ${focusArea} for ${motivation}`
    };

    try {
      const result = await register(payload);
      if (result.success) {
        triggerHaptic();
        if (typeof window !== 'undefined') {
          localStorage.setItem('yoe_last_identifier', username.trim());
        }
        if (onComplete) onComplete();
      } else {
        if (
          result.error &&
          (result.error.toLowerCase().includes('already taken') ||
            result.error.toLowerCase().includes('already exists'))
        ) {
          setIsDuplicate(true);
        }
        setErrorMsg(result.error || 'Failed to create account. Please try again.');
      }
    } catch (err: any) {
      setErrorMsg(err?.message || 'Failed to register account.');
    } finally {
      setIsLoading(false);
    }
  };

  // MOTIVATION OPTIONS DEFINITIONS
  const MOTIVATIONS = [
    { id: 'Travel', label: t.goalTravel, desc: t.goalTravelDesc, icon: Plane },
    { id: 'Work', label: t.goalWork, desc: t.goalWorkDesc, icon: Briefcase },
    { id: 'School', label: t.goalSchool, desc: t.goalSchoolDesc, icon: GraduationCap },
    { id: 'Conversation', label: t.goalConversation, desc: t.goalConversationDesc, icon: MessageCircle },
    { id: 'Just for fun', label: t.goalFun, desc: t.goalFunDesc, icon: Sparkles }
  ];

  // FOCUS OPTIONS DEFINITIONS
  const FOCUS_OPTIONS = [
    { id: 'Speaking', label: t.focusSpeaking, desc: t.focusSpeakingDesc, icon: Mic },
    { id: 'Listening', label: t.focusListening, desc: t.focusListeningDesc, icon: Headphones },
    { id: 'Vocabulary', label: t.focusVocabulary, desc: t.focusVocabularyDesc, icon: BookOpen },
    { id: 'Grammar', label: t.focusGrammar, desc: t.focusGrammarDesc, icon: Puzzle },
    { id: 'Pronunciation', label: t.focusPronunciation, desc: t.focusPronunciationDesc, icon: Volume2 },
    { id: 'Everything', label: t.focusEverything, desc: t.focusEverythingDesc, icon: Zap }
  ];

  // EXPERIENCE OPTIONS DEFINITIONS
  const EXPERIENCE_OPTIONS = [
    { id: 'never', label: t.expNever, desc: t.expNeverDesc, level: 'A1' },
    { id: 'little', label: t.expLittle, desc: t.expLittleDesc, level: 'A1' },
    { id: 'basics', label: t.expBasics, desc: t.expBasicsDesc, level: 'A2' },
    { id: 'comfortable', label: t.expComfortable, desc: t.expComfortableDesc, level: 'B1' }
  ];

  return (
    <div className="min-h-[100dvh] w-full flex flex-col justify-between items-center px-4 py-6 sm:py-8 safe-top-padding safe-bottom-padding select-none">
      
      {/* ========================================================================= */}
      {/* 1. FIRST WELCOME SCREEN (SCREEN 0) */}
      {/* ========================================================================= */}
      {viewMode === 'welcome' && (
        <div className="flex-1 flex flex-col justify-between max-w-md w-full my-auto animate-in fade-in duration-300 pt-1 pb-4">
          
          {/* Living Presence Orb */}
          <div className="flex flex-col items-center justify-center my-auto space-y-5 text-center">
            <div className="transition-transform hover:scale-105 active:scale-95 cursor-pointer">
              <VoiceBubble size="xl" state="idle" interactive />
            </div>

            <div className="space-y-2.5 px-2">
              <h1 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-slate-100 tracking-tight leading-tight">
                {t.welcomeTitle}
              </h1>
              <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 max-w-xs mx-auto leading-relaxed">
                {t.welcomeSubtitle}
              </p>
            </div>
          </div>

          {/* Actions: Primary Get Started + Required Bottom Login Entry Point */}
          <div className="space-y-4 pt-4 shrink-0 max-w-sm mx-auto w-full">
            <button
              type="button"
              onClick={() => {
                triggerHaptic();
                setViewMode('onboarding');
                setOnboardingStep(1);
              }}
              className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 hover:from-emerald-400 hover:to-teal-400 text-white font-black text-base flex items-center justify-center gap-2.5 shadow-xl shadow-emerald-500/25 active:scale-[0.98] transition-all cursor-pointer"
            >
              <span>{t.welcomeGetStarted}</span>
              <ArrowRight className={`w-5 h-5 ${isRtl ? 'rotate-180' : ''}`} />
            </button>

            {/* REQUIREMENT 7: Already registered? Sign in MUST be visible on first screen */}
            <div className="text-center pt-1">
              <button
                type="button"
                onClick={() => {
                  triggerHaptic();
                  setErrorMsg('');
                  setViewMode('login');
                }}
                className="text-xs sm:text-sm font-bold text-emerald-600 dark:text-emerald-400 hover:text-emerald-500 transition-colors cursor-pointer py-1.5 px-3 rounded-xl hover:bg-emerald-500/10"
              >
                <span>{t.alreadyRegistered} </span>
                <span className="underline decoration-emerald-500/50 underline-offset-4">{t.signIn}</span>
              </button>
            </div>
          </div>

        </div>
      )}

      {/* ========================================================================= */}
      {/* 2. ONBOARDING QUESTIONS (STEPS 1 TO 7) */}
      {/* ========================================================================= */}
      {viewMode === 'onboarding' && (
        <div className="flex-1 flex flex-col justify-between max-w-md w-full mx-auto animate-in fade-in duration-300">
          
          {/* Top Friendly Progress Header */}
          <div className="shrink-0 flex items-center justify-between pt-2 pb-4">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  triggerHaptic();
                  if (onboardingStep === 1) {
                    setViewMode('welcome');
                  } else {
                    setOnboardingStep((s) => s - 1);
                  }
                }}
                className="p-2 rounded-full glass-pill text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer"
                title={t.backButton}
              >
                <ArrowLeft className={`w-4 h-4 ${isRtl ? 'rotate-180' : ''}`} />
              </button>

              <span className="text-xs font-black uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                {t.stepIndicator.replace('{current}', String(onboardingStep)).replace('{total}', '7')}
              </span>
            </div>

            {/* Progress Dots */}
            <div className="flex items-center gap-1.5">
              {[1, 2, 3, 4, 5, 6, 7].map((s) => (
                <div
                  key={s}
                  className={`h-1.5 rounded-full transition-all duration-300 ${
                    s === onboardingStep
                      ? 'w-5 bg-gradient-to-r from-emerald-400 to-teal-400'
                      : s < onboardingStep
                      ? 'w-2 bg-emerald-500/50'
                      : 'w-2 bg-slate-300 dark:bg-slate-700/60'
                  }`}
                />
              ))}
            </div>
          </div>

          {/* STEP 1: TARGET LANGUAGE */}
          {onboardingStep === 1 && (
            <div className="flex-1 flex flex-col justify-center space-y-4 my-auto animate-in slide-in-from-right-4 duration-250">
              <div className="space-y-1 text-center">
                <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-slate-100 tracking-tight">
                  {t.targetLangTitle}
                </h2>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 max-w-xs mx-auto leading-relaxed">
                  {t.targetLangSubtitle}
                </p>
              </div>

              <div className="space-y-2 max-w-sm mx-auto w-full pt-2">
                {SUPPORTED_LANGUAGES.map((lang) => {
                  const isSelected = targetLang === lang.code;
                  return (
                    <button
                      key={lang.code}
                      type="button"
                      onClick={() => {
                        triggerHaptic();
                        setTargetLang(lang.code);
                        setOnboardingStep(2);
                      }}
                      className={`w-full p-3.5 sm:p-4 rounded-2xl border text-left flex items-center justify-between transition-all cursor-pointer active:scale-[0.99] ${
                        isSelected
                          ? 'border-emerald-500 bg-emerald-500/15 text-slate-900 dark:text-slate-100 shadow-sm ring-1 ring-emerald-500/40'
                          : 'bg-white/80 dark:bg-slate-900/60 border-slate-200 dark:border-white/10 text-slate-800 dark:text-slate-200 hover:border-emerald-500/40 hover:bg-slate-50 dark:hover:bg-slate-800/60'
                      }`}
                    >
                      <div className="flex items-center gap-3.5">
                        <LanguageFlag code={lang.code} size="lg" className="shadow-xs" />
                        <div>
                          <div className="text-sm font-bold text-slate-900 dark:text-slate-100">
                            {lang.name}
                          </div>
                          <div className="text-xs text-slate-500 dark:text-slate-400">
                            {lang.nativeName}
                          </div>
                        </div>
                      </div>

                      {isSelected && (
                        <div className="w-6 h-6 rounded-full bg-emerald-500 text-white flex items-center justify-center text-xs shadow-sm">
                          <Check className="w-3.5 h-3.5 stroke-[3]" />
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* STEP 2: LANGUAGES THE LEARNER ALREADY SPEAKS (MULTI-SELECT) */}
          {onboardingStep === 2 && (
            <div className="flex-1 flex flex-col justify-center space-y-4 my-auto animate-in slide-in-from-right-4 duration-250">
              <div className="space-y-1 text-center">
                <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-slate-100 tracking-tight">
                  {t.knownLangsTitle}
                </h2>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 max-w-xs mx-auto leading-relaxed">
                  {t.knownLangsSubtitle}
                </p>
              </div>

              <div className="space-y-2 max-w-sm mx-auto w-full pt-1">
                {SUPPORTED_LANGUAGES.map((lang) => {
                  const isChecked = knownLangs.includes(lang.code);
                  return (
                    <button
                      key={lang.code}
                      type="button"
                      onClick={() => handleToggleKnownLang(lang.code)}
                      className={`w-full p-3 sm:p-3.5 rounded-2xl border text-left flex items-center justify-between transition-all cursor-pointer active:scale-[0.99] ${
                        isChecked
                          ? 'border-emerald-500 bg-emerald-500/15 text-slate-900 dark:text-slate-100 shadow-sm ring-1 ring-emerald-500/40'
                          : 'bg-white/80 dark:bg-slate-900/60 border-slate-200 dark:border-white/10 text-slate-800 dark:text-slate-200 hover:border-emerald-500/40 hover:bg-slate-50 dark:hover:bg-slate-800/60'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <LanguageFlag code={lang.code} size="md" className="shadow-xs" />
                        <div>
                          <div className="text-xs sm:text-sm font-bold text-slate-900 dark:text-slate-100">
                            {lang.name}
                          </div>
                          <div className="text-[11px] text-slate-500 dark:text-slate-400">
                            {lang.nativeName}
                          </div>
                        </div>
                      </div>

                      <div
                        className={`w-6 h-6 rounded-lg flex items-center justify-center transition-colors ${
                          isChecked ? 'bg-emerald-500 text-white' : 'border border-slate-300 dark:border-white/20'
                        }`}
                      >
                        {isChecked && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                      </div>
                    </button>
                  );
                })}
              </div>

              <div className="max-w-sm mx-auto w-full pt-2">
                <button
                  type="button"
                  disabled={knownLangs.length === 0}
                  onClick={handleKnownLangsSubmit}
                  className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 hover:from-emerald-400 hover:to-teal-400 text-white font-extrabold text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/25 active:scale-[0.98] transition-all cursor-pointer disabled:opacity-50"
                >
                  <span>{t.continueButton}</span>
                  <ArrowRight className={`w-4 h-4 ${isRtl ? 'rotate-180' : ''}`} />
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: SUPPORT / EXPLANATION LANGUAGE */}
          {onboardingStep === 3 && (
            <div className="flex-1 flex flex-col justify-center space-y-4 my-auto animate-in slide-in-from-right-4 duration-250">
              <div className="space-y-1 text-center">
                <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-slate-100 tracking-tight">
                  {t.supportLangTitle}
                </h2>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 max-w-xs mx-auto leading-relaxed">
                  {t.supportLangSubtitle}
                </p>
              </div>

              <div className="space-y-2 max-w-sm mx-auto w-full pt-2">
                {SUPPORTED_LANGUAGES.filter((l) => knownLangs.includes(l.code)).map((lang) => {
                  const isSelected = supportLang === lang.code;
                  return (
                    <button
                      key={lang.code}
                      type="button"
                      onClick={() => {
                        triggerHaptic();
                        setSupportLang(lang.code);
                        setOnboardingStep(4);
                      }}
                      className={`w-full p-3.5 sm:p-4 rounded-2xl border text-left flex items-center justify-between transition-all cursor-pointer active:scale-[0.99] ${
                        isSelected
                          ? 'border-emerald-500 bg-emerald-500/15 text-slate-900 dark:text-slate-100 shadow-sm ring-1 ring-emerald-500/40'
                          : 'bg-white/80 dark:bg-slate-900/60 border-slate-200 dark:border-white/10 text-slate-800 dark:text-slate-200 hover:border-emerald-500/40 hover:bg-slate-50 dark:hover:bg-slate-800/60'
                      }`}
                    >
                      <div className="flex items-center gap-3.5">
                        <LanguageFlag code={lang.code} size="lg" className="shadow-xs" />
                        <div>
                          <div className="text-sm font-bold text-slate-900 dark:text-slate-100">
                            {lang.name}
                          </div>
                          <div className="text-xs text-slate-500 dark:text-slate-400">
                            {lang.nativeName}
                          </div>
                        </div>
                      </div>

                      {isSelected && (
                        <div className="w-6 h-6 rounded-full bg-emerald-500 text-white flex items-center justify-center text-xs shadow-sm">
                          <Check className="w-3.5 h-3.5 stroke-[3]" />
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* STEP 4: PREVIOUS EXPERIENCE / LEVEL */}
          {onboardingStep === 4 && (
            <div className="flex-1 flex flex-col justify-center space-y-4 my-auto animate-in slide-in-from-right-4 duration-250">
              <div className="space-y-1 text-center">
                <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-slate-100 tracking-tight">
                  {t.experienceTitle.replace('{language}', targetLangMeta.name)}
                </h2>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 max-w-xs mx-auto leading-relaxed">
                  {t.experienceSubtitle}
                </p>
              </div>

              <div className="space-y-2 max-w-sm mx-auto w-full pt-1">
                {EXPERIENCE_OPTIONS.map((opt) => {
                  const isSelected = experience === opt.id;
                  return (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => {
                        triggerHaptic();
                        setExperience(opt.id);
                        setOnboardingStep(5);
                      }}
                      className={`w-full p-3.5 sm:p-4 rounded-2xl border text-left flex items-center justify-between transition-all cursor-pointer active:scale-[0.99] ${
                        isSelected
                          ? 'border-emerald-500 bg-emerald-500/15 text-slate-900 dark:text-slate-100 shadow-sm ring-1 ring-emerald-500/40'
                          : 'bg-white/80 dark:bg-slate-900/60 border-slate-200 dark:border-white/10 text-slate-800 dark:text-slate-200 hover:border-emerald-500/40 hover:bg-slate-50 dark:hover:bg-slate-800/60'
                      }`}
                    >
                      <div className="min-w-0 pr-2">
                        <div className="text-xs sm:text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                          <span>{opt.label}</span>
                          <span className="px-1.5 py-0.5 rounded bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 text-[10px] font-black uppercase">
                            {opt.level}
                          </span>
                        </div>
                        <div className="text-[11px] text-slate-500 dark:text-slate-400 truncate mt-0.5">
                          {opt.desc}
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

          {/* STEP 5: NAME (TYPED TEXT INPUT) */}
          {onboardingStep === 5 && (
            <div className="flex-1 flex flex-col justify-center space-y-6 my-auto animate-in slide-in-from-right-4 duration-250">
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
                    ref={nameInputRef}
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder={t.namePlaceholder}
                    maxLength={40}
                    className="w-full py-4 px-5 text-center text-lg font-bold rounded-2xl bg-white dark:bg-slate-900/80 border border-slate-300 dark:border-white/10 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-emerald-400/50 focus:border-emerald-400 transition-all shadow-sm"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 hover:from-emerald-400 hover:to-teal-400 text-white font-extrabold text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/25 active:scale-[0.98] transition-all cursor-pointer"
                >
                  <span>{t.continueButton}</span>
                  <ArrowRight className={`w-4 h-4 ${isRtl ? 'rotate-180' : ''}`} />
                </button>
              </form>
            </div>
          )}

          {/* STEP 6: LEARNING GOAL */}
          {onboardingStep === 6 && (
            <div className="flex-1 flex flex-col justify-center space-y-4 my-auto animate-in slide-in-from-right-4 duration-250">
              <div className="space-y-1 text-center">
                <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-slate-100 tracking-tight">
                  {t.goalQuestionTitle.replace('{language}', targetLangMeta.name)}
                </h2>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 max-w-xs mx-auto leading-relaxed">
                  {t.goalQuestionSubtitle}
                </p>
              </div>

              <div className="space-y-2 max-w-sm mx-auto w-full pt-1">
                {MOTIVATIONS.map((opt) => {
                  const Icon = opt.icon;
                  const isSelected = motivation === opt.id;
                  return (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => {
                        triggerHaptic();
                        setMotivation(opt.id);
                        setOnboardingStep(7);
                      }}
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
                            {opt.desc}
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

          {/* STEP 7: FOCUS AREA */}
          {onboardingStep === 7 && (
            <div className="flex-1 flex flex-col justify-center space-y-4 my-auto animate-in slide-in-from-right-4 duration-250">
              <div className="space-y-1 text-center">
                <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-slate-100 tracking-tight">
                  {t.focusQuestionTitle}
                </h2>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 max-w-xs mx-auto leading-relaxed">
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
                      onClick={() => {
                        triggerHaptic();
                        setFocusArea(opt.id);
                        setViewMode('signup');
                      }}
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
                            {opt.desc}
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

          {/* Calm footer */}
          <div className="shrink-0 text-center text-[10px] text-slate-500 dark:text-slate-500 py-1">
            <span>Yoe will shape your personal conversations to these goals.</span>
          </div>

        </div>
      )}

      {/* ========================================================================= */}
      {/* 3. SIGN-UP / CREATE ACCOUNT FORM (STEP 8) */}
      {/* ========================================================================= */}
      {viewMode === 'signup' && (
        <div className="flex-1 flex flex-col justify-between max-w-md w-full mx-auto my-auto animate-in fade-in duration-300 py-2">
          
          <div className="space-y-4">
            <div className="text-center space-y-1.5">
              <YoeLogo size="sm" className="justify-center mx-auto" />
              <h1 className="text-2xl font-black text-slate-900 dark:text-slate-100 tracking-tight">
                {t.saveProgressTitle}
              </h1>
              <p className="text-xs text-slate-600 dark:text-slate-400 max-w-xs mx-auto leading-relaxed">
                {t.saveProgressSubtitle}
              </p>
            </div>

            {/* Personalized Context Summary Badge */}
            <div className="p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-between text-xs font-bold text-emerald-700 dark:text-emerald-300">
              <div className="flex items-center gap-2">
                <LanguageFlag code={targetLangMeta.code} size="xs" className="shadow-xs" />
                <span>Learning {targetLangMeta.name}</span>
                <span className="px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-[10px]">
                  {resolveCefr(experience)}
                </span>
              </div>
              <div className="text-[11px] opacity-90 truncate max-w-[120px]">
                {motivation}
              </div>
            </div>

            {/* Error Alert */}
            {errorMsg && (
              <div className="p-3.5 rounded-2xl bg-red-500/15 border border-red-500/30 text-red-700 dark:text-red-300 text-xs font-medium space-y-1.5">
                <p>{errorMsg}</p>
                {isDuplicate && (
                  <button
                    type="button"
                    onClick={() => {
                      setViewMode('login');
                      setErrorMsg('');
                    }}
                    className="text-xs font-bold text-emerald-600 dark:text-emerald-400 underline cursor-pointer"
                  >
                    {t.signIn}
                  </button>
                )}
              </div>
            )}

            {/* Account Creation Form */}
            <form onSubmit={handleSignUpSubmit} className="glass-card rounded-3xl p-5 shadow-xl space-y-3.5">
              
              {/* Name (prefilled from step 5) */}
              <div>
                <label className="text-xs font-bold text-slate-800 dark:text-slate-200 block mb-1">
                  {t.yourNameLabel}
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder={t.yourNamePlaceholder}
                    className="w-full bg-white dark:bg-slate-950/60 border border-slate-300 dark:border-white/10 rounded-2xl pl-10 pr-4 py-3 text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:border-emerald-400 transition-colors"
                  />
                </div>
              </div>

              {/* Username */}
              <div>
                <label className="text-xs font-bold text-slate-800 dark:text-slate-200 block mb-1">
                  {t.usernameLabel}
                </label>
                <div className="relative">
                  <AtSign className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder={t.usernamePlaceholder}
                    className="w-full bg-white dark:bg-slate-950/60 border border-slate-300 dark:border-white/10 rounded-2xl pl-10 pr-4 py-3 text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:border-emerald-400 transition-colors"
                  />
                </div>
              </div>

              {/* Email */}
              <div>
                <label className="text-xs font-bold text-slate-800 dark:text-slate-200 block mb-1">
                  {t.emailLabel}
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder={t.emailPlaceholder}
                    className="w-full bg-white dark:bg-slate-950/60 border border-slate-300 dark:border-white/10 rounded-2xl pl-10 pr-4 py-3 text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:border-emerald-400 transition-colors"
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label className="text-xs font-bold text-slate-800 dark:text-slate-200 block mb-1">
                  {t.passwordLabel}
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder={t.passwordPlaceholder}
                    className="w-full bg-white dark:bg-slate-950/60 border border-slate-300 dark:border-white/10 rounded-2xl pl-10 pr-10 py-3 text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:border-emerald-400 transition-colors"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full mt-2 py-3.5 rounded-2xl bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 hover:from-emerald-400 hover:to-teal-400 text-white font-black text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/25 active:scale-[0.98] transition-all cursor-pointer disabled:opacity-60"
              >
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>{t.creatingAccount}</span>
                  </div>
                ) : (
                  <>
                    <span>{t.createAccount}</span>
                    <ArrowRight className={`w-4 h-4 ${isRtl ? 'rotate-180' : ''}`} />
                  </>
                )}
              </button>
            </form>
          </div>

          {/* REQUIREMENT 8: Bottom Sign in link on sign-up screen */}
          <div className="text-center pt-4 shrink-0">
            <button
              type="button"
              onClick={() => {
                triggerHaptic();
                setErrorMsg('');
                setViewMode('login');
              }}
              className="text-xs sm:text-sm font-bold text-emerald-600 dark:text-emerald-400 hover:text-emerald-500 transition-colors cursor-pointer py-1.5 px-3 rounded-xl hover:bg-emerald-500/10"
            >
              <span>{t.alreadyRegistered} </span>
              <span className="underline decoration-emerald-500/50 underline-offset-4">{t.signIn}</span>
            </button>
          </div>

        </div>
      )}

      {/* ========================================================================= */}
      {/* 4. LOGIN FORM */}
      {/* ========================================================================= */}
      {viewMode === 'login' && (
        <div className="flex-1 flex flex-col justify-between max-w-md w-full mx-auto my-auto animate-in fade-in duration-300 py-4">
          
          <div className="space-y-5">
            <div className="text-center space-y-2">
              <YoeLogo size="md" className="justify-center mx-auto" />
              <h1 className="text-2xl font-black text-slate-900 dark:text-slate-100 tracking-tight">
                {t.welcomeBack}
              </h1>
              <p className="text-xs text-slate-600 dark:text-slate-400 max-w-xs mx-auto leading-relaxed">
                {t.welcomeBackSubtitle}
              </p>
            </div>

            {/* Error Alert */}
            {errorMsg && (
              <div className="p-3.5 rounded-2xl bg-red-500/15 border border-red-500/30 text-red-700 dark:text-red-300 text-xs font-medium">
                {errorMsg}
              </div>
            )}

            {/* Sign In Form */}
            <form onSubmit={handleLoginSubmit} className="glass-card rounded-3xl p-6 shadow-xl space-y-4">
              
              <div>
                <label className="text-xs font-bold text-slate-800 dark:text-slate-200 block mb-1.5">
                  {t.usernameLabel} / {t.emailLabel}
                </label>
                <div className="relative">
                  <AtSign className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    placeholder="Username or email address"
                    className="w-full bg-white dark:bg-slate-950/60 border border-slate-300 dark:border-white/10 rounded-2xl pl-10 pr-4 py-3.5 text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:border-emerald-400 transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-800 dark:text-slate-200 block mb-1.5">
                  {t.passwordLabel}
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder={t.passwordPlaceholder}
                    className="w-full bg-white dark:bg-slate-950/60 border border-slate-300 dark:border-white/10 rounded-2xl pl-10 pr-10 py-3.5 text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:border-emerald-400 transition-colors"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full mt-2 py-3.5 rounded-2xl bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 hover:from-emerald-400 hover:to-teal-400 text-white font-black text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/25 active:scale-[0.98] transition-all cursor-pointer disabled:opacity-60"
              >
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>{t.signingIn}</span>
                  </div>
                ) : (
                  <>
                    <span>{t.signIn}</span>
                    <ArrowRight className={`w-4 h-4 ${isRtl ? 'rotate-180' : ''}`} />
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Return to Onboarding Link */}
          <div className="text-center pt-4 shrink-0">
            <button
              type="button"
              onClick={() => {
                triggerHaptic();
                setErrorMsg('');
                setViewMode('welcome');
              }}
              className="text-xs sm:text-sm font-bold text-emerald-600 dark:text-emerald-400 hover:text-emerald-500 transition-colors cursor-pointer py-1.5 px-3 rounded-xl hover:bg-emerald-500/10"
            >
              <span>{t.newToYoe} </span>
              <span className="underline decoration-emerald-500/50 underline-offset-4">{t.startYourJourney}</span>
            </button>
          </div>

        </div>
      )}

    </div>
  );
};
