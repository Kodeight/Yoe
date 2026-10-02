import React from 'react';

export const AppBootLoader: React.FC = () => {
  return (
    <div
      className="fixed inset-0 z-50 flex flex-col items-center justify-center transition-opacity duration-300 select-none"
      style={{
        backgroundColor: 'var(--app-background, #070b12)',
        color: 'var(--text-primary, #f8fafc)',
        height: '100dvh',
        paddingTop: 'env(safe-area-inset-top, 0px)',
        paddingBottom: 'env(safe-area-inset-bottom, 0px)'
      }}
    >
      <div className="relative flex flex-col items-center justify-center space-y-6">
        {/* Subtle floating glow backdrop */}
        <div className="absolute w-28 h-28 rounded-full bg-emerald-500/15 blur-2xl animate-pulse pointer-events-none" />

        {/* Yoe Logo with gentle floating/breathing animation */}
        <div className="relative z-10 animate-bounce-subtle">
          <img
            src="/logo.png"
            alt="Yoe"
            className="w-16 h-16 md:w-20 md:h-20 object-contain drop-shadow-lg"
          />
        </div>

        {/* Minimalist branding text */}
        <div className="text-center space-y-1 z-10">
          <h1 className="text-sm font-black tracking-widest uppercase text-emerald-400 font-brand">
            Yoe
          </h1>
          <p className="text-[11px] text-[var(--text-secondary)] font-medium tracking-wide">
            Restoring your learning journey...
          </p>
        </div>
      </div>
    </div>
  );
};
