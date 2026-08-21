import React from 'react';
import { useSearchParams } from 'react-router-dom';
import { ProductDTO } from '../../types/product';
import { extractIronSizes } from '../../services/productService';
import { ProgressiveProductRows } from '../ui/ProgressiveProductRows';
import { EmptyState } from '../states/EmptyState';
import { BrowseStepHeader } from '../navigation/BrowseStepHeader';

interface IronFlowProps {
  products: ProductDTO[];
}

export const IronFlow: React.FC<IronFlowProps> = ({ products }) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const types = Array.from(
    new Set(products.map((product) => product.type || product.subcategory).filter(Boolean)),
  ) as string[];
  const requestedType = searchParams.get('type') || '';
  const selectedType = types.includes(requestedType) ? requestedType : (types[0] || 'حديد تسليح');
  const typeProducts = types.length > 1
    ? products.filter((product) => (product.type || product.subcategory) === selectedType)
    : products;
  const sizes = extractIronSizes(typeProducts);
  const sizeOptions = ['الكل', ...sizes];

  const requestedSize = searchParams.get('size') || '';
  const selectedSize = sizes.includes(requestedSize) ? requestedSize : 'الكل';

  const selectSize = (size: string) => {
    const next = new URLSearchParams(searchParams);
    size === 'الكل' ? next.delete('size') : next.set('size', size);
    setSearchParams(next, { replace: true });
  };

  const selectType = (type: string) => {
    const next = new URLSearchParams(searchParams);
    next.set('type', type);
    next.delete('size');
    setSearchParams(next, { replace: true });
  };

  const filteredProducts = typeProducts.filter((p) => {
    if (selectedSize === 'الكل') return true;
    return p.size === selectedSize || p.name.includes(selectedSize);
  });

  return (
    <div className="mx-auto max-w-[920px] space-y-5">
      {/* 1. Size Selector Header & Large Touch Buttons */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-surface-200 shadow-subtle space-y-3">
        <div className="flex items-start justify-between gap-3">
          <BrowseStepHeader
            number={3}
            title={types.length > 1 ? 'اختر نوع الحديد ثم المقاس' : 'اختر مقاس حديد التسليح'}
            description="بعد اختيار المقاس تظهر المصانع أو المصادر المتاحة وأسعارها."
          />
          {selectedSize !== 'الكل' && (
            <span className="flex-shrink-0 rounded-md border border-brand-100 bg-brand-50 px-2.5 py-1 text-xs font-bold text-brand-navy">
              المختار: {selectedSize}
            </span>
          )}
        </div>

        <p className="border-r-2 border-brand-navy pr-3 text-xs font-medium leading-6 text-surface-600 sm:text-sm">
          <strong className="text-surface-900">أساس التصنيف:</strong>{' '}
          {selectedType} ← المقاس بالملليمتر ← المصنع أو المصدر ← سعر الطن.
        </p>

        {types.length > 1 && (
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
            {types.map((type) => {
              const isSelected = type === selectedType;
              const count = products.filter(
                (product) => (product.type || product.subcategory) === type,
              ).length;
              return (
                <button
                  key={type}
                  type="button"
                  onClick={() => selectType(type)}
                  className={`min-h-[48px] rounded-lg border px-3 py-2 text-xs font-bold transition-colors sm:text-sm ${
                    isSelected
                      ? 'border-brand-navy bg-brand-navy text-white'
                      : 'border-surface-200 bg-surface-50 text-surface-800 hover:border-brand-200'
                  }`}
                >
                  <span className="block">{type}</span>
                  <span className={`block text-[10px] ${isSelected ? 'text-blue-100' : 'text-surface-500'}`}>
                    {count} صنفًا
                  </span>
                </button>
              );
            })}
          </div>
        )}

        <div className="grid grid-cols-4 gap-2 sm:flex sm:flex-wrap sm:gap-2.5">
          {sizeOptions.map((size) => {
            const isSelected = selectedSize === size;
            const countForSize = size === 'الكل'
              ? typeProducts.length
              : typeProducts.filter((p) => p.size === size || p.name.includes(size)).length;

            return (
              <button
                key={size}
                type="button"
                onClick={() => selectSize(size)}
                className={`flex h-[52px] min-w-0 flex-col items-center justify-center rounded-input border px-1.5 text-xs font-bold transition-all active:scale-95 sm:min-w-[86px] sm:flex-initial sm:px-3.5 sm:text-base ${
                  isSelected
                    ? 'bg-brand-navy text-white border-brand-navy shadow-subtle'
                    : 'bg-surface-50 text-surface-800 border-surface-200 hover:bg-surface-100 hover:border-surface-300'
                }`}
              >
                <span className="leading-tight">{size}</span>
                <span
                  className={`text-[10px] font-medium leading-none mt-0.5 ${
                    isSelected ? 'text-blue-200' : 'text-surface-400'
                  }`}
                >
                  {countForSize} صنفًا
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. Results List in Unified Card */}
      <div className="space-y-2.5">
        <BrowseStepHeader
          number={4}
          title={selectedSize === 'الكل' ? 'كل أصناف الحديد المتاحة' : `اختر المصنع أو المصدر — ${selectedSize}`}
          description={selectedSize === 'الكل' ? 'اختر مقاسًا للتضييق، أو انسخ السعر مباشرة من القائمة.' : 'كل صف يمثل مصدرًا متاحًا للمقاس المختار مع سعره الحالي.'}
          count={filteredProducts.length}
        />

        {filteredProducts.length === 0 ? (
          <EmptyState
            title="لا توجد أصناف متاحة لهذا المقاس"
            description="يرجى اختيار مقاس آخر من القائمة أعلاه."
          />
        ) : (
          <ProgressiveProductRows
            products={filteredProducts}
            ariaLabel={selectedSize === 'الكل' ? 'كل أصناف الحديد' : `أصناف حديد ${selectedSize}`}
            highlightSpec={selectedSize === 'الكل' ? undefined : selectedSize}
            resetKey={`${selectedType}-${selectedSize}`}
          />
        )}
      </div>
    </div>
  );
};
