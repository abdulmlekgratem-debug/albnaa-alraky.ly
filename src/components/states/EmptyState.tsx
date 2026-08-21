import React from 'react';
import { PackageOpen } from 'lucide-react';
import { Link } from 'react-router-dom';

interface EmptyStateProps {
  title?: string;
  description?: string;
  actionText?: string;
  actionHref?: string;
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title = 'لا توجد أصناف متاحة حاليًا',
  description = 'لم يتم العثور على أي منتجات مطابقة في هذا القسم.',
  actionText = 'عرض جميع المواد',
  actionHref = '/materials',
  className = '',
}) => {
  return (
    <div
      className={`flex flex-col items-center justify-center text-center p-8 bg-white rounded-2xl border border-surface-200 shadow-sm ${className}`}
    >
      <div className="w-14 h-14 rounded-2xl bg-surface-100 text-surface-500 flex items-center justify-center mb-4">
        <PackageOpen className="w-8 h-8" />
      </div>

      <h2 className="text-lg sm:text-xl font-bold text-surface-900 mb-1.5">
        {title}
      </h2>

      <p className="text-sm text-surface-500 max-w-sm mb-6 leading-relaxed">
        {description}
      </p>

      {actionText && actionHref && (
        <Link
          to={actionHref}
          className="inline-flex items-center justify-center px-6 py-3 rounded-xl bg-brand-navy hover:bg-brand-900 text-white font-bold text-sm sm:text-base shadow-sm transition-all active:scale-95 min-h-[48px]"
        >
          {actionText}
        </Link>
      )}
    </div>
  );
};
