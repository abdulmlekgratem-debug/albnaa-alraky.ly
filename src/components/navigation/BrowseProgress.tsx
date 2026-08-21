import React from 'react';
import { Check } from 'lucide-react';

interface BrowseProgressProps {
  city: string;
  category?: string | null;
  specification?: string | null;
  productName?: string | null;
  activeStep: 1 | 2 | 3 | 4;
  className?: string;
}

export const BrowseProgress: React.FC<BrowseProgressProps> = ({
  city,
  category,
  specification,
  productName,
  activeStep,
  className = '',
}) => {
  const steps = [
    { number: 1, label: 'المدينة', value: city || 'اختر المدينة' },
    { number: 2, label: 'المادة', value: category || 'اختر المادة' },
    { number: 3, label: 'النوع أو المقاس', value: specification || 'حدد المواصفات' },
    { number: 4, label: 'الصنف والسعر', value: productName || 'اختر الصنف' },
  ];
  const currentStep = steps[activeStep - 1];
  const completedValues = steps.slice(0, activeStep - 1).map((step) => step.value);

  return (
    <nav
      aria-label="مراحل اختيار مادة البناء"
      className={`rounded-2xl border border-surface-200 bg-white p-3 shadow-subtle sm:p-4 ${className}`}
    >
      <div className="mb-3 flex items-center justify-between gap-3 px-1">
        <span className="text-xs font-extrabold text-brand-950 sm:text-sm">مسار اختيارك</span>
        <span className="rounded-full bg-brand-50 px-2.5 py-1 text-[11px] font-bold text-brand-navy">
          الخطوة {activeStep} من 4
        </span>
      </div>

      <div className="sm:hidden">
        <div className="flex min-w-0 items-center gap-3 rounded-xl bg-brand-navy p-3 text-white">
          <span className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-white text-xs font-black text-brand-navy">
            {currentStep.number}
          </span>
          <div className="min-w-0">
            <span className="block text-[11px] font-bold text-blue-100">{currentStep.label}</span>
            <span className="mt-0.5 block truncate text-sm font-extrabold" title={currentStep.value}>
              {currentStep.value}
            </span>
          </div>
        </div>
        {completedValues.length > 0 && (
          <p className="mt-2 truncate px-1 text-[11px] font-bold text-surface-500" title={completedValues.join(' / ')}>
            اختياراتك: {completedValues.join(' / ')}
          </p>
        )}
      </div>

      <ol className="hidden gap-2 sm:grid sm:grid-cols-4">
        {steps.map((step) => {
          const isComplete = step.number < activeStep;
          const isActive = step.number === activeStep;

          return (
            <li
              key={step.number}
              aria-current={isActive ? 'step' : undefined}
              className={`min-w-0 rounded-xl border p-3 transition-colors ${
                isActive
                  ? 'border-brand-navy bg-brand-navy text-white'
                  : isComplete
                    ? 'border-brand-100 bg-brand-50 text-brand-950'
                    : 'border-surface-200 bg-surface-50 text-surface-500'
              }`}
            >
              <div className="flex items-center gap-2">
                <span
                  className={`flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full text-xs font-black ${
                    isActive
                      ? 'bg-white text-brand-navy'
                      : isComplete
                        ? 'bg-brand-navy text-white'
                        : 'bg-surface-200 text-surface-600'
                  }`}
                >
                  {isComplete ? <Check className="h-3.5 w-3.5" aria-hidden="true" /> : step.number}
                </span>
                <span className={`text-[11px] font-bold ${isActive ? 'text-blue-100' : ''}`}>
                  {step.label}
                </span>
              </div>
              <span className="mt-2 block truncate text-xs font-extrabold sm:text-sm" title={step.value}>
                {step.value}
              </span>
            </li>
          );
        })}
      </ol>
    </nav>
  );
};
