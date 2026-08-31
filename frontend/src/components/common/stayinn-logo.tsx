import React from 'react';

interface LogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  showText?: boolean;
}

export default function StayInnLogo({ className = '', size = 'md', showText = true }: LogoProps) {
  const iconSizes = {
    sm: 'w-7 h-7',
    md: 'w-9 h-9',
    lg: 'w-12 h-12',
  };

  const textSizes = {
    sm: 'text-lg',
    md: 'text-xl sm:text-2xl',
    lg: 'text-2xl sm:text-3xl',
  };

  return (
    <div className={`flex items-center gap-2.5 group select-none ${className}`}>
      {/* Brand Icon (Archway Door + Warm Hearth Flame) */}
      <div
        className={`${iconSizes[size]} rounded-2xl bg-gradient-to-br from-warm-terracotta to-warm-terracottaHover flex items-center justify-center shadow-cozy-sm p-1.5 group-hover:scale-105 transition-transform duration-500 ease-spring-smooth`}
      >
        <svg
          viewBox="0 0 32 32"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full text-warm-sand"
        >
          {/* Architectural Archway Door */}
          <path
            d="M6 28V14C6 8.47715 10.4772 4 16 4C21.5228 4 26 8.47715 26 14V28"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
          />
          {/* Inner Door Line & Keyhole */}
          <path
            d="M16 4V28"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeOpacity="0.4"
          />
          <circle cx="21" cy="17" r="1.2" fill="currentColor" />
          {/* Warm Hearth Flame at the center base */}
          <path
            d="M16 28C13.5 28 11.5 26 11.5 23.5C11.5 20.5 16 16.5 16 16.5C16 16.5 20.5 20.5 20.5 23.5C20.5 26 18.5 28 16 28Z"
            fill="#D97706"
          />
          <path
            d="M16 28C14.5 28 13.5 26.8 13.5 25.2C13.5 23.2 16 20.5 16 20.5C16 20.5 18.5 23.2 18.5 25.2C18.5 26.8 17.5 28 16 28Z"
            fill="#FEF3C7"
          />
        </svg>
      </div>

      {/* Brand Editorial Wordmark */}
      {showText && (
        <span className={`font-serif ${textSizes[size]} font-bold tracking-tight text-warm-dark`}>
          Stay<span className="text-warm-terracotta">Inn</span>
        </span>
      )}
    </div>
  );
}
