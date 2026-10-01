import React from 'react';

export type OrbState = 'idle' | 'listening' | 'thinking' | 'speaking' | 'success' | 'error';

interface YoeOrbProps {
  state?: OrbState;
  size?: 'sm' | 'md' | 'lg' | 'hero';
  interactive?: boolean;
  onClick?: () => void;
  className?: string;
}

export const YoeOrb: React.FC<YoeOrbProps> = ({
  state = 'idle',
  size = 'md',
  interactive = false,
  onClick,
  className = ''
}) => {
  // Dimension sizing
  const dimensions = {
    sm: 'w-24 h-24',
    md: 'w-44 h-44',
    lg: 'w-56 h-56',
    hero: 'w-64 h-64 sm:w-72 sm:h-72'
  }[size];

  // Glow color scheme per state
  const glowStyles = {
    idle: 'from-emerald-500/20 via-teal-400/20 to-cyan-500/20 animate-orb-idle',
    listening: 'from-cyan-500/40 via-sky-400/35 to-emerald-400/35 animate-orb-listening',
    thinking: 'from-teal-400/40 via-cyan-500/35 to-indigo-500/30 animate-orb-thinking',
    speaking: 'from-emerald-400/45 via-teal-300/40 to-cyan-400/45 animate-orb-speaking',
    success: 'from-emerald-400/50 via-green-300/40 to-teal-400/40 scale-105',
    error: 'from-amber-500/30 via-rose-500/25 to-red-500/20'
  }[state];

  // Core internal gradient per state
  const coreGradients = {
    idle: 'from-[#0b243b] via-[#094154] to-[#046153]',
    listening: 'from-[#082d4c] via-[#085a73] to-[#0d7864]',
    thinking: 'from-[#0a203b] via-[#103a63] to-[#075c61]',
    speaking: 'from-[#063346] via-[#086a67] to-[#10b981]',
    success: 'from-[#06423b] via-[#08775e] to-[#10b981]',
    error: 'from-[#3b1218] via-[#5c1c24] to-[#802a2a]'
  }[state];

  // State label pill (discrete, high-end Apple style)
  const stateLabels: Record<OrbState, { text: string; dotColor: string }> = {
    idle: { text: 'Yoe Presence', dotColor: 'bg-emerald-400' },
    listening: { text: 'Listening...', dotColor: 'bg-cyan-400 animate-ping' },
    thinking: { text: 'Processing...', dotColor: 'bg-teal-300 animate-spin' },
    speaking: { text: 'Yoe is speaking', dotColor: 'bg-emerald-300 animate-pulse' },
    success: { text: 'Objective Met!', dotColor: 'bg-emerald-400' },
    error: { text: 'Connection Note', dotColor: 'bg-amber-400' }
  };

  return (
    <div
      onClick={interactive ? onClick : undefined}
      className={`relative ${dimensions} mx-auto flex items-center justify-center select-none ${
        interactive ? 'cursor-pointer active:scale-95 transition-transform' : ''
      } ${className}`}
    >
      {/* Multi-layered ambient depth glow */}
      <div
        className={`absolute inset-0 rounded-full bg-gradient-to-tr ${glowStyles} blur-2xl opacity-80 pointer-events-none transition-all duration-700`}
      />

      {/* Outer Liquid Glass Capsule Ring */}
      <div className="relative w-full h-full rounded-full p-2 bg-white/10 dark:bg-slate-900/40 backdrop-blur-2xl border border-white/20 dark:border-white/10 shadow-[0_16px_50px_-12px_rgba(0,0,0,0.5)] flex items-center justify-center overflow-hidden">
        {/* Internal Fluid Core */}
        <div
          className={`relative w-full h-full rounded-full bg-gradient-to-br ${coreGradients} border border-white/20 dark:border-white/15 shadow-[inset_0_0_50px_rgba(0,240,181,0.25)] flex items-center justify-center overflow-hidden transition-all duration-500`}
        >
          {/* Internal orbital light filaments */}
          <div className="absolute inset-0 rounded-full border border-teal-300/15 rotate-45 scale-90" />
          <div className="absolute inset-0 rounded-full border border-cyan-300/10 -rotate-30 scale-95" />

          {/* Dynamic state center visualization */}
          <div className="relative z-10 flex items-center justify-center gap-1.5">
            {state === 'listening' ? (
              <div className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-black/40 backdrop-blur-md border border-cyan-400/30">
                <span className="w-1.5 h-6 rounded-full bg-cyan-400 animate-pulse" />
                <span className="w-1.5 h-9 rounded-full bg-teal-300 animate-pulse delay-75" />
                <span className="w-1.5 h-4 rounded-full bg-emerald-400 animate-pulse delay-150" />
                <span className="w-1.5 h-7 rounded-full bg-sky-300 animate-pulse delay-100" />
              </div>
            ) : state === 'thinking' ? (
              <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-black/40 backdrop-blur-md border border-teal-300/30">
                <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
                <span className="w-2 h-2 rounded-full bg-teal-300 animate-pulse delay-100" />
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse delay-200" />
              </div>
            ) : state === 'speaking' ? (
              <div className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-black/40 backdrop-blur-md border border-emerald-400/30">
                <span className="w-1.5 h-4 rounded-full bg-emerald-400 animate-pulse" />
                <span className="w-1.5 h-8 rounded-full bg-teal-300 animate-pulse delay-100" />
                <span className="w-1.5 h-10 rounded-full bg-cyan-300 animate-pulse delay-200" />
                <span className="w-1.5 h-6 rounded-full bg-emerald-300 animate-pulse delay-300" />
              </div>
            ) : (
              <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-black/30 dark:bg-black/40 backdrop-blur-md border border-white/15 text-xs font-semibold text-white/90">
                <span className={`w-2 h-2 rounded-full ${stateLabels[state].dotColor}`} />
                <span className="text-[11px] tracking-wide">{stateLabels[state].text}</span>
              </div>
            )}
          </div>

          {/* Liquid Glass Specular Top Highlight */}
          <div className="absolute top-0 left-4 right-4 h-1/2 bg-gradient-to-b from-white/30 via-white/5 to-transparent rounded-t-full pointer-events-none" />
          
          {/* Subtle bottom ambient reflection */}
          <div className="absolute bottom-0 left-6 right-6 h-1/4 bg-gradient-to-t from-teal-400/20 to-transparent rounded-b-full pointer-events-none" />
        </div>
      </div>
    </div>
  );
};
