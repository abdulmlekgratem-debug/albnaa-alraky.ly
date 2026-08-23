import React from 'react';
import { Clock3 } from 'lucide-react';
import { ProductDTO } from '../../types/product';
import { getProductSubtitle } from '../../lib/productPresentation';
import { formatArabicDate } from '../../lib/formatters';
import { PriceDisplay } from './PriceDisplay';
import { ProductImage } from './ProductImage';
import { PriceActions } from './PriceActions';
import { ProductIdBadge } from './ProductIdBadge';

export interface ProductRowProps {
  product: ProductDTO;
  showCategory?: boolean;
  highlightSpec?: string;
  className?: string;
  backTo?: string;
  backLabel?: string;
}

export const ProductRow: React.FC<ProductRowProps> = ({
  product,
  showCategory = false,
  highlightSpec,
  className = '',
}) => {
  const subtitle = getProductSubtitle(product, showCategory, highlightSpec);

  // Customer-facing lists contain available, positively priced products only.
  if (!product.available || product.price === null || product.price <= 0) {
    return null;
  }

  return (
    <div role="listitem" className={`overflow-hidden ${className}`}>
      <div className="flex min-h-[196px] items-stretch text-right sm:min-h-[204px]">
        <ProductImage product={product} size="row" className="self-stretch flex-none" />

        <div className="flex min-w-0 flex-1 flex-col p-3 sm:p-4">
          <div className="min-w-0">
            <ProductIdBadge productId={product.id} className="mb-1.5" />
            <h3 className="line-clamp-2 break-words text-lg font-black leading-8 text-surface-900 sm:text-xl sm:leading-9">
              {product.name}
            </h3>
            {subtitle && (
              <p className="mt-0.5 line-clamp-1 break-words text-sm font-semibold leading-5 text-surface-600 sm:text-[15px]">
                {subtitle}
              </p>
            )}
          </div>

          <PriceDisplay
            price={product.price}
            unit={product.unit}
            available={product.available}
            size="lg"
            stackUnit
            className="mt-2.5"
          />

          {product.updatedAt && (
            <p
              className="mt-1.5 flex min-w-0 items-center gap-1.5 text-xs font-semibold leading-5 text-surface-500"
              aria-label={`آخر تحديث: ${formatArabicDate(product.updatedAt)}`}
            >
              <Clock3 className="h-3.5 w-3.5 flex-none" aria-hidden="true" />
              <span className="break-words">آخر تحديث: {formatArabicDate(product.updatedAt)}</span>
            </p>
          )}

          <PriceActions
            product={product}
            compact
            fill
            className="mt-auto border-t border-surface-200 pt-2"
          />
        </div>
      </div>
    </div>
  );
};
