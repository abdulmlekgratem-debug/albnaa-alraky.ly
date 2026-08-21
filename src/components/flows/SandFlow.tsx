import React from 'react';
import { useSearchParams } from 'react-router-dom';
import { ProductDTO } from '../../types/product';
import { extractSandSubcategories } from '../../services/productService';
import { ProgressiveProductRows } from '../ui/ProgressiveProductRows';
import { EmptyState } from '../states/EmptyState';
import { BrowseStepHeader } from '../navigation/BrowseStepHeader';

interface SandFlowProps {
  products: ProductDTO[];
}

export const SandFlow: React.FC<SandFlowProps> = ({ products }) => {
  const subcategories = ['الكل', ...extractSandSubcategories(products)];
  const [searchParams, setSearchParams] = useSearchParams();
  const requestedSub = searchParams.get('type') || 'الكل';
  const selectedSub = subcategories.includes(requestedSub) ? requestedSub : 'الكل';

  const selectSubcategory = (subcategory: string) => {
    const next = new URLSearchParams(searchParams);
    subcategory === 'الكل' ? next.delete('type') : next.set('type', subcategory);
    setSearchParams(next, { replace: true });
  };

  const filteredProducts = products.filter((p) => {
    if (selectedSub === 'الكل') return true;
    return p.subcategory === selectedSub || p.name.includes(selectedSub);
  });

  return (
    <div className="mx-auto max-w-[920px] space-y-4">
      {/* Subcategory Pills - Compact and Focused */}
      <section className="space-y-3 rounded-2xl border border-surface-200 bg-white p-4 shadow-subtle sm:p-5">
        <BrowseStepHeader
          number={3}
          title="اختر نوع الرمل أو الركام"
          description="اختر النوع لتظهر الأصناف المطابقة فقط."
        />
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
          {subcategories.map((sub) => {
            const isSelected = selectedSub === sub;
            const count =
              sub === 'الكل'
                ? products.length
                : products.filter(
                    (p) => p.subcategory === sub || p.name.includes(sub)
                  ).length;

            return (
              <button
                key={sub}
                type="button"
                onClick={() => selectSubcategory(sub)}
                className={`flex min-h-[48px] items-center justify-center gap-1.5 rounded-input border px-3 py-2 text-center text-xs font-bold leading-5 transition-all sm:text-sm ${
                  isSelected
                    ? 'bg-brand-navy text-white border-brand-navy shadow-subtle'
                    : 'bg-white text-surface-700 border-surface-200 hover:bg-surface-50'
                }`}
              >
                <span>{sub}</span>
                <span
                  className={`text-[11px] font-semibold ${
                    isSelected ? 'text-blue-200' : 'text-surface-400'
                  }`}
                >
                  ({count})
                </span>
              </button>
            );
          })}
        </div>
      </section>

      {/* Results Header & List Container */}
      <div className="space-y-2.5">
        <BrowseStepHeader
          number={4}
          title="اختر الصنف والسعر"
          description="السعر والوحدة وإجراءات النسخ والمشاركة ظاهرة مباشرة دون فتح صفحة إضافية."
          count={filteredProducts.length}
        />

        {filteredProducts.length === 0 ? (
          <EmptyState
            title="لا توجد أصناف مطابقة"
            description="يرجى اختيار تصنيف فرعي آخر."
          />
        ) : (
          <ProgressiveProductRows
            products={filteredProducts}
            ariaLabel="أصناف الرمل والركام"
            resetKey={selectedSub}
          />
        )}
      </div>
    </div>
  );
};
