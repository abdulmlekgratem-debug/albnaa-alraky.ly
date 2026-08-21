import React from 'react';
import { Header } from '../components/layout/Header';
import { CategoryCard } from '../components/ui/CategoryCard';
import { LoadingSkeleton } from '../components/states/LoadingSkeleton';
import { ErrorState } from '../components/states/ErrorState';
import { useProducts } from '../context/ProductContext';
import { CitySelector } from '../components/ui/CitySelector';
import { BrowseStepHeader } from '../components/navigation/BrowseStepHeader';

export const CategoriesPage: React.FC = () => {
  const {
    categories,
    products,
    isLoading,
    error,
    refreshPrices,
    cities,
    selectedCity,
    setSelectedCity,
  } = useProducts();

  return (
    <div className="min-h-screen bg-surface-50">
      <Header title="جميع مواد البناء" showBack={true} backTo="/" backLabel="العودة إلى الرئيسية" />

      {/* Category Photo Grid */}
      <main id="city-scoped-content" className="mx-auto max-w-[1240px] space-y-6 px-4 py-5 sm:px-6 sm:py-7 lg:px-8">
        {isLoading && products.length === 0 ? (
          <LoadingSkeleton rows={6} />
        ) : error && products.length === 0 ? (
          <ErrorState message={error} onRetry={refreshPrices} />
        ) : (
          <>
            <CitySelector
              cities={cities}
              selectedCity={selectedCity}
              onSelect={setSelectedCity}
            />

            <section className="space-y-4" aria-labelledby="materials-step-title">
              <BrowseStepHeader
                number={2}
                id="materials-step-title"
                title="اختر مادة البناء"
                description={`هذه المواد المتاحة في ${selectedCity}. اضغط على الصورة للوصول إلى الأصناف والأسعار.`}
                count={categories.length}
                countLabel="مواد"
              />
              <div className="grid grid-cols-2 gap-4 sm:gap-6 md:grid-cols-3">
                {categories.map((cat) => (
                  <CategoryCard key={cat.name} category={cat} compact={false} />
                ))}
              </div>
            </section>
          </>
        )}
      </main>
    </div>
  );
};
