import React from 'react';
import { Check, MapPin } from 'lucide-react';
import { CitySummary } from '../../types/product';
import { BrowseStepHeader } from '../navigation/BrowseStepHeader';

interface CitySelectorProps {
  cities: CitySummary[];
  selectedCity: string;
  onSelect: (city: string) => void;
  showAvailability?: boolean;
  className?: string;
}

export const CitySelector: React.FC<CitySelectorProps> = ({
  cities,
  selectedCity,
  onSelect,
  showAvailability = true,
  className = '',
}) => {
  if (cities.length === 0) return null;

  return (
    <section
      aria-labelledby="city-selector-title"
      className={`rounded-2xl border border-surface-200 bg-white p-4 shadow-subtle sm:p-5 ${className}`}
    >
      <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
        <BrowseStepHeader
          number={1}
          id="city-selector-title"
          title="مدينة السعر"
          description={
            showAvailability
              ? 'اختر المدينة؛ تتغير الأصناف والأسعار فورًا.'
              : 'اختر المدينة التي تريد متابعة أصنافها.'
          }
        />
        <span
          className="inline-flex min-h-[36px] items-center gap-1.5 rounded-full bg-brand-50 px-3 text-xs font-black text-brand-navy"
          aria-live="polite"
        >
          <MapPin className="h-4 w-4" aria-hidden="true" />
          المعروض الآن: {selectedCity}
        </span>
      </div>

      <div
        role="radiogroup"
        aria-label="مدن الأسعار"
        className="grid grid-cols-2 gap-2.5 sm:grid-cols-4"
      >
        {cities.map((city) => {
          const isSelected = city.name === selectedCity;
          const hasPrices = city.availableCount > 0;
          return (
            <button
              key={city.name}
              type="button"
              role="radio"
              aria-checked={isSelected}
              aria-disabled={!hasPrices}
              aria-label={
                hasPrices
                  ? `عرض أسعار ${city.name}، ${city.availableCount} صنفًا متوفرًا`
                  : `${city.name}، لا توجد أسعار الآن`
              }
              disabled={!hasPrices}
              onClick={() => onSelect(city.name)}
              className={`relative min-h-[68px] min-w-0 w-full rounded-xl border-2 px-3 py-2.5 text-right transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-navy focus-visible:ring-offset-2 ${
                isSelected
                  ? 'border-brand-navy bg-brand-navy text-white shadow-md shadow-brand-950/15'
                  : !hasPrices
                    ? 'cursor-not-allowed border-surface-200 bg-surface-100 text-surface-400 opacity-75'
                  : 'border-surface-300 bg-white text-surface-900 hover:border-brand-navy hover:bg-brand-50 active:bg-brand-100'
              }`}
            >
              <span className="flex items-center justify-between gap-2">
                <span className="text-base font-black">{city.name}</span>
                {isSelected ? (
                  <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-white text-brand-navy">
                    <Check className="h-4 w-4" strokeWidth={3} aria-hidden="true" />
                  </span>
                ) : (
                  <MapPin className="h-5 w-5 text-brand-navy" aria-hidden="true" />
                )}
              </span>
              {showAvailability && (
                <span className={`mt-1 block text-[11px] font-bold sm:text-xs ${isSelected ? 'text-blue-100' : 'text-surface-600'}`}>
                  {hasPrices ? `${city.availableCount} صنفًا متوفرًا` : 'لا توجد أسعار الآن'}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </section>
  );
};
