import React, { useEffect, useState } from 'react';
import { Header } from '../components/layout/Header';
import { ProductCatalogTable } from '../components/ui/ProductCatalogTable';
import { LoadingSkeleton } from '../components/states/LoadingSkeleton';
import { ErrorState } from '../components/states/ErrorState';
import { EmptyState } from '../components/states/EmptyState';
import { useProducts } from '../context/ProductContext';
import { formatArabicDate } from '../lib/formatters';
import { ChevronDown, Clock3 } from 'lucide-react';
import { PRICE_DISPLAY_CONFIG } from '../config/priceDisplay';
import { PriceCalibrationNotice } from '../components/states/PriceCalibrationNotice';
import { CitySelector } from '../components/ui/CitySelector';
import { BrowseStepHeader } from '../components/navigation/BrowseStepHeader';

export const AllPricesPage: React.FC = () => {
  const {
    products,
    categories,
    lastUpdated,
    isLoading,
    error,
    refreshPrices,
    cities,
    selectedCity,
    setSelectedCity,
  } = useProducts();
  const [selectedCategory, setSelectedCategory] = useState<string>('الكل');
  const [visibleCount, setVisibleCount] = useState(12);
  const isCalibrationMode = PRICE_DISPLAY_CONFIG.isCalibrationMode();

  useEffect(() => {
    if (
      selectedCategory !== 'الكل' &&
      !categories.some((category) => category.name === selectedCategory)
    ) {
      setSelectedCategory('الكل');
    }
  }, [categories, selectedCategory]);

  useEffect(() => {
    setVisibleCount(12);
  }, [selectedCategory, selectedCity]);

  const filteredProducts = products.filter((p) => {
    if (selectedCategory === 'الكل') return true;
    return p.category === selectedCategory;
  });
  const visibleProducts = filteredProducts.slice(0, visibleCount);
  const remainingProducts = Math.max(0, filteredProducts.length - visibleProducts.length);
  const nextBatchSize = Math.min(12, remainingProducts);

  return (
    <div className="min-h-screen bg-surface-50">
      <Header title="الأسعار حسب المدينة" showBack={true} backTo="/" backLabel="العودة إلى الرئيسية" />

      <main id="city-scoped-content" className="mx-auto max-w-[1240px] space-y-4 px-4 py-6 sm:space-y-5 sm:px-6 sm:py-8 lg:px-8">
        <CitySelector
          cities={cities}
          selectedCity={selectedCity}
          onSelect={setSelectedCity}
        />

        <p className="flex min-h-[44px] items-center gap-2 rounded-xl border border-surface-200 bg-white px-3 py-2 text-sm font-bold text-surface-600">
          <Clock3 className="h-4 w-4 flex-shrink-0 text-brand-navy" />
          <span>آخر تحديث للأسعار المعروضة: {formatArabicDate(lastUpdated)}</span>
        </p>

        {isCalibrationMode && <PriceCalibrationNotice compact />}

        {/* Category Horizontal Filter Pills */}
        <section className="space-y-3 rounded-2xl border border-surface-200 bg-white p-4 shadow-subtle">
          <BrowseStepHeader
            number={2}
            title="اختر مادة البناء"
            description="اختر تصنيفًا واحدًا لتقليل النتائج وتسهيل الوصول إلى الصنف."
          />
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-5">
          <button
            type="button"
            onClick={() => setSelectedCategory('الكل')}
            className={`min-h-[54px] rounded-input border px-3 py-2 text-center text-xs font-bold leading-5 transition-all sm:text-sm ${
              selectedCategory === 'الكل'
                ? 'bg-brand-navy text-white border-brand-navy shadow-subtle'
                : 'bg-white text-surface-700 border-surface-200 hover:bg-surface-50'
            }`}
          >
            <span className="block">كل المواد</span>
            <span className={`block text-[10px] font-semibold ${selectedCategory === 'الكل' ? 'text-blue-100' : 'text-surface-500'}`}>
              {products.length} صنفًا
            </span>
          </button>

          {categories.map((cat) => {
            const isSelected = selectedCategory === cat.name;
            return (
              <button
                key={cat.name}
                type="button"
                onClick={() => setSelectedCategory(cat.name)}
                className={`min-h-[54px] rounded-input border px-3 py-2 text-center text-xs font-bold leading-5 transition-all sm:text-sm ${
                  isSelected
                    ? 'bg-brand-navy text-white border-brand-navy shadow-subtle'
                    : 'bg-white text-surface-700 border-surface-200 hover:bg-surface-50'
                }`}
              >
                <span className="block">{cat.name}</span>
                <span className={`block text-[10px] font-semibold ${isSelected ? 'text-blue-100' : 'text-surface-500'}`}>
                  {cat.count} صنفًا
                </span>
              </button>
            );
          })}
          </div>
        </section>

        {/* Products List in Unified Divider Card */}
        {isLoading && products.length === 0 ? (
          <LoadingSkeleton rows={8} />
        ) : error && products.length === 0 ? (
          <ErrorState message={error} onRetry={refreshPrices} />
        ) : filteredProducts.length === 0 ? (
          <EmptyState
            title="لا توجد أصناف متاحة في هذا التصنيف"
            description="يرجى اختيار تصنيف آخر."
          />
        ) : (
          <div className="space-y-2">
            <BrowseStepHeader
              number={3}
              title={selectedCategory === 'الكل' ? 'اختر الصنف والسعر' : `اختر صنفًا من ${selectedCategory}`}
              description="السعر هو المعلومة الأساسية، وبجانبه النسخ والمشاركة مباشرة."
              count={filteredProducts.length}
            />

            <ProductCatalogTable products={visibleProducts} ariaLabel="جميع أسعار مواد البناء" />
            {remainingProducts > 0 && (
              <div className="rounded-2xl border border-surface-200 bg-white p-2 shadow-subtle">
                <button
                  type="button"
                  onClick={() => setVisibleCount((current) => current + 12)}
                  className="flex min-h-[54px] w-full items-center justify-center gap-2 rounded-xl bg-brand-navy px-4 text-sm font-black text-white transition-colors hover:bg-brand-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-navy focus-visible:ring-offset-2 sm:text-base"
                >
                  <ChevronDown className="h-5 w-5" aria-hidden="true" />
                  <span>عرض {nextBatchSize} أصناف إضافية</span>
                  <span className="rounded-full bg-white/15 px-2.5 py-1 text-xs font-extrabold text-white/85">
                    المتبقي {remainingProducts}
                  </span>
                </button>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
};
