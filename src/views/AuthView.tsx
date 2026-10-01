import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { YoeLogo } from '../components/YoeLogo';
import { YoeOrb } from '../components/YoeOrb';
import { SUPPORTED_LANGUAGES } from '../server/db';
import { LanguageCode } from '../types';
import { Mail, Lock, User, Eye, EyeOff, ArrowRight, Sparkles } from 'lucide-react';

export const AuthView: React.FC<{ onComplete?: () => void }> = ({ onComplete }) => {
  const { login, register, setActiveView } = useApp();

  const [mode, setMode] = useState<'login' | 'signup'>('signup');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [targetLang, setTargetLang] = useState<LanguageCode>('en');
  const [supportLang, setSupportLang] = useState<LanguageCode>('es');
  const [errorMsg, setErrorMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!email.trim() || !password.trim()) {
      setErrorMsg('Please enter both email and password.');
      return;
    }

    if (mode === 'signup' && !name.trim()) {
      setErrorMsg('Please enter your name.');
      return;
    }

    setIsLoading(true);

    try {
      if (mode === 'login') {
        const success = await login(email.trim(), password.trim());
        if (success) {
          if (onComplete) onComplete();
          else setActiveView('home');
        } else {
          setErrorMsg('Invalid email or password. Please verify your credentials.');
        }
      } else {
        const success = await register(name.trim(), email.trim(), password.trim(), targetLang, supportLang);
        if (success) {
          if (onComplete) onComplete();
          else setActiveView('home');
        } else {
          setErrorMsg('An account with this email already exists.');
        }
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Authentication error. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[100dvh] w-full flex flex-col justify-center items-center px-4 py-8 safe-top-padding safe-bottom-padding">
      <div className="max-w-md w-full space-y-6 animate-in fade-in zoom-in-95 duration-300">

        {/* Brand Header */}
        <div className="text-center space-y-3">
          <YoeOrb size="sm" className="mb-2" />
          <YoeLogo size="lg" className="justify-center mx-auto" />
          <p className="text-xs font-bold tracking-widest text-emerald-400 dark:text-emerald-400 light-mode:text-emerald-600 uppercase">
            Speak • Learn • Grow
          </p>
          <h1 className="text-2xl font-black text-slate-100 dark:text-slate-100 light-mode:text-slate-900 tracking-tight">
            {mode === 'signup' ? 'Start Your Language Journey' : 'Welcome Back to Yoe'}
          </h1>
          <p className="text-xs text-slate-400 dark:text-slate-400 light-mode:text-slate-600 max-w-xs mx-auto leading-relaxed">
            {mode === 'signup'
              ? 'Enter realistic scenario worlds, speak naturally, and master conversational flow with Yoe.'
              : 'Sign in to continue your personalized speaking journeys.'}
          </p>
        </div>

        {/* Auth Mode Toggle Pill (Liquid Glass Segmented Control) */}
        <div className="p-1 rounded-2xl glass-pill flex items-center shadow-md">
          <button
            type="button"
            onClick={() => { setMode('signup'); setErrorMsg(''); }}
            className={`flex-1 py-2.5 text-xs font-bold rounded-xl transition-all cursor-pointer ${
              mode === 'signup'
                ? 'bg-gradient-to-r from-emerald-400 to-teal-400 text-slate-950 font-black shadow-md'
                : 'text-slate-400 dark:text-slate-400 light-mode:text-slate-600 hover:text-slate-100'
            }`}
          >
            Create Account
          </button>
          <button
            type="button"
            onClick={() => { setMode('login'); setErrorMsg(''); }}
            className={`flex-1 py-2.5 text-xs font-bold rounded-xl transition-all cursor-pointer ${
              mode === 'login'
                ? 'bg-gradient-to-r from-emerald-400 to-teal-400 text-slate-950 font-black shadow-md'
                : 'text-slate-400 dark:text-slate-400 light-mode:text-slate-600 hover:text-slate-100'
            }`}
          >
            Sign In
          </button>
        </div>

        {/* Error Alert */}
        {errorMsg && (
          <div className="p-3.5 rounded-2xl bg-red-500/15 border border-red-500/30 text-red-300 dark:text-red-300 light-mode:text-red-600 text-xs font-medium animate-in fade-in">
            {errorMsg}
          </div>
        )}

        {/* Main Glass Form Card */}
        <form onSubmit={handleSubmit} className="glass-card rounded-3xl p-6 shadow-xl space-y-4">

          {/* Name Field (Sign up only) */}
          {mode === 'signup' && (
            <div>
              <label className="text-xs font-bold text-slate-200 dark:text-slate-200 light-mode:text-slate-800 block mb-1.5">
                Your Name
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter your name"
                  className="w-full bg-slate-950/60 dark:bg-slate-950/60 light-mode:bg-white border border-white/10 dark:border-white/10 light-mode:border-slate-200 rounded-2xl pl-10 pr-4 py-2.5 text-xs text-slate-100 dark:text-slate-100 light-mode:text-slate-900 placeholder-slate-500 focus:outline-none focus:border-emerald-400 transition-colors"
                />
              </div>
            </div>
          )}

          {/* Email Field */}
          <div>
            <label className="text-xs font-bold text-slate-200 dark:text-slate-200 light-mode:text-slate-800 block mb-1.5">
              Email Address
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                className="w-full bg-slate-950/60 dark:bg-slate-950/60 light-mode:bg-white border border-white/10 dark:border-white/10 light-mode:border-slate-200 rounded-2xl pl-10 pr-4 py-2.5 text-xs text-slate-100 dark:text-slate-100 light-mode:text-slate-900 placeholder-slate-500 focus:outline-none focus:border-emerald-400 transition-colors"
              />
            </div>
          </div>

          {/* Password Field */}
          <div>
            <label className="text-xs font-bold text-slate-200 dark:text-slate-200 light-mode:text-slate-800 block mb-1.5">
              Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-slate-950/60 dark:bg-slate-950/60 light-mode:bg-white border border-white/10 dark:border-white/10 light-mode:border-slate-200 rounded-2xl pl-10 pr-10 py-2.5 text-xs text-slate-100 dark:text-slate-100 light-mode:text-slate-900 placeholder-slate-500 focus:outline-none focus:border-emerald-400 transition-colors"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 dark:hover:text-slate-200 light-mode:hover:text-slate-800 cursor-pointer"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Language Selection during Registration */}
          {mode === 'signup' && (
            <div className="pt-2 space-y-3 border-t border-white/10 dark:border-white/10 light-mode:border-slate-200">
              <div>
                <label className="text-xs font-bold text-slate-200 dark:text-slate-200 light-mode:text-slate-800 block mb-1">
                  Language to learn:
                </label>
                <select
                  value={targetLang}
                  onChange={(e) => setTargetLang(e.target.value as LanguageCode)}
                  className="w-full bg-slate-950/60 dark:bg-slate-950/60 light-mode:bg-white border border-white/10 dark:border-white/10 light-mode:border-slate-200 rounded-2xl px-3.5 py-2.5 text-xs text-slate-100 dark:text-slate-100 light-mode:text-slate-900 focus:outline-none focus:border-emerald-400"
                >
                  {SUPPORTED_LANGUAGES.map((l) => (
                    <option key={l.code} value={l.code} className="bg-slate-900 text-white dark:bg-slate-900 light-mode:bg-white light-mode:text-slate-900">
                      {l.flag} {l.name} ({l.nativeName})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-200 dark:text-slate-200 light-mode:text-slate-800 block mb-1">
                  Explanation language:
                </label>
                <select
                  value={supportLang}
                  onChange={(e) => setSupportLang(e.target.value as LanguageCode)}
                  className="w-full bg-slate-950/60 dark:bg-slate-950/60 light-mode:bg-white border border-white/10 dark:border-white/10 light-mode:border-slate-200 rounded-2xl px-3.5 py-2.5 text-xs text-slate-100 dark:text-slate-100 light-mode:text-slate-900 focus:outline-none focus:border-emerald-400"
                >
                  {SUPPORTED_LANGUAGES.map((l) => (
                    <option key={l.code} value={l.code} className="bg-slate-900 text-white dark:bg-slate-900 light-mode:bg-white light-mode:text-slate-900">
                      {l.flag} {l.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full mt-3 py-3.5 rounded-2xl bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-400 text-slate-950 font-black text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 hover:opacity-95 active:scale-98 transition-all cursor-pointer disabled:opacity-50"
          >
            {isLoading ? (
              <div className="w-5 h-5 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <span>{mode === 'signup' ? 'Create Account & Start' : 'Sign In'}</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

      </div>
    </div>
  );
};
