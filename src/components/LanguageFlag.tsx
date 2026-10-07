import React from 'react';
import { LanguageCode } from '../types';

export type FlagSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'custom';

interface LanguageFlagProps {
  code: LanguageCode | string;
  size?: FlagSize;
  className?: string;
  alt?: string;
  title?: string;
}

const sizeClasses: Record<FlagSize, string> = {
  xs: 'w-4 h-3 rounded-[2px]',
  sm: 'w-5 h-3.5 rounded-[3px]',
  md: 'w-6 h-4.5 rounded-[4px]',
  lg: 'w-8 h-6 rounded-md',
  xl: 'w-10 h-7.5 rounded-lg',
  '2xl': 'w-12 h-9 rounded-lg',
  custom: ''
};

export const LanguageFlag: React.FC<LanguageFlagProps> = ({
  code,
  size = 'md',
  className = '',
  alt,
  title
}) => {
  const normalizedCode = code?.toLowerCase() || 'en';
  const sizeClass = size === 'custom' ? '' : sizeClasses[size] || sizeClasses.md;

  const accessibleTitle =
    title ||
    alt ||
    (normalizedCode === 'en'
      ? 'English flag'
      : normalizedCode === 'fr'
      ? 'French flag'
      : normalizedCode === 'es'
      ? 'Spanish flag'
      : normalizedCode === 'ru'
      ? 'Russian flag'
      : normalizedCode === 'ar'
      ? 'Arabic flag'
      : normalizedCode === 'it'
      ? 'Italian flag'
      : normalizedCode === 'tr'
      ? 'Turkish flag'
      : normalizedCode === 'pt'
      ? 'Portuguese flag'
      : normalizedCode === 'de'
      ? 'German flag'
      : normalizedCode === 'ja'
      ? 'Japanese flag'
      : normalizedCode === 'ko'
      ? 'Korean flag'
      : normalizedCode === 'zh'
      ? 'Chinese flag'
      : `${normalizedCode.toUpperCase()} flag`);

  const renderFlagSvg = () => {
    switch (normalizedCode) {
      case 'en':
        // United Kingdom / English Flag (precision Union Jack SVG)
        return (
          <svg
            viewBox="0 0 60 40"
            className="w-full h-full object-cover shrink-0"
            xmlns="http://www.w3.org/2000/svg"
            role="img"
            aria-label={accessibleTitle}
          >
            <title>{accessibleTitle}</title>
            <clipPath id="uk-clip">
              <rect width="60" height="40" rx="2" />
            </clipPath>
            <g clipPath="url(#uk-clip)">
              {/* Blue field */}
              <rect width="60" height="40" fill="#012169" />
              {/* White saltire base */}
              <path d="M0,0 L60,40 M60,0 L0,40" stroke="#FFFFFF" strokeWidth="8" />
              {/* Red saltire (St Patrick) counterchanged */}
              <path d="M0,0 L30,20 M60,40 L30,20" stroke="#C8102E" strokeWidth="2.6" />
              <path d="M60,0 L30,20 M0,40 L30,20" stroke="#C8102E" strokeWidth="2.6" />
              {/* White cross (St George broad base) */}
              <path d="M30,0 v40 M0,20 h60" stroke="#FFFFFF" strokeWidth="12" />
              {/* Red cross (St George) */}
              <path d="M30,0 v40 M0,20 h60" stroke="#C8102E" strokeWidth="7" />
            </g>
          </svg>
        );

      case 'fr':
        // France Flag (blue, white, red tricolor)
        return (
          <svg
            viewBox="0 0 60 40"
            className="w-full h-full object-cover shrink-0"
            xmlns="http://www.w3.org/2000/svg"
            role="img"
            aria-label={accessibleTitle}
          >
            <title>{accessibleTitle}</title>
            <rect width="20" height="40" fill="#002654" />
            <rect x="20" width="20" height="40" fill="#FFFFFF" />
            <rect x="40" width="20" height="40" fill="#ED2939" />
          </svg>
        );

      case 'es':
        // Spain Flag (red, gold, red with Spanish coat/pillar motif)
        return (
          <svg
            viewBox="0 0 60 40"
            className="w-full h-full object-cover shrink-0"
            xmlns="http://www.w3.org/2000/svg"
            role="img"
            aria-label={accessibleTitle}
          >
            <title>{accessibleTitle}</title>
            <rect width="60" height="10" fill="#AA151B" />
            <rect y="10" width="60" height="20" fill="#F1BF00" />
            <rect y="30" width="60" height="10" fill="#AA151B" />
            {/* Spanish Coat of Arms emblem */}
            <g transform="translate(14, 13) scale(0.65)">
              <rect x="0" y="3" width="10" height="12" rx="1" fill="#AA151B" />
              <path d="M1,4 h8 v6 a4,4 0 0,1 -8,0 z" fill="#D4AF37" stroke="#800000" strokeWidth="0.5" />
              <path d="M1,4 h4 v4 h-4 z" fill="#AA151B" />
              <path d="M5,4 h4 v4 h-4 z" fill="#F1BF00" />
              <path d="M1,8 h4 v3 h-4 z" fill="#F1BF00" />
              <path d="M5,8 h4 v3 h-4 z" fill="#AA151B" />
              {/* Crown */}
              <path d="M2,3 L3,1 L5,2 L7,1 L8,3 Z" fill="#D4AF37" />
              <circle cx="5" cy="1" r="0.6" fill="#D4AF37" />
            </g>
          </svg>
        );

      case 'ru':
        // Russian Flag (white, blue, red horizontal tricolor)
        return (
          <svg
            viewBox="0 0 60 40"
            className="w-full h-full object-cover shrink-0"
            xmlns="http://www.w3.org/2000/svg"
            role="img"
            aria-label={accessibleTitle}
          >
            <title>{accessibleTitle}</title>
            <rect width="60" height="13.33" fill="#FFFFFF" />
            <rect y="13.33" width="60" height="13.34" fill="#0039A6" />
            <rect y="26.67" width="60" height="13.33" fill="#D52B1E" />
          </svg>
        );

      case 'ar':
        // Arabic / Pan-Arab representation (Deep green with elegant calligraphy & white sword geometry)
        return (
          <svg
            viewBox="0 0 60 40"
            className="w-full h-full object-cover shrink-0"
            xmlns="http://www.w3.org/2000/svg"
            role="img"
            aria-label={accessibleTitle}
          >
            <title>{accessibleTitle}</title>
            <rect width="60" height="40" fill="#006C35" />
            {/* Arabic Script & Sword vector styling */}
            <g fill="#FFFFFF" transform="translate(10, 8)">
              {/* Flowing calligraphy emblem representation */}
              <path d="M5,8 Q10,2 18,7 Q25,3 32,8 Q35,4 37,9 Q32,13 25,10 Q16,14 5,8 Z" opacity="0.95" />
              <circle cx="12" cy="5" r="1.2" />
              <circle cx="20" cy="4" r="1.2" />
              <circle cx="28" cy="5" r="1.2" />
              {/* Traditional Arab sword */}
              <rect x="6" y="16" width="28" height="1.8" rx="0.9" />
              <path d="M34,16 L37,16.9 L34,17.8 Z" />
              <rect x="7" y="14" width="2" height="5.8" rx="0.5" />
              <circle cx="5" cy="16.9" r="1.2" />
            </g>
          </svg>
        );

      case 'it':
        // Italy Flag (green, white, red vertical tricolor)
        return (
          <svg
            viewBox="0 0 60 40"
            className="w-full h-full object-cover shrink-0"
            xmlns="http://www.w3.org/2000/svg"
            role="img"
            aria-label={accessibleTitle}
          >
            <title>{accessibleTitle}</title>
            <rect width="20" height="40" fill="#009246" />
            <rect x="20" width="20" height="40" fill="#FFFFFF" />
            <rect x="40" width="20" height="40" fill="#CE2B37" />
          </svg>
        );

      case 'tr':
        // Turkey Flag (red with crisp white crescent moon and 5-pointed star)
        return (
          <svg
            viewBox="0 0 60 40"
            className="w-full h-full object-cover shrink-0"
            xmlns="http://www.w3.org/2000/svg"
            role="img"
            aria-label={accessibleTitle}
          >
            <title>{accessibleTitle}</title>
            <rect width="60" height="40" fill="#E30A17" />
            {/* White Crescent Moon */}
            <path
              d="M26,9 A11,11 0 1,0 26,31 A8.8,8.8 0 1,1 26,9 Z"
              fill="#FFFFFF"
            />
            {/* 5-pointed Star */}
            <polygon
              points="34,16 35.5,19.5 39,19.5 36.2,21.8 37.2,25.3 34,23 30.8,25.3 31.8,21.8 29,19.5 32.5,19.5"
              fill="#FFFFFF"
              transform="rotate(18, 34, 20.6)"
            />
          </svg>
        );

      case 'pt':
        // Portugal Flag (green 2/5, red 3/5 with Armillary Sphere and Portuguese Shield)
        return (
          <svg
            viewBox="0 0 60 40"
            className="w-full h-full object-cover shrink-0"
            xmlns="http://www.w3.org/2000/svg"
            role="img"
            aria-label={accessibleTitle}
          >
            <title>{accessibleTitle}</title>
            <rect width="24" height="40" fill="#046A38" />
            <rect x="24" width="36" height="40" fill="#DA291C" />
            {/* Yellow Armillary Sphere */}
            <circle cx="24" cy="20" r="8" fill="#FFC400" />
            <circle cx="24" cy="20" r="6.8" fill="#046A38" />
            <circle cx="24" cy="20" r="5.6" fill="#DA291C" />
            {/* Central White and Blue Portuguese Shield */}
            <path d="M21,16 h6 v5 a3,3 0 0,1 -6,0 z" fill="#FFFFFF" stroke="#DA291C" strokeWidth="0.6" />
            <circle cx="24" cy="18.5" r="1.2" fill="#0039A6" />
          </svg>
        );

      case 'de':
        // Germany Flag (black, red, gold)
        return (
          <svg
            viewBox="0 0 60 40"
            className="w-full h-full object-cover shrink-0"
            xmlns="http://www.w3.org/2000/svg"
            role="img"
            aria-label={accessibleTitle}
          >
            <title>{accessibleTitle}</title>
            <rect width="60" height="13.33" fill="#000000" />
            <rect y="13.33" width="60" height="13.34" fill="#DD0000" />
            <rect y="26.67" width="60" height="13.33" fill="#FFCE00" />
          </svg>
        );

      case 'ja':
        // Japan Flag (white with crimson red sun disc)
        return (
          <svg
            viewBox="0 0 60 40"
            className="w-full h-full object-cover shrink-0"
            xmlns="http://www.w3.org/2000/svg"
            role="img"
            aria-label={accessibleTitle}
          >
            <title>{accessibleTitle}</title>
            <rect width="60" height="40" fill="#FFFFFF" />
            <circle cx="30" cy="20" r="11" fill="#BC002D" />
          </svg>
        );

      case 'zh':
        // China Flag (red with five golden yellow stars)
        return (
          <svg
            viewBox="0 0 60 40"
            className="w-full h-full object-cover shrink-0"
            xmlns="http://www.w3.org/2000/svg"
            role="img"
            aria-label={accessibleTitle}
          >
            <title>{accessibleTitle}</title>
            <rect width="60" height="40" fill="#EE1C25" />
            <polygon points="10,6 12,12 18,12 13.5,15.5 15.5,21 10,17.5 4.5,21 6.5,15.5 2,12 8,12" fill="#FFFF00" />
            <circle cx="20" cy="6" r="1.5" fill="#FFFF00" />
            <circle cx="24" cy="10" r="1.5" fill="#FFFF00" />
            <circle cx="24" cy="16" r="1.5" fill="#FFFF00" />
            <circle cx="20" cy="20" r="1.5" fill="#FFFF00" />
          </svg>
        );

      default:
        // Universal Language Globe representation
        return (
          <svg
            viewBox="0 0 60 40"
            className="w-full h-full object-cover shrink-0"
            xmlns="http://www.w3.org/2000/svg"
            role="img"
            aria-label={accessibleTitle}
          >
            <title>{accessibleTitle}</title>
            <rect width="60" height="40" fill="#0F766E" />
            <circle cx="30" cy="20" r="12" fill="#14B8A6" stroke="#FFFFFF" strokeWidth="1.5" />
            <ellipse cx="30" cy="20" rx="6" ry="12" fill="none" stroke="#FFFFFF" strokeWidth="1.2" />
            <line x1="18" y1="20" x2="42" y2="20" stroke="#FFFFFF" strokeWidth="1.2" />
          </svg>
        );
    }
  };

  return (
    <div
      className={`inline-flex items-center justify-center overflow-hidden border border-slate-900/10 dark:border-white/20 shadow-xs shrink-0 aspect-[4/3] select-none ${sizeClass} ${className}`}
      title={accessibleTitle}
      aria-label={accessibleTitle}
    >
      {renderFlagSvg()}
    </div>
  );
};
