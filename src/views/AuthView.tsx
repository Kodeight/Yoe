import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { YoeLogo } from '../components/YoeLogo';
import { SUPPORTED_LANGUAGES } from '../server/db';
import { LanguageCode } from '../types';
import { Mail, Lock, User, Eye, EyeOff, ArrowRight, Sparkles, CheckCircle2, Shield } from 'lucide-react';

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
          setErrorMsg('Invalid email or password. Please try again.');
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
      setErrorMsg(err.message || 'An error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGuestDemo = async () => {
    setIsLoading(true);
    await login('learner@yoe.app', 'password123');
    setIsLoading(false);
    if (onComplete) onComplete();
    else setActiveView('home');
  };

  return (
    <div className="min-h-screen bg-[#0b0f17] text-slate-100 flex flex-col justify-center px-4 py-8">
      <div className="max-w-md w-full mx-auto space-y-6">

        {/* Brand Header */}
        <div className="text-center space-y-2">
          <YoeLogo size="lg" className="justify-center mx-auto" />
          <p className="text-xs font-semibold tracking-wide text-emerald-400 uppercase">
            Speak. Learn. Grow.
          </p>
          <h1 className="text-2xl font-black text-white tracking-tight mt-1">
            {mode === 'signup' ? 'Create your Yoe account' : 'Welcome back to Yoe'}
          </h1>
          <p className="text-xs text-slate-400 max-w-xs mx-auto">
            {mode === 'signup'
              ? 'Join scenario worlds, master real dialogue, and let AI adapt to your communication style.'
              : 'Sign in to continue your independent learning journeys.'}
          </p>
        </div>

        {/* Auth Mode Toggle Pill */}
        <div className="bg-slate-900 p-1 rounded-2xl border border-white/10 flex items-center shadow-lg">
          <button
            type="button"
            onClick={() => { setMode('signup'); setErrorMsg(''); }}
            className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
              mode === 'signup'
                ? 'bg-gradient-to-r from-emerald-500 to-teal-400 text-slate-950 shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Create Account
          </button>
          <button
            type="button"
            onClick={() => { setMode('login'); setErrorMsg(''); }}
            className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
              mode === 'login'
                ? 'bg-gradient-to-r from-emerald-500 to-teal-400 text-slate-950 shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Sign In
          </button>
        </div>

        {/* Error Alert */}
        {errorMsg && (
          <div className="p-3 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-medium animate-in fade-in">
            {errorMsg}
          </div>
        )}

        {/* Main Form */}
        <form onSubmit={handleSubmit} className="bg-slate-900/90 border border-white/10 rounded-3xl p-6 shadow-xl space-y-4">

          {/* Name Field (Sign up only) */}
          {mode === 'signup' && (
            <div>
              <label className="text-xs font-bold text-slate-300 block mb-1">
                Your Name
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Alex Rivera"
                  className="w-full bg-slate-950 border border-white/10 rounded-2xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-400 transition-colors"
                />
              </div>
            </div>
          )}

          {/* Email Field */}
          <div>
            <label className="text-xs font-bold text-slate-300 block mb-1">
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
                className="w-full bg-slate-950 border border-white/10 rounded-2xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-400 transition-colors"
              />
            </div>
          </div>

          {/* Password Field */}
          <div>
            <label className="text-xs font-bold text-slate-300 block mb-1">
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
                className="w-full bg-slate-950 border border-white/10 rounded-2xl pl-10 pr-10 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-400 transition-colors"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 cursor-pointer"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Language Selection during Registration */}
          {mode === 'signup' && (
            <div className="pt-1 space-y-3 border-t border-white/10">
              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1">
                  Language you want to learn:
                </label>
                <select
                  value={targetLang}
                  onChange={(e) => setTargetLang(e.target.value as LanguageCode)}
                  className="w-full bg-slate-950 border border-white/10 rounded-2xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-400"
                >
                  {SUPPORTED_LANGUAGES.map((l) => (
                    <option key={l.code} value={l.code}>
                      {l.flag} {l.name} ({l.nativeName})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1">
                  Language for explanations / support:
                </label>
                <select
                  value={supportLang}
                  onChange={(e) => setSupportLang(e.target.value as LanguageCode)}
                  className="w-full bg-slate-950 border border-white/10 rounded-2xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-400"
                >
                  {SUPPORTED_LANGUAGES.map((l) => (
                    <option key={l.code} value={l.code}>
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
            className="w-full mt-2 py-3 rounded-2xl bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-400 text-slate-950 font-black text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/25 hover:opacity-95 transition-all cursor-pointer disabled:opacity-50"
          >
            {isLoading ? (
              <div className="w-5 h-5 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <span>{mode === 'signup' ? 'Create Free Account' : 'Sign In'}</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>

          {/* Guest Demo Button */}
          <div className="pt-2 text-center">
            <button
              type="button"
              onClick={handleGuestDemo}
              disabled={isLoading}
              className="text-xs text-slate-400 hover:text-emerald-400 font-semibold underline underline-offset-4 cursor-pointer transition-colors"
            >
              Or continue with Instant Demo Account
            </button>
          </div>
        </form>

        {/* Database Ready notice */}
        <div className="p-3 rounded-2xl bg-slate-900/60 border border-white/5 text-center text-[11px] text-slate-500 flex items-center justify-center gap-2">
          <Shield className="w-3.5 h-3.5 text-emerald-400" />
          <span>Full-Stack Auth Ready: Local & PostgreSQL / Neon compatible</span>
        </div>

      </div>
    </div>
  );
};
