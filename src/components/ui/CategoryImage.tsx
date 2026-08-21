import React, { useState } from 'react';
import { getCategoryAsset } from '../../lib/categoryAssets';

interface CategoryImageProps {
  categoryName: string;
  className?: string;
  imgClassName?: string;
  loading?: 'lazy' | 'eager';
}

export const CategoryImage: React.FC<CategoryImageProps> = ({
  categoryName,
  className = '',
  imgClassName = '',
  loading = 'lazy',
}) => {
  const asset = getCategoryAsset(categoryName);
  const [hasError, setHasError] = useState(false);

  const imgSrc = hasError ? '/images/categories/other.svg' : asset.image;

  return (
    <div
      className={`relative overflow-hidden flex items-center justify-center bg-surface-50 rounded-xl ${className}`}
    >
      <img
        src={imgSrc}
        alt={`صورة ${categoryName}`}
        loading={loading}
        onError={() => setHasError(true)}
        className={`w-full h-full object-contain transition-transform duration-200 group-hover:scale-105 ${imgClassName}`}
      />
    </div>
  );
};
