import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { YoeLogo } from '../components/YoeLogo';
import { Mail, Lock, User, AtSign, Eye, EyeOff, ArrowRight } from 'lucide-react';

export const AuthView: React.FC<{ onComplete?: () => void }> = ({ onComplete }) => {
  const { login, register, setActiveView } = useApp();

  const savedIdentifier = typeof window !== 'undefined' ? localStorage.getItem('yoe_last_identifier') || '' : '';
  const [mode, setMode] = useState<'login' | 'signup'>(savedIdentifier ? 'login' : 'login');
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [identifier, setIdentifier] = useState(savedIdentifier);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [isDuplicate, setIsDuplicate] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setIsDuplicate(false);

    if (mode === 'login') {
      if (!identifier.trim() || !password.trim()) {
        setErrorMsg('Please enter your username or email and password.');
        return;
      }
    } else {
      if (!name.trim() || !username.trim() || !email.trim() || !password.trim()) {
        setErrorMsg('Please complete all fields (Name, Username, Email, and Password).');
        return;
      }
      if (username.trim().length < 3) {
        setErrorMsg('Username must be at least 3 characters long.');
        return;
      }
    }

    if (password.length < 6) {
      setErrorMsg('Password must be at least 6 characters.');
      return;
    }

    setIsLoading(true);

    try {
      if (mode === 'login') {
        const success = await login(identifier.trim(), password.trim());
        if (success) {
          if (typeof window !== 'undefined') {
            localStorage.setItem('yoe_last_identifier', identifier.trim());
          }
          if (onComplete) onComplete();
          else setActiveView('home');
        } else {
          setErrorMsg('Invalid username/email or password.');
        }
      } else {
        const result = await register(name.trim(), username.trim(), email.trim(), password.trim());
        if (result.success) {
          if (typeof window !== 'undefined') {
            localStorage.setItem('yoe_last_identifier', username.trim());
          }
          if (onComplete) onComplete();
        } else {
          if (result.error && (result.error.toLowerCase().includes('already taken') || result.error.toLowerCase().includes('already exists'))) {
            setIsDuplicate(true);
          }
          setErrorMsg(result.error || 'Failed to create account. Please try again.');
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
      <div className="max-w-md w-full space-y-6 animate-in fade-in duration-300">

        {/* Clean Brand Header */}
        <div className="text-center space-y-2">
          <YoeLogo size="lg" className="justify-center mx-auto" />
          <p className="font-signature text-2xl sm:text-3xl font-bold tracking-wide text-emerald-400 dark:text-emerald-400 light-mode:text-emerald-600 pt-1">
            Speak. Learn. Grow.
          </p>
          <h1 className="text-2xl font-black text-slate-100 dark:text-slate-100 light-mode:text-slate-900 tracking-tight">
            {mode === 'signup' ? 'Start Your Language Journey' : 'Welcome Back'}
          </h1>
          <p className="text-xs text-slate-400 dark:text-slate-400 light-mode:text-slate-600 max-w-xs mx-auto leading-relaxed">
            {mode === 'signup'
              ? 'Create your account to start interactive scenario-based language practice.'
              : 'Sign in to continue your personalized conversations.'}
          </p>
        </div>

        {/* Mode Toggle (Liquid Glass Segmented Control) */}
        <div className="p-1 rounded-2xl glass-pill flex items-center shadow-md">
          <button
            type="button"
            onClick={() => { setMode('signup'); setErrorMsg(''); setIsDuplicate(false); }}
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
            onClick={() => { setMode('login'); setErrorMsg(''); setIsDuplicate(false); }}
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
          <div className="p-4 rounded-2xl bg-red-500/15 border border-red-500/30 text-red-300 dark:text-red-300 light-mode:text-red-700 text-xs font-medium space-y-2 animate-in fade-in">
            <p>{errorMsg}</p>
            {isDuplicate && (
              <button
                type="button"
                onClick={() => { setMode('login'); setErrorMsg(''); }}
                className="px-3 py-1.5 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <span>Sign in instead</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        )}

        {/* Main Glass Form Card */}
        <form onSubmit={handleSubmit} className="glass-card rounded-3xl p-6 shadow-xl space-y-4">

          {/* LOGIN MODE: Single "Username or email" field */}
          {mode === 'login' ? (
            <div>
              <label className="text-xs font-bold text-slate-200 dark:text-slate-200 light-mode:text-slate-800 block mb-1.5">
                Username or email
              </label>
              <div className="relative">
                <AtSign className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  placeholder="Username or email address"
                  className="w-full bg-slate-950/60 dark:bg-slate-950/60 light-mode:bg-white border border-white/10 dark:border-white/10 light-mode:border-slate-200 rounded-2xl pl-10 pr-4 py-3 text-xs text-slate-100 dark:text-slate-100 light-mode:text-slate-900 placeholder-slate-500 focus:outline-none focus:border-emerald-400 transition-colors"
                />
              </div>
            </div>
          ) : (
            /* SIGNUP MODE: Name, Username, Email */
            <>
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
                    placeholder="e.g. Maria Silva"
                    className="w-full bg-slate-950/60 dark:bg-slate-950/60 light-mode:bg-white border border-white/10 dark:border-white/10 light-mode:border-slate-200 rounded-2xl pl-10 pr-4 py-3 text-xs text-slate-100 dark:text-slate-100 light-mode:text-slate-900 placeholder-slate-500 focus:outline-none focus:border-emerald-400 transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-200 dark:text-slate-200 light-mode:text-slate-800 block mb-1.5">
                  Username
                </label>
                <div className="relative">
                  <AtSign className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Choose a unique username"
                    className="w-full bg-slate-950/60 dark:bg-slate-950/60 light-mode:bg-white border border-white/10 dark:border-white/10 light-mode:border-slate-200 rounded-2xl pl-10 pr-4 py-3 text-xs text-slate-100 dark:text-slate-100 light-mode:text-slate-900 placeholder-slate-500 focus:outline-none focus:border-emerald-400 transition-colors"
                  />
                </div>
              </div>

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
                    className="w-full bg-slate-950/60 dark:bg-slate-950/60 light-mode:bg-white border border-white/10 dark:border-white/10 light-mode:border-slate-200 rounded-2xl pl-10 pr-4 py-3 text-xs text-slate-100 dark:text-slate-100 light-mode:text-slate-900 placeholder-slate-500 focus:outline-none focus:border-emerald-400 transition-colors"
                  />
                </div>
              </div>
            </>
          )}

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
                placeholder="Minimum 6 characters"
                className="w-full bg-slate-950/60 dark:bg-slate-950/60 light-mode:bg-white border border-white/10 dark:border-white/10 light-mode:border-slate-200 rounded-2xl pl-10 pr-10 py-3 text-xs text-slate-100 dark:text-slate-100 light-mode:text-slate-900 placeholder-slate-500 focus:outline-none focus:border-emerald-400 transition-colors"
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

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full mt-3 py-3.5 rounded-2xl bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-400 text-slate-950 font-black text-xs flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 hover:opacity-95 active:scale-98 transition-all cursor-pointer disabled:opacity-50"
          >
            {isLoading ? (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                <span>{mode === 'signup' ? 'Creating Account...' : 'Signing In...'}</span>
              </div>
            ) : (
              <>
                <span>{mode === 'signup' ? 'Create Account' : 'Sign In'}</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

      </div>
    </div>
  );
};
