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
      className="fixed inset-0 z-50 flex flex-col items-center justify-center select-none bg-[var(--app-background)] text-[var(--text-primary)]"
      style={{
        height: '100dvh',
        paddingTop: 'env(safe-area-inset-top, 0px)',
        paddingBottom: 'env(safe-area-inset-bottom, 0px)'
      }}
    >
      <div className="relative flex flex-col items-center justify-center space-y-6">
        {/* Soft atmospheric ambient glow */}
        <div className="absolute w-32 h-32 rounded-full bg-[var(--accent-soft)] blur-3xl pointer-events-none" />

        {/* Real Yoe Logo with gentle, calm floating and breathing motion (~1.6x scaled up for brand presence) */}
        <div className="relative z-10 animate-bounce-subtle">
          <img
            src="/logo.png"
            alt="Yoe"
            className="w-[145px] h-[145px] sm:w-[170px] sm:h-[170px] object-contain drop-shadow-2xl"
          />
        </div>

        {/* Official Slogan with character typing animation — Signature Font */}
        <div className="relative z-10 text-center h-8 flex items-center justify-center">
          <p className="font-signature text-2xl sm:text-3xl font-bold tracking-wide text-[var(--accent-primary)]">
            {displayedText}
            {!isTypingComplete && (
              <span className="inline-block w-1 h-5 ml-1 bg-[var(--accent-primary)] rounded-sm animate-pulse align-middle" />
            )}
          </p>
        </div>
      </div>
    </div>
  );
};
