import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { CategorySummary } from '../../types/product';
import { CategoryImage } from './CategoryImage';

interface CategoryCardProps {
  category: CategorySummary;
  compact?: boolean;
  className?: string;
}

export const CategoryCard: React.FC<CategoryCardProps> = ({
  category,
  compact = false,
  className = '',
}) => {
  return (
    <Link
      to={`/materials/${encodeURIComponent(category.name)}`}
      aria-label={`عرض أصناف ${category.name}`}
      className={`group flex flex-col overflow-hidden rounded-[22px] border border-surface-200 bg-white shadow-subtle transition-all duration-300 hover:-translate-y-1 hover:border-sand-300 hover:shadow-premium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-navy focus-visible:ring-offset-2 active:translate-y-0 ${className}`}
    >
      <div className={`relative w-full overflow-hidden bg-sand-50 ${compact ? 'h-28' : 'h-36 sm:h-48'}`}>
        <CategoryImage
          categoryName={category.name}
          className="h-full w-full !rounded-none !bg-sand-50"
          imgClassName="!object-cover duration-500 group-hover:scale-[1.045]"
        />
        <span className="absolute left-3 top-3 rounded-full border border-white/70 bg-white/90 px-2.5 py-1 text-[10px] font-bold text-brand-900 shadow-subtle backdrop-blur-sm sm:text-xs">
          {category.count} صنفًا
        </span>
      </div>

      <div className="flex min-h-[70px] items-center justify-between gap-2 px-4 py-3.5 sm:min-h-[78px] sm:px-5">
        <div className="min-w-0">
          <span className="mb-1 block text-xs font-bold text-sand-600 sm:text-sm">
            عرض الأصناف والأسعار
          </span>
          <h3 className="text-base font-extrabold leading-tight text-surface-900 transition-colors group-hover:text-brand-navy sm:text-lg">
          {category.name}
          </h3>
        </div>
        <span className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-brand-50 text-brand-navy transition-colors group-hover:bg-brand-navy group-hover:text-white sm:h-10 sm:w-10">
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
        </span>
      </div>
    </Link>
  );
};
