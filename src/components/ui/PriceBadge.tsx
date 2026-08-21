import React from 'react';
import { BRAND } from '../../lib/constants';

interface PriceBadgeProps {
  price: number | null | undefined;
  unit?: string | null;
  size?: 'sm' | 'md' | 'lg' | 'hero';
  className?: string;
  showUnit?: boolean;
}

export const PriceBadge: React.FC<PriceBadgeProps> = ({
  price,
  unit,
  size = 'md',
  className = '',
  showUnit = true,
}) => {
  const isAvailable = price !== null && price !== undefined && price > 0;

  if (!isAvailable) {
    return (
      <span
        className={`inline-block px-2.5 py-1 rounded-lg bg-surface-100 text-surface-500 font-semibold text-xs ${className}`}
      >
        غير متوفر حاليًا
      </span>
    );
  }

  // Format the number part
  const isInteger = Number.isInteger(price);
  const formattedNumber = new Intl.NumberFormat('en-US', {
    minimumFractionDigits: isInteger ? 0 : 2,
    maximumFractionDigits: 2,
  }).format(price);

  const rawUnit = (unit || '').trim();
  const hasUnit = showUnit && rawUnit.length > 0 && rawUnit !== 'غير محددة';
  const cleanUnit = hasUnit ? (rawUnit.startsWith('/') ? rawUnit : `/ ${rawUnit}`) : '';

  if (size === 'hero') {
    return (
      <div className={`flex flex-wrap items-baseline gap-x-2 gap-y-1 ${className}`}>
        {/* 1. السعر */}
        <span className="font-extrabold text-3xl sm:text-4xl text-brand-navy tracking-tight">
          {formattedNumber}
        </span>
        {/* 2. العملة */}
        <span className="font-bold text-base sm:text-lg text-surface-700">
          {BRAND.currency}
        </span>
        {/* 3. وحدة القياس */}
        {hasUnit && (
          <span className="text-sm sm:text-base font-semibold text-surface-500">
            {cleanUnit}
          </span>
        )}
      </div>
    );
  }

  if (size === 'lg') {
    return (
      <div className={`flex flex-wrap items-baseline gap-x-1.5 gap-y-1 ${className}`}>
        {/* 1. السعر */}
        <span className="font-bold text-2xl sm:text-3xl text-brand-navy">
          {formattedNumber}
        </span>
        {/* 2. العملة */}
        <span className="font-bold text-sm sm:text-base text-surface-700">
          {BRAND.currency}
        </span>
        {/* 3. وحدة القياس */}
        {hasUnit && (
          <span className="text-xs sm:text-sm font-medium text-surface-500">
            {cleanUnit}
          </span>
        )}
      </div>
    );
  }

  if (size === 'sm') {
    return (
      <div className={`flex flex-wrap items-baseline gap-x-1 gap-y-0.5 ${className}`}>
        {/* 1. السعر */}
        <span className="font-bold text-base sm:text-lg text-brand-navy">
          {formattedNumber}
        </span>
        {/* 2. العملة */}
        <span className="font-bold text-xs text-surface-700">
          {BRAND.currency}
        </span>
        {/* 3. وحدة القياس */}
        {hasUnit && (
          <span className="text-[11px] text-surface-500 font-medium">
            {cleanUnit}
          </span>
        )}
      </div>
    );
  }

  // Default 'md'
  return (
    <div className={`flex flex-wrap items-baseline gap-x-1.5 gap-y-0.5 ${className}`}>
      {/* 1. السعر */}
      <span className="font-bold text-lg sm:text-xl text-brand-navy">
        {formattedNumber}
      </span>
      {/* 2. العملة */}
      <span className="font-bold text-xs sm:text-sm text-surface-700">
        {BRAND.currency}
      </span>
      {/* 3. وحدة القياس */}
      {hasUnit && (
        <span className="text-xs text-surface-500 font-medium">
          {cleanUnit}
        </span>
      )}
    </div>
  );
};
