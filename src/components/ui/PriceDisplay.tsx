import React from 'react';
import { BRAND } from '../../lib/constants';

interface PriceDisplayProps {
  price: number | null | undefined;
  unit?: string | null;
  available?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const PriceDisplay: React.FC<PriceDisplayProps> = ({
  price,
  unit,
  available = true,
  size = 'md',
  className = '',
}) => {
  const isPriceValid = available && price !== null && price !== undefined && price > 0;

  if (!isPriceValid) {
    return (
      <div
        aria-label="السعر غير متوفر حاليًا"
        className={`flex min-w-0 flex-row items-baseline gap-1 text-start ${className}`}
      >
        <span className={`${size === 'lg' ? 'text-base sm:text-lg' : 'text-xs sm:text-sm'} font-bold leading-5 text-surface-600`}>
          غير متوفر حاليًا
        </span>
      </div>
    );
  }

  // Format integer or decimal price with thousands separators
  const isInteger = Number.isInteger(price);
  const formattedNumber = new Intl.NumberFormat('en-US', {
    minimumFractionDigits: isInteger ? 0 : 2,
    maximumFractionDigits: 2,
  }).format(price);

  // Clean unit string (empty if "غير محددة" or blank)
  const rawUnit = (unit || '').trim();
  const hasUnit = rawUnit.length > 0 && rawUnit !== 'غير محددة';
  const cleanUnit = hasUnit ? (rawUnit.startsWith('/') ? rawUnit : `/ ${rawUnit}`) : '';

  if (size === 'lg') {
    return (
      <div className={`flex flex-wrap items-baseline gap-x-2 gap-y-1 text-start ${className}`}>
        {/* 1. السعر */}
        <span className="tabular-nums text-3xl font-extrabold tracking-tight text-brand-navy sm:text-4xl">
          {formattedNumber}
        </span>
        {/* 2. العملة */}
        <span className="text-base font-bold text-surface-700 sm:text-xl">
          {BRAND.currency}
        </span>
        {/* 3. وحدة القياس */}
        {hasUnit && (
          <span className="text-sm font-semibold text-surface-500 sm:text-base">
            {cleanUnit}
          </span>
        )}
      </div>
    );
  }

  if (size === 'sm') {
    return (
      <div className={`flex flex-wrap items-baseline gap-x-1 gap-y-0.5 text-start ${className}`}>
        {/* 1. السعر */}
        <span className="tabular-nums text-base font-bold text-brand-navy">
          {formattedNumber}
        </span>
        {/* 2. العملة */}
        <span className="text-xs font-bold text-surface-700">
          {BRAND.currency}
        </span>
        {/* 3. وحدة القياس */}
        {hasUnit && (
          <span className="text-[11px] font-medium text-surface-500">
            {cleanUnit}
          </span>
        )}
      </div>
    );
  }

  // Default 'md' (Standard Row Price Display)
  return (
    <div className={`flex flex-wrap items-baseline gap-x-1.5 gap-y-0.5 text-start ${className}`}>
      {/* 1. السعر */}
      <span className="tabular-nums text-xl font-black leading-7 tracking-tight text-brand-navy sm:text-2xl">
        {formattedNumber}
      </span>
      {/* 2. العملة */}
      <span className="text-sm font-bold leading-5 text-surface-700 sm:text-base">
        {BRAND.currency}
      </span>
      {/* 3. وحدة القياس */}
      {hasUnit && (
        <span className="text-xs font-semibold leading-5 text-surface-600 sm:text-sm">
          {cleanUnit}
        </span>
      )}
    </div>
  );
};
