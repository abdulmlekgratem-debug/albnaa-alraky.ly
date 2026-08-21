import React from 'react';
import { useSearchParams } from 'react-router-dom';
import { ProductDTO } from '../../types/product';
import { ProgressiveProductRows } from '../ui/ProgressiveProductRows';
import { EmptyState } from '../states/EmptyState';
import { CategoryImage } from '../ui/CategoryImage';
import { BrowseStepHeader } from '../navigation/BrowseStepHeader';

interface BrickFlowProps {
  products: ProductDTO[];
}

export const BrickFlow: React.FC<BrickFlowProps> = ({ products }) => {
  const [searchParams, setSearchParams] = useSearchParams();

  const mainTypes = [
    { label: 'الكل', value: 'الكل' },
    { label: 'ياجور بناء', value: 'ياجور بناء' },
    { label: 'ياجور سقف (هوردي)', value: 'ياجور سقف' },
    { label: 'بلوك إسمنتي', value: 'بلوك' },
  ];
  const countForType = (type: string) =>
    type === 'الكل'
      ? products.length
      : products.filter(
          (product) => product.name.includes(type) || (product.type && product.type.includes(type)),
        ).length;
  const visibleMainTypes = mainTypes.filter(
    (item) => item.value === 'الكل' || countForType(item.value) > 0,
  );
  const requestedType = searchParams.get('type') || 'الكل';
  const selectedType = visibleMainTypes.some((item) => item.value === requestedType) ? requestedType : 'الكل';

  // Filter by Type
  const productsByType = products.filter((p) => {
    if (selectedType === 'الكل') return true;
    return p.name.includes(selectedType) || (p.type && p.type.includes(selectedType));
  });

  // Extract Sizes for chosen type
  const availableSizes = [
    'الكل',
    ...Array.from(new Set(productsByType.map((p) => p.size).filter(Boolean))) as string[],
  ];
  const requestedSize = searchParams.get('size') || 'الكل';
  const selectedSize = availableSizes.includes(requestedSize) ? requestedSize : 'الكل';

  const updateSelection = (type: string, size?: string) => {
    const next = new URLSearchParams(searchParams);
    type === 'الكل' ? next.delete('type') : next.set('type', type);
    if (!size || size === 'الكل') next.delete('size');
    else next.set('size', size);
    setSearchParams(next, { replace: true });
  };

  // Final Filter
  const finalFiltered = productsByType.filter((p) => {
    if (selectedSize === 'الكل') return true;
    return p.size === selectedSize;
  });

  return (
    <div className="mx-auto max-w-[920px] space-y-5">
      {/* 1. Visual Cards for Brick Types */}
      <section className="space-y-3 rounded-2xl border border-surface-200 bg-white p-4 shadow-subtle sm:p-5">
        <BrowseStepHeader
          number={3}
          title="اختر النوع ثم المقاس"
          description="ابدأ بنوع الياجور أو البلوك، ثم اختر المقاس إن وجد."
        />
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3">
          {visibleMainTypes.map((item) => {
            const isSelected = selectedType === item.value;
            const count = countForType(item.value);

            return (
              <button
                key={item.value}
                type="button"
                onClick={() => {
                  updateSelection(item.value);
                }}
                className={`p-3 rounded-2xl border text-right transition-all flex flex-col justify-between min-h-[92px] ${
                  isSelected
                    ? 'bg-brand-navy text-white border-brand-navy shadow-subtle'
                    : 'bg-white text-surface-800 border-surface-200 hover:bg-surface-50'
                }`}
              >
                <div className="flex items-center justify-between w-full">
                  <span className="font-bold text-sm leading-tight">{item.label}</span>
                  <div className="w-8 h-8 rounded-lg bg-surface-50 p-0.5 overflow-hidden flex-shrink-0">
                    <CategoryImage categoryName="الياجور والبلوك" className="w-full h-full" />
                  </div>
                </div>
                <span
                  className={`text-xs font-semibold ${
                    isSelected ? 'text-blue-200' : 'text-surface-500'
                  }`}
                >
                  {count} صنفًا
                </span>
              </button>
            );
          })}
        </div>
      </section>

      {/* 2. Size Selector if available */}
      {availableSizes.length > 2 && (
        <div className="bg-white p-3.5 sm:p-4 rounded-2xl border border-surface-200 shadow-subtle space-y-2">
          <span className="text-xs font-bold text-surface-900 sm:text-sm">المقاس المتاح للنوع المختار:</span>
          <div className="flex flex-wrap gap-2">
            {availableSizes.map((size) => {
              const isSelected = selectedSize === size;
              return (
                <button
                  key={size}
                  type="button"
                  onClick={() => updateSelection(selectedType, size)}
                  className={`min-h-[44px] rounded-input border px-3.5 py-2 text-xs font-bold transition-all sm:text-sm ${
                    isSelected
                      ? 'bg-brand-navy text-white border-brand-navy'
                      : 'bg-surface-50 text-surface-700 border-surface-200 hover:bg-surface-100'
                  }`}
                >
                  {size}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* 3. Results List in Unified Card */}
      <div className="space-y-2.5">
        <BrowseStepHeader
          number={4}
          title="اختر الصنف والسعر"
          description="النتائج أدناه مطابقة للنوع والمقاس اللذين اخترتهما."
          count={finalFiltered.length}
        />

        {finalFiltered.length === 0 ? (
          <EmptyState
            title="لا توجد أصناف مطابقة"
            description="يرجى اختيار مقاس أو نوع آخر."
          />
        ) : (
          <ProgressiveProductRows
            products={finalFiltered}
            ariaLabel="أصناف الياجور والبلوك"
            resetKey={`${selectedType}-${selectedSize}`}
          />
        )}
      </div>
    </div>
  );
};
