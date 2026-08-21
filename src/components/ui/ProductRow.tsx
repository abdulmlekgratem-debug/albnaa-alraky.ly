import React from 'react';
import { ProductDTO } from '../../types/product';
import { getProductSubtitle } from '../../lib/productPresentation';
import { PriceDisplay } from './PriceDisplay';
import { ProductImage } from './ProductImage';
import { PriceActions } from './PriceActions';

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
    <div role="listitem" className={`px-3.5 py-4 sm:px-5 sm:py-5 ${className}`}>
      <div className="grid grid-cols-[112px_minmax(0,1fr)] items-start gap-x-4 text-right sm:grid-cols-[128px_minmax(0,1fr)] md:gap-x-5">
        <ProductImage
          product={product}
          size="sm"
          className="col-start-1 row-start-1"
        />

        <div className="col-start-2 row-start-1 min-w-0">
          <h3 className="break-words text-lg font-black leading-7 text-surface-900 sm:text-xl sm:leading-8">
            {product.name}
          </h3>
          {subtitle && (
            <p className="mt-1.5 break-words text-[15px] font-semibold leading-6 text-surface-600 sm:text-base">
              {subtitle}
            </p>
          )}
        </div>

        <div className="col-span-2 col-start-1 mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-surface-200 pt-3.5">
          <PriceDisplay
            price={product.price}
            unit={product.unit}
            available={product.available}
            size="md"
          />
          <PriceActions product={product} compact />
        </div>
      </div>
    </div>
  );
};
