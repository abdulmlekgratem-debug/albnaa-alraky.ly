import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, CheckCircle2, Clock3, SlidersHorizontal } from 'lucide-react';
import { PRICE_CALIBRATION_COPY } from '../../config/priceDisplay';

interface PriceCalibrationNoticeProps {
  compact?: boolean;
  className?: string;
}

export const PriceCalibrationNotice: React.FC<PriceCalibrationNoticeProps> = ({
  compact = false,
  className = '',
}) => {
  if (compact) {
    return (
      <section
        role="status"
        aria-live="polite"
        className={`rounded-lg border border-amber-200 border-r-4 border-r-amber-500 bg-amber-50 px-4 py-3 ${className}`}
      >
        <div className="flex items-start gap-3">
          <span className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-md bg-amber-100 text-amber-800">
            <SlidersHorizontal className="h-4 w-4" aria-hidden="true" />
          </span>
          <div className="min-w-0">
            <h3 className="text-sm font-extrabold leading-6 text-brand-950">
              {PRICE_CALIBRATION_COPY.title}
            </h3>
            <p className="mt-0.5 text-xs font-medium leading-5 text-surface-700 sm:text-sm">
              تظهر فقط الأسعار المكتملة للأصناف المتاحة؛ الأصناف غير المتوفرة والأسعار الصفرية مخفية من القوائم.
            </p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <main className={`mx-auto w-full max-w-[920px] px-4 py-10 sm:px-6 sm:py-16 lg:px-8 ${className}`}>
      <section
        role="status"
        aria-live="polite"
        className="relative overflow-hidden rounded-[30px] border border-surface-200 bg-white shadow-premium"
      >
        <div className="bg-brand-950 px-6 py-9 text-white sm:px-10 sm:py-12">
          <div className="flex flex-col items-start gap-6 sm:flex-row sm:items-center">
            <span className="flex h-16 w-16 flex-shrink-0 items-center justify-center rounded-[22px] border border-white/15 bg-white/10 text-sand-200">
              <SlidersHorizontal className="h-8 w-8" aria-hidden="true" />
            </span>
            <div className="max-w-2xl">
              <span className="inline-flex items-center gap-2 rounded-full border border-amber-200/25 bg-amber-100/10 px-3 py-1.5 text-xs font-extrabold text-sand-200">
                <Clock3 className="h-3.5 w-3.5" aria-hidden="true" />
                {PRICE_CALIBRATION_COPY.eyebrow}
              </span>
              <h1 className="mt-4 text-3xl font-black leading-tight sm:text-4xl">
                {PRICE_CALIBRATION_COPY.title}
              </h1>
              <p className="mt-4 text-sm font-medium leading-7 text-white/70 sm:text-base sm:leading-8">
                {PRICE_CALIBRATION_COPY.description}
              </p>
            </div>
          </div>
        </div>

        <div className="px-6 py-7 sm:px-10 sm:py-9">
          <p className="max-w-2xl text-sm font-bold leading-7 text-surface-800 sm:text-base">
            {PRICE_CALIBRATION_COPY.reassurance}
          </p>

          <div className="mt-6 grid gap-3 sm:grid-cols-3">
            {[
              'مطابقة أسعار الموردين',
              'مراجعة وحدات القياس',
              'اختبار التحديث المباشر',
            ].map((item) => (
              <div
                key={item}
                className="flex min-h-[52px] items-center gap-2.5 rounded-xl border border-surface-200 bg-sand-50 px-3.5 py-3 text-sm font-bold text-surface-700"
              >
                <CheckCircle2 className="h-4 w-4 flex-shrink-0 text-brand-navy" aria-hidden="true" />
                <span>{item}</span>
              </div>
            ))}
          </div>

          <div className="mt-7 flex flex-col gap-3 sm:flex-row">
            <Link
              to="/materials"
              className="inline-flex min-h-[48px] items-center justify-center gap-2 rounded-xl bg-brand-navy px-6 text-sm font-extrabold text-white transition-colors hover:bg-brand-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-navy focus-visible:ring-offset-2"
            >
              تصفح المواد
              <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            </Link>
            <Link
              to="/"
              className="inline-flex min-h-[48px] items-center justify-center rounded-xl border border-surface-300 bg-white px-6 text-sm font-bold text-surface-800 transition-colors hover:bg-surface-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-navy focus-visible:ring-offset-2"
            >
              العودة للرئيسية
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
};
