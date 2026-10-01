import React from 'react';

export const YoeLogo: React.FC<{
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showText?: boolean;
  className?: string;
}> = ({ size = 'md', className = '' }) => {
  const heightClasses =
    size === 'sm'
      ? 'h-7'
      : size === 'md'
      ? 'h-9'
      : size === 'lg'
      ? 'h-12'
      : 'h-16';

  return (
    <div className={`inline-flex items-center select-none group cursor-pointer ${className}`}>
      <picture>
        <source srcSet="/logo.webp" type="image/webp" />
        <img
          src="/logo.png"
          alt="Yoe"
          className={`${heightClasses} w-auto object-contain transition-transform duration-300 group-hover:scale-105 drop-shadow-[0_4px_12px_rgba(0,210,122,0.25)]`}
          loading="eager"
        />
      </picture>
    </div>
  );
};
