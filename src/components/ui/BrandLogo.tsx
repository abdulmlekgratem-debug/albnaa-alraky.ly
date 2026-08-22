import React from 'react';
import { Link } from 'react-router-dom';
import { BRAND } from '../../lib/constants';

interface BrandLogoProps {
  compact?: boolean;
  showTagline?: boolean;
  className?: string;
  theme?: 'light' | 'dark';
  prominent?: boolean;
}

export const BrandLogo: React.FC<BrandLogoProps> = ({
  compact = false,
  showTagline = true,
  className = '',
  theme = 'light',
  prominent = false,
}) => {
  const isDark = theme === 'dark';

  return (
    <Link
      to="/"
      aria-label="الصفحة الرئيسية - شركة البناء الراقي الجديد"
      className={`group flex items-center gap-2.5 transition-opacity active:opacity-85 sm:gap-3 ${className}`}
    >
      <img
        src="/images/brand/al-binaa-al-raqi-mark.png"
        alt=""
        width="56"
        height="56"
        className={`${prominent ? 'h-14 w-14 sm:h-[68px] sm:w-[68px]' : 'h-11 w-11 sm:h-14 sm:w-14'} flex-shrink-0 object-contain ${
          isDark ? 'brightness-0 invert' : ''
        }`}
      />

      <div className={`flex min-w-0 flex-col justify-center border-r pr-2.5 sm:pr-3 ${
        isDark ? 'border-white/25' : 'border-surface-300'
      }`}>
        <span className={`truncate font-extrabold leading-tight transition-colors ${prominent ? 'text-base sm:text-xl' : 'text-[13px] min-[390px]:text-sm sm:text-lg'} ${
          isDark ? 'text-white' : 'text-surface-900 group-hover:text-brand-navy'
        }`}>
          {compact ? BRAND.shortName : BRAND.name}
        </span>
        {showTagline && (
          <span className={`mt-1 hidden truncate font-medium leading-none min-[390px]:block ${prominent ? 'text-[11px] sm:text-xs' : 'text-[10px] sm:text-[11px]'} ${
            isDark ? 'text-surface-300' : 'text-surface-500'
          }`}>
            {BRAND.tagline}
          </span>
        )}
      </div>
    </Link>
  );
};
