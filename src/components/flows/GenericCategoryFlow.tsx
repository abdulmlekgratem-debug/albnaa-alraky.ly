import React from 'react';
import { useSearchParams } from 'react-router-dom';
import { ProductDTO } from '../../types/product';
import { ProgressiveProductRows } from '../ui/ProgressiveProductRows';
import { EmptyState } from '../states/EmptyState';
import { BrowseStepHeader } from '../navigation/BrowseStepHeader';

interface GenericCategoryFlowProps {
  categoryName: string;
  products: ProductDTO[];
}

export const GenericCategoryFlow: React.FC<GenericCategoryFlowProps> = ({
  categoryName,
  products,
}) => {
  // Extract Subcategories if any
  const subcategories = Array.from(
    new Set(products.map((p) => p.subcategory).filter(Boolean))
  ) as string[];

  const [searchParams, setSearchParams] = useSearchParams();
  const requestedSub = searchParams.get('sub') || 'الكل';
  const selectedSub = subcategories.includes(requestedSub) ? requestedSub : 'الكل';

  const selectSubcategory = (subcategory: string) => {
    const next = new URLSearchParams(searchParams);
    subcategory === 'الكل' ? next.delete('sub') : next.set('sub', subcategory);
    setSearchParams(next, { replace: true });
  };

  const filteredProducts = products.filter((p) => {
    if (selectedSub === 'الكل') return true;
    return p.subcategory === selectedSub;
  });

  return (
    <div className="mx-auto max-w-[920px] space-y-4 sm:space-y-5">
      {/* Subcategories if present */}
      <section className="space-y-3 rounded-2xl border border-surface-200 bg-white p-4 shadow-subtle sm:p-5">
        <BrowseStepHeader
          number={3}
          title={`حدد نوع ${categoryName}`}
          description="اختر النوع الفرعي إن وجد، ثم انتقل إلى الصنف."
        />
        {subcategories.length > 1 ? (
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
          {['الكل', ...subcategories].map((sub) => {
            const isSelected = selectedSub === sub;
            return (
              <button
                key={sub}
                type="button"
                onClick={() => selectSubcategory(sub)}
                className={`min-h-[48px] rounded-input border px-3 py-2 text-center text-xs font-bold leading-5 transition-all sm:text-sm ${
                  isSelected
                    ? 'bg-brand-navy text-white border-brand-navy shadow-subtle'
                    : 'bg-white text-surface-700 border-surface-200 hover:bg-surface-50'
                }`}
              >
                <span className="block">{sub}</span>
                <span className={`block text-[10px] font-semibold ${isSelected ? 'text-blue-100' : 'text-surface-500'}`}>
                  {sub === 'الكل' ? products.length : products.filter((product) => product.subcategory === sub).length} صنفًا
                </span>
              </button>
            );
          })}
          </div>
        ) : (
          <p className="rounded-xl bg-surface-50 px-4 py-3 text-xs font-semibold text-surface-600">
            لا توجد أنواع فرعية إضافية؛ اختر الصنف مباشرة من النتائج.
          </p>
        )}
      </section>

      {/* Results List */}
      <div className="space-y-2.5">
        <BrowseStepHeader
          number={4}
          title={`اختر صنف ${categoryName}`}
          description="اختر الصنف المناسب، ثم انسخ سعره أو شاركه مباشرة."
          count={filteredProducts.length}
        />

        {filteredProducts.length === 0 ? (
          <EmptyState
            title="لا توجد أصناف مطابقة"
            description="يرجى اختيار تصنيف آخر."
          />
        ) : (
          <ProgressiveProductRows
            products={filteredProducts}
            ariaLabel={`أصناف ${categoryName}`}
            resetKey={selectedSub}
          />
        )}
      </div>
    </div>
  );
};
