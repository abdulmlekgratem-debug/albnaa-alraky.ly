import React from 'react';

interface ProductListProps {
  children: React.ReactNode;
  ariaLabel?: string;
  className?: string;
}

export const ProductList: React.FC<ProductListProps> = ({
  children,
  ariaLabel = 'قائمة أسعار المنتجات',
  className = '',
}) => {
  return (
    <div
      role="list"
      aria-label={ariaLabel}
      className={`mx-auto w-full max-w-[900px] divide-y divide-surface-200/80 overflow-hidden rounded-xl border border-surface-200 bg-white shadow-subtle sm:rounded-2xl ${className}`}
    >
      {children}
    </div>
  );
};
