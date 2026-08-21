import React from 'react';
import { SearchX } from 'lucide-react';
import { Link } from 'react-router-dom';

interface SearchEmptyStateProps {
  query?: string;
  onClear?: () => void;
  className?: string;
}

export const SearchEmptyState: React.FC<SearchEmptyStateProps> = ({
  query,
  onClear,
  className = '',
}) => {
  return (
    <div
      className={`flex flex-col items-center justify-center text-center p-6 sm:p-8 bg-white rounded-card border border-surface-200 shadow-subtle ${className}`}
    >
      <div className="w-12 h-12 rounded-xl bg-surface-100 text-surface-600 flex items-center justify-center mb-3">
        <SearchX className="w-6 h-6" />
      </div>

      <h2 className="text-base sm:text-lg font-bold text-surface-900 mb-1">
        لا يوجد صنف مطابق ومتاح الآن
      </h2>

      {query && (
        <p className="text-sm text-brand-navy font-bold mb-2">
          «{query}»
        </p>
      )}

      <p className="text-xs sm:text-sm text-surface-500 max-w-sm mb-5 leading-relaxed font-medium">
        راجع الاقتراحات القريبة أعلاه، أو جرّب مقاسًا أو مصنعًا آخر. الأصناف غير المتوفرة لا تظهر في النتائج.
      </p>

      <div className="flex flex-col sm:flex-row gap-2.5 w-full sm:w-auto">
        {onClear && (
          <button
            onClick={onClear}
            className="inline-flex items-center justify-center px-5 py-2.5 rounded-input bg-brand-navy text-white font-bold text-xs sm:text-sm transition-colors min-h-[44px] active:scale-95"
          >
            مسح نص البحث
          </button>
        )}
        <Link
          to="/materials"
          className="inline-flex items-center justify-center px-5 py-2.5 rounded-input bg-surface-100 hover:bg-surface-200 text-surface-800 font-bold text-xs sm:text-sm transition-colors min-h-[44px] active:scale-95"
        >
          عرض جميع المواد
        </Link>
      </div>
    </div>
  );
};
