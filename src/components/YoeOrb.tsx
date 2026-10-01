import React from 'react';

export const YoeOrb: React.FC<{ size?: 'sm' | 'md' | 'lg' }> = ({ size = 'md' }) => {
  const sizeClasses = size === 'sm' ? 'w-44 h-44' : size === 'lg' ? 'w-72 h-72' : 'w-60 h-60';

  return (
    <div className={`relative ${sizeClasses} flex items-center justify-center mx-auto select-none pointer-events-none`}>
      {/* Outer ambient glow */}
      <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-emerald-500/30 via-teal-400/20 to-blue-500/30 blur-2xl animate-pulse opacity-70" />

      {/* Main globe body */}
      <div className="relative w-full h-full rounded-full bg-gradient-to-tr from-[#0a233c] via-[#0e3b5e] to-[#10b981]/40 border border-teal-400/30 shadow-[inset_0_0_40px_rgba(16,185,129,0.3)] flex items-center justify-center overflow-hidden">
        {/* Globe Grid lines */}
        <div className="absolute inset-0 border border-teal-300/10 rounded-full rotate-12 scale-90" />
        <div className="absolute inset-0 border border-cyan-300/10 rounded-full -rotate-45 scale-95" />
        <div className="absolute top-1/2 left-0 right-0 h-[1px] bg-teal-400/20" />
        <div className="absolute left-1/2 top-0 bottom-0 w-[1px] bg-cyan-400/20" />

        {/* Center Speech Bubble */}
        <div className="relative z-10 bg-white/90 dark:bg-[#112338]/90 backdrop-blur-md px-5 py-3.5 rounded-3xl shadow-xl shadow-teal-900/40 border border-white/20 flex items-center gap-1.5 animate-bounce-slow">
          <span className="w-2.5 h-2.5 rounded-full bg-teal-400 animate-ping" />
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse delay-100" />
          <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-pulse delay-200" />
        </div>

        {/* Glossy top reflection highlight */}
        <div className="absolute top-2 left-6 right-6 h-1/3 bg-gradient-to-b from-white/25 to-transparent rounded-t-full pointer-events-none" />
      </div>

      {/* Floating Badge 1: 'A' (Cyan blue pill top left) */}
      <div className="absolute top-3 left-1 bg-gradient-to-tr from-cyan-500 to-blue-600 text-white font-bold text-lg px-3 py-2 rounded-2xl shadow-lg border border-white/30 transform -rotate-12 animate-float">
        A
      </div>

      {/* Floating Badge 2: 'あ' (Emerald green pill top right) */}
      <div className="absolute top-4 right-2 bg-gradient-to-tr from-emerald-400 to-teal-500 text-white font-bold text-lg px-3 py-2 rounded-2xl shadow-lg border border-white/30 transform rotate-12 animate-float delay-300">
        あ
      </div>

      {/* Floating Badge 3: '文' (Purple pill bottom right) */}
      <div className="absolute bottom-6 right-1 bg-gradient-to-tr from-purple-500 to-indigo-600 text-white font-bold text-lg px-3 py-2 rounded-2xl shadow-lg border border-white/30 transform rotate-6 animate-float delay-700">
        文
      </div>

      {/* Floating sparkles */}
      <div className="absolute top-1/4 right-1/4 text-cyan-300 text-sm animate-spin-slow">✦</div>
      <div className="absolute bottom-1/4 left-1/4 text-emerald-300 text-xs animate-ping">✨</div>
    </div>
  );
};
