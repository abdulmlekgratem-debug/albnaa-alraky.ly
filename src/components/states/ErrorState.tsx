import React from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';

interface ErrorStateProps {
  message?: string;
  onRetry?: () => void;
  isRetrying?: boolean;
  className?: string;
}

export const ErrorState: React.FC<ErrorStateProps> = ({
  message = 'تعذر تحميل الأسعار. تحقق من الاتصال وحاول مرة أخرى.',
  onRetry,
  isRetrying = false,
  className = '',
}) => {
  return (
    <div
      className={`flex flex-col items-center justify-center text-center p-6 sm:p-8 bg-white rounded-2xl border border-red-100 shadow-sm ${className}`}
    >
      <div className="w-14 h-14 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center mb-4">
        <AlertCircle className="w-8 h-8" />
      </div>

      <h2 className="text-lg sm:text-xl font-bold text-surface-900 mb-2">
        تعذر تحميل الأسعار
      </h2>

      <p className="text-sm text-surface-600 max-w-sm mb-6 leading-relaxed">
        {message}
      </p>

      {onRetry && (
        <button
          onClick={onRetry}
          disabled={isRetrying}
          className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-brand-navy hover:bg-brand-900 text-white font-bold text-sm sm:text-base shadow-sm transition-all active:scale-95 disabled:opacity-50 min-h-[48px] min-w-[160px]"
        >
          <RefreshCw className={`w-4 h-4 ${isRetrying ? 'animate-spin' : ''}`} />
          <span>{isRetrying ? 'جارٍ التحميل...' : 'إعادة المحاولة'}</span>
        </button>
      )}
    </div>
  );
};
