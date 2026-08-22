import React, { useState } from 'react';
import { getProductImage } from '../../lib/categoryAssets';
import { ProductDTO } from '../../types/product';

interface ProductImageProps {
  product: ProductDTO;
  size?: 'sm' | 'md' | 'lg' | 'row' | 'hero';
  className?: string;
  loading?: 'lazy' | 'eager';
}

export const ProductImage: React.FC<ProductImageProps> = ({
  product,
  size = 'md',
  className = '',
  loading = 'lazy',
}) => {
  const [hasError, setHasError] = useState(false);
  const fallbackSrc = getProductImage(product.category, product.subcategory);
  const imgSrc = hasError ? fallbackSrc : (product.imageUrl || fallbackSrc);

  const sizeClasses = {
    sm: 'h-28 w-28 rounded-2xl p-1 sm:h-32 sm:w-32',
    md: 'w-14 h-14 sm:w-16 sm:h-16 rounded-xl p-1.5',
    lg: 'w-24 h-24 sm:w-28 sm:h-28 rounded-2xl p-2',
    row: 'h-auto min-h-[196px] w-[128px] rounded-none border-y-0 border-r-0 p-0 min-[390px]:w-[140px] sm:min-h-[204px] sm:w-[172px]',
    hero: 'w-full h-44 sm:h-56 rounded-2xl p-4',
  };

  return (
    <div
      className={`relative flex-shrink-0 flex items-center justify-center bg-white border border-surface-200 overflow-hidden shadow-subtle ${
        sizeClasses[size]
      } ${className}`}
    >
      <img
        src={imgSrc}
        alt={product.name}
        loading={loading}
        referrerPolicy="no-referrer"
        onError={() => setHasError(true)}
        className="w-full h-full object-contain"
      />
    </div>
  );
};
