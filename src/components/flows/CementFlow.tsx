import React from 'react';
import { useSearchParams } from 'react-router-dom';
import { ProductDTO } from '../../types/product';
import { ProgressiveProductRows } from '../ui/ProgressiveProductRows';
import { EmptyState } from '../states/EmptyState';
import { BrowseStepHeader } from '../navigation/BrowseStepHeader';

interface CementFlowProps {
  products: ProductDTO[];
}

export const CementFlow: React.FC<CementFlowProps> = ({ products }) => {
  // Extract distinct cement types
  const types = ['الكل', ...Array.from(new Set(products.map((p) => p.type).filter(Boolean))) as string[]];
  const [searchParams, setSearchParams] = useSearchParams();
  const requestedType = searchParams.get('type') || 'الكل';
  const selectedType = types.includes(requestedType) ? requestedType : 'الكل';

  const selectType = (type: string) => {
    const next = new URLSearchParams(searchParams);
    type === 'الكل' ? next.delete('type') : next.set('type', type);
    setSearchParams(next, { replace: true });
  };

  const filteredProducts = products.filter((p) => {
    if (selectedType === 'الكل') return true;
    return p.type === selectedType;
  });

  return (
    <div className="mx-auto max-w-[920px] space-y-4 sm:space-y-5">
      <section className="space-y-3 rounded-2xl border border-surface-200 bg-white p-4 shadow-subtle sm:p-5">
        <BrowseStepHeader
          number={3}
          title="اختر نوع الأسمنت"
          description="يمكنك عرض الجميع أو تضييق القائمة حسب النوع."
        />
        {types.length > 2 ? (
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
          {types.map((type) => {
            const isSelected = selectedType === type;
            return (
              <button
                key={type}
                type="button"
                onClick={() => selectType(type)}
                className={`min-h-[56px] rounded-input border px-3 py-2.5 text-center text-sm font-extrabold leading-6 transition-all sm:text-base ${
                  isSelected
                    ? 'bg-brand-navy text-white border-brand-navy shadow-subtle'
                    : 'bg-white text-surface-700 border-surface-200 hover:bg-surface-50'
                }`}
              >
                <span className="block">{type}</span>
                <span className={`block text-xs font-bold ${isSelected ? 'text-blue-100' : 'text-surface-600'}`}>
                  {type === 'الكل' ? products.length : products.filter((product) => product.type === type).length} صنفًا
                </span>
              </button>
            );
          })}
          </div>
        ) : (
          <p className="rounded-xl bg-surface-50 px-4 py-3 text-sm font-semibold leading-6 text-surface-700">
            لا توجد أنواع فرعية إضافية؛ انتقل مباشرة إلى اختيار الصنف.
          </p>
        )}
      </section>

      {/* Results List */}
      <div className="space-y-2.5">
        <BrowseStepHeader
          number={4}
          title="اختر صنف الأسمنت"
          description="اختر الصنف المناسب ثم انسخ السعر أو شاركه مباشرة."
          count={filteredProducts.length}
        />

        {filteredProducts.length === 0 ? (
          <EmptyState
            title="لا توجد أصناف أسمنت مطابقة"
            description="يرجى اختيار فلتر آخر."
          />
        ) : (
          <ProgressiveProductRows
            products={filteredProducts}
            ariaLabel="أصناف الأسمنت"
            resetKey={selectedType}
          />
        )}
      </div>
    </div>
  );
};
