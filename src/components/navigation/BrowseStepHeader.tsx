import React from 'react';

interface BrowseStepHeaderProps {
  number: 1 | 2 | 3 | 4;
  title: string;
  description?: string;
  count?: number;
  countLabel?: string;
  className?: string;
  id?: string;
}

export const BrowseStepHeader: React.FC<BrowseStepHeaderProps> = ({
  number,
  title,
  description,
  count,
  countLabel = 'صنفًا',
  className = '',
  id,
}) => (
  <div className={`flex items-start justify-between gap-3 ${className}`}>
    <div className="flex min-w-0 items-start gap-3">
      <span className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl bg-brand-navy text-sm font-black text-white">
        {number}
      </span>
      <div className="min-w-0">
        <h2 id={id} className="text-base font-extrabold leading-7 text-surface-900 sm:text-lg">{title}</h2>
        {description && (
          <p className="mt-1 text-sm font-medium leading-6 text-surface-600 sm:text-[15px]">
            {description}
          </p>
        )}
      </div>
    </div>
    {typeof count === 'number' && (
      <span className="flex-shrink-0 rounded-full border border-surface-200 bg-white px-3 py-1.5 text-xs font-bold text-surface-700">
        {count} {countLabel}
      </span>
    )}
  </div>
);
