import React, { useState, useEffect } from 'react';

const SLOGAN = 'Speak. Learn. Grow.';

export const AppBootLoader: React.FC = () => {
  const [displayedText, setDisplayedText] = useState('');
  const [isTypingComplete, setIsTypingComplete] = useState(false);

  useEffect(() => {
    // Check if user prefers reduced motion
    const prefersReducedMotion =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (prefersReducedMotion) {
      setDisplayedText(SLOGAN);
      setIsTypingComplete(true);
      return;
    }

    let currentIndex = 0;
    // Type out the slogan over ~1.1s (approx 55ms per character)
    const interval = setInterval(() => {
      currentIndex += 1;
      setDisplayedText(SLOGAN.slice(0, currentIndex));

      if (currentIndex >= SLOGAN.length) {
        clearInterval(interval);
        setIsTypingComplete(true);
      }
    }, 58);

    return () => clearInterval(interval);
  }, []);

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col items-center justify-center transition-opacity duration-500 select-none"
      style={{
        backgroundColor: 'var(--app-background, #070b12)',
        color: 'var(--text-primary, #f8fafc)',
        height: '100dvh',
        paddingTop: 'env(safe-area-inset-top, 0px)',
        paddingBottom: 'env(safe-area-inset-bottom, 0px)'
      }}
    >
      <div className="relative flex flex-col items-center justify-center space-y-6">
        {/* Soft atmospheric ambient glow */}
        <div className="absolute w-32 h-32 rounded-full bg-emerald-500/15 blur-3xl animate-pulse pointer-events-none" />

        {/* Real Yoe Logo with gentle, calm floating and breathing motion */}
        <div className="relative z-10 animate-bounce-subtle">
          <img
            src="/logo.png"
            alt="Yoe"
            className="w-20 h-20 md:w-24 md:h-24 object-contain drop-shadow-xl"
          />
        </div>

        {/* Official Slogan with character typing animation — Pure Manrope */}
        <div className="relative z-10 text-center h-7 flex items-center justify-center">
          <p className="font-brand text-xs sm:text-sm font-extrabold uppercase tracking-widest text-emerald-400 dark:text-emerald-400 light-mode:text-emerald-600">
            {displayedText}
            {!isTypingComplete && (
              <span className="inline-block w-1.5 h-3.5 ml-1 bg-emerald-400/80 rounded-sm animate-pulse align-middle" />
            )}
          </p>
        </div>
      </div>
    </div>
  );
};
