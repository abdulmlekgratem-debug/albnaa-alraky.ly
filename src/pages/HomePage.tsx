import React from 'react';
import { Clock3, MapPin } from 'lucide-react';
import { Header } from '../components/layout/Header';
import { Footer } from '../components/layout/Footer';
import { LoadingSkeleton } from '../components/states/LoadingSkeleton';
import { ErrorState } from '../components/states/ErrorState';
import { useProducts } from '../context/ProductContext';
import { BRAND } from '../lib/constants';
import { formatArabicDate } from '../lib/formatters';
import { HERO_IMAGE } from '../lib/categoryAssets';
import { HomePriceBrowser } from '../components/home/HomePriceBrowser';

export const HomePage: React.FC = () => {
  const {
    products,
    categories,
    cities,
    selectedCity,
    setSelectedCity,
    lastUpdated,
    isLoading,
    error,
    refreshPrices,
  } = useProducts();

  if (isLoading && products.length === 0) {
    return (
      <div className="min-h-screen bg-sand-50">
        <Header />
        <div className="mx-auto max-w-[1240px] px-4 py-8 sm:px-6 lg:px-8">
          <LoadingSkeleton rows={6} />
        </div>
      </div>
    );
  }

  if (error && products.length === 0) {
    return (
      <div className="min-h-screen bg-sand-50">
        <Header />
        <div className="mx-auto max-w-[1240px] px-4 py-12 sm:px-6 lg:px-8">
          <ErrorState message={error} onRetry={refreshPrices} />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-sand-50 text-surface-900">
      <Header />

      <main>
        <section className="relative isolate overflow-hidden bg-brand-950 text-white">
          <img
            src={HERO_IMAGE}
            alt="ساحة ومخازن مواد البناء التابعة للشركة"
            className="absolute inset-0 -z-20 h-full w-full object-cover object-center"
            loading="eager"
          />
          <div className="absolute inset-0 -z-10 bg-gradient-to-l from-brand-950 via-brand-950/95 to-brand-950/45" aria-hidden="true" />
          <div className="absolute inset-0 -z-10 bg-gradient-to-t from-brand-950/80 via-transparent to-transparent" aria-hidden="true" />

          <div className="mx-auto max-w-[1240px] px-4 pt-8 pb-12 sm:px-6 sm:py-16 lg:px-8 lg:py-20">
            <div className="max-w-2xl">
              <div className="flex items-center gap-2 text-xs font-bold text-sand-200 sm:text-sm">
                <MapPin className="h-4 w-4" aria-hidden="true" />
                <span>{BRAND.name} — أسعار {selectedCity}</span>
              </div>

              <h1 className="mt-3 text-[28px] font-black leading-[1.25] sm:mt-5 sm:text-5xl lg:text-6xl">
                <span className="block">أسعار مواد البناء اليوم</span>
                <span className="mt-1 block text-sand-300">في {selectedCity}</span>
              </h1>
              <p className="mt-3 max-w-xl text-sm font-medium leading-7 text-white/85 sm:mt-4 sm:text-lg sm:leading-8">
                الأسعار الحالية لمختلف مواد البناء والإنشاء في مدينة <strong className="text-white">{selectedCity}</strong> وضواحيها.
              </p>

              <div className="mt-4 flex flex-wrap gap-x-5 gap-y-1.5 border-t border-white/20 pt-3 text-[11px] font-bold text-white/75 sm:mt-6 sm:gap-x-6 sm:gap-y-2 sm:pt-4 sm:text-xs">
                <span>{products.length} صنفًا متاحًا</span>
                <span>{categories.length} أقسام</span>
                <span className="flex items-center gap-1.5">
                  <Clock3 className="h-3.5 w-3.5" aria-hidden="true" />
                  آخر تحديث: {formatArabicDate(lastUpdated)}
                </span>
              </div>
            </div>
          </div>
        </section>

        <HomePriceBrowser
          products={products}
          categories={categories}
          cities={cities}
          selectedCity={selectedCity}
          onCitySelect={setSelectedCity}
        />

        <Footer id="contact" />
      </main>
    </div>
  );
};
