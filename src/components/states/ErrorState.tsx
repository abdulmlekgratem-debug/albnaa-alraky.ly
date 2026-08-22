import React from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface ErrorStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
  isRetrying?: boolean;
  className?: string;
}

export const ErrorState: React.FC<ErrorStateProps> = ({
  title = 'تحديث وصيانة دورية للأسعار',
  message = 'المنظومة قيد الصيانة وتحديث قائمة الأسعار حاليًا، وسنعود للعمل قريبًا فور اكتمال المراجعة.',
  onRetry,
  isRetrying = false,
  className = '',
}) => {
  return (
    <div
      className={`mx-auto max-w-lg flex flex-col items-center justify-center text-center p-6 sm:p-9 bg-white rounded-3xl border-2 border-amber-200 shadow-premium ${className}`}
    >
      {/* Yellow / Amber Warning Badge */}
      <div className="w-16 h-16 rounded-2xl bg-amber-50 border border-amber-200 text-amber-600 flex items-center justify-center mb-4 shadow-sm">
        <AlertTriangle className="w-9 h-9" strokeWidth={2.2} />
      </div>

      {/* Main Title */}
      <h2 className="text-xl sm:text-2xl font-black text-surface-900 mb-2">
        {title}
      </h2>

      {/* Reassurance Message */}
      <p className="text-sm sm:text-base font-medium text-surface-600 max-w-md mb-6 leading-relaxed">
        {message}
      </p>

      {/* Retry Button */}
      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          disabled={isRetrying}
          className="inline-flex min-h-[48px] min-w-[170px] items-center justify-center gap-2 rounded-xl bg-brand-navy px-6 py-3 text-sm font-extrabold text-white shadow-md transition-all hover:bg-brand-900 active:scale-95 disabled:opacity-60"
        >
          <RefreshCw className={`w-4 h-4 ${isRetrying ? 'animate-spin' : ''}`} />
          <span>{isRetrying ? 'جارٍ التحقق...' : 'إعادة المحاولة'}</span>
        </button>
      )}
    </div>
  );
};
