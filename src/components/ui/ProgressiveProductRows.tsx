import React, { useEffect, useMemo, useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { ProductDTO } from '../../types/product';
import { ProductList } from './ProductList';
import { ProductRow } from './ProductRow';

interface ProgressiveProductRowsProps {
  products: ProductDTO[];
  ariaLabel: string;
  showCategory?: boolean;
  highlightSpec?: string;
  pageSize?: number;
  resetKey?: string;
}

export const ProgressiveProductRows: React.FC<ProgressiveProductRowsProps> = ({
  products,
  ariaLabel,
  showCategory = false,
  highlightSpec,
  pageSize = 8,
  resetKey = '',
}) => {
  const [visibleCount, setVisibleCount] = useState(pageSize);

  useEffect(() => {
    setVisibleCount(pageSize);
  }, [pageSize, resetKey, products]);

  const visibleProducts = useMemo(
    () => products.slice(0, visibleCount),
    [products, visibleCount],
  );
  const remaining = Math.max(0, products.length - visibleProducts.length);
  const nextCount = Math.min(pageSize, remaining);

  return (
    <div className="space-y-3">
      <ProductList ariaLabel={ariaLabel}>
        {visibleProducts.map((product) => (
          <ProductRow
            key={product.id}
            product={product}
            showCategory={showCategory}
            highlightSpec={highlightSpec}
          />
        ))}
      </ProductList>

      {remaining > 0 && (
        <div className="rounded-2xl border border-surface-200 bg-white p-2 shadow-subtle">
          <button
            type="button"
            onClick={() => setVisibleCount((current) => current + pageSize)}
            className="flex min-h-[52px] w-full items-center justify-center gap-2 rounded-xl bg-brand-navy px-4 text-sm font-black text-white transition-colors hover:bg-brand-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-navy focus-visible:ring-offset-2 sm:text-base"
          >
            <ChevronDown className="h-5 w-5" aria-hidden="true" />
            <span>عرض {nextCount} أصناف إضافية</span>
            <span className="rounded-full bg-white/15 px-2.5 py-1 text-xs font-extrabold text-white/85">
              المتبقي {remaining}
            </span>
          </button>
        </div>
      )}

      {products.length > pageSize && (
        <p className="text-center text-xs font-bold text-surface-500" aria-live="polite">
          يظهر الآن {visibleProducts.length} من أصل {products.length} صنفًا
        </p>
      )}
    </div>
  );
};
