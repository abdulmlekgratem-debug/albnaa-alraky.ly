import React from 'react';

interface ProductIdBadgeProps {
  productId: string;
  className?: string;
}

export const ProductIdBadge: React.FC<ProductIdBadgeProps> = ({
  productId,
  className = '',
}) => (
  <span
    aria-label={`رقم الصنف: ${productId}`}
    className={`inline-flex w-fit items-center gap-1.5 rounded-lg border border-surface-200 bg-surface-50 px-2 py-1 text-[11px] font-bold leading-4 text-surface-600 ${className}`}
  >
    <span>رقم الصنف</span>
    <span dir="ltr" className="font-black tabular-nums text-brand-navy">{productId}</span>
  </span>
);
