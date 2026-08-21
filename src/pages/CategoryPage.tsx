import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Header } from '../components/layout/Header';
import { IronFlow } from '../components/flows/IronFlow';
import { CementFlow } from '../components/flows/CementFlow';
import { BrickFlow } from '../components/flows/BrickFlow';
import { SandFlow } from '../components/flows/SandFlow';
import { GenericCategoryFlow } from '../components/flows/GenericCategoryFlow';
import { CategoryImage } from '../components/ui/CategoryImage';
import { LoadingSkeleton } from '../components/states/LoadingSkeleton';
import { ErrorState } from '../components/states/ErrorState';
import { EmptyState } from '../components/states/EmptyState';
import { useProducts } from '../context/ProductContext';
import { CATEGORY_METADATA } from '../lib/constants';
import { CitySelector } from '../components/ui/CitySelector';

export const CategoryPage: React.FC = () => {
  const navigate = useNavigate();
  const { category: rawCategoryParam } = useParams<{ category: string }>();
  const {
    products,
    categories,
    isLoading,
    error,
    refreshPrices,
    cities,
    selectedCity,
    setSelectedCity,
  } = useProducts();
  // Decode URI component
  const categoryParam = decodeURIComponent(rawCategoryParam || '');

  // Match by exact name or slug
  const matchedCategoryName =
    Object.keys(CATEGORY_METADATA).find(
      (name) => name === categoryParam || CATEGORY_METADATA[name].slug === categoryParam
    ) || categoryParam;

  const categoryProducts = products.filter(
    (p) => p.category.trim() === matchedCategoryName.trim()
  );

  const renderFlow = () => {
    switch (matchedCategoryName) {
      case 'الحديد':
        return <IronFlow products={categoryProducts} />;
      case 'الأسمنت':
        return <CementFlow products={categoryProducts} />;
      case 'الياجور والبلوك':
        return <BrickFlow products={categoryProducts} />;
      case 'الرمل والركام':
        return <SandFlow products={categoryProducts} />;
      default:
        return (
          <GenericCategoryFlow
            categoryName={matchedCategoryName}
            products={categoryProducts}
          />
        );
    }
  };

  return (
    <div className="min-h-screen bg-surface-50">
      <Header
        title={matchedCategoryName}
        showBack={true}
        backTo="/materials"
        backLabel="العودة إلى جميع المواد"
      />

      {/* Content & Flow */}
      <main id="city-scoped-content" className="mx-auto max-w-[1240px] px-4 py-5 sm:px-6 sm:py-7 lg:px-8">
        <CitySelector
          cities={cities}
          selectedCity={selectedCity}
          onSelect={setSelectedCity}
          showAvailability={true}
          className="mx-auto mb-6 max-w-[920px]"
        />

        <section className="mx-auto mb-6 max-w-[920px] overflow-hidden rounded-2xl border border-surface-200 bg-white shadow-subtle">
          <div className="flex items-center gap-3.5 p-4 sm:p-5">
            <div className="h-20 w-20 flex-shrink-0 rounded-xl border border-surface-200 bg-surface-50 p-1 sm:h-24 sm:w-24">
              <CategoryImage categoryName={matchedCategoryName} className="h-full w-full" />
            </div>
            <div className="min-w-0">
              <span className="text-sm font-bold text-surface-500">المادة المختارة</span>
              <h1 className="mt-0.5 text-2xl font-black text-surface-900">{matchedCategoryName}</h1>
              <p className="mt-1 text-sm font-bold text-brand-navy">
                {categoryProducts.length} صنفًا متاحًا في {selectedCity}
              </p>
            </div>
          </div>

          <div className="border-t border-surface-200 bg-sand-50/70 px-3 py-3 sm:px-4">
            <p className="mb-2 text-xs font-extrabold text-surface-600 sm:text-sm">انتقل إلى مادة أخرى:</p>
            <div className="no-scrollbar flex gap-2 overflow-x-auto overscroll-x-contain pb-1" role="navigation" aria-label="التنقل بين مواد البناء">
              {categories.map((category) => {
                const selected = category.name === matchedCategoryName;
                return (
                  <button
                    key={category.name}
                    type="button"
                    aria-current={selected ? 'page' : undefined}
                    onClick={() => navigate(`/materials/${encodeURIComponent(category.name)}`)}
                    className={`min-h-[46px] flex-none rounded-xl border px-3.5 text-sm font-extrabold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-navy ${
                      selected
                        ? 'border-brand-navy bg-brand-navy text-white'
                        : 'border-surface-200 bg-white text-brand-950 hover:border-brand-300 hover:bg-brand-50'
                    }`}
                  >
                    {category.name}
                    <span className={`mr-1 text-[11px] ${selected ? 'text-white/70' : 'text-surface-500'}`}>
                      {category.count}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </section>

        {isLoading && products.length === 0 ? (
          <LoadingSkeleton rows={5} />
        ) : error && products.length === 0 ? (
          <ErrorState message={error} onRetry={refreshPrices} />
        ) : categoryProducts.length === 0 ? (
          <EmptyState
            title="لا توجد أصناف في هذا التصنيف حاليًا"
            description="يرجى مراجعة بقية التصنيفات أو البحث عن مادة أخرى."
          />
        ) : (
          renderFlow()
        )}
      </main>
    </div>
  );
};
