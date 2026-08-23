import React from 'react';
import { ProductDTO } from '../../types/product';
import { cleanUnitName } from '../../lib/formatters';
import { getProductSubtitle } from '../../lib/productPresentation';
import { PriceDisplay } from './PriceDisplay';
import { PriceActions } from './PriceActions';
import { ProductIdBadge } from './ProductIdBadge';

interface ProductCatalogTableProps {
  products: ProductDTO[];
  ariaLabel?: string;
}

const cleanValue = (value: string | null | undefined): string => value?.trim() || '';

export const ProductCatalogTable: React.FC<ProductCatalogTableProps> = ({
  products,
  ariaLabel = 'جدول أصناف وأسعار مواد البناء',
}) => {
  const showType = products.some((product) => cleanValue(product.type));
  const showSize = products.some((product) => cleanValue(product.size));
  const showManufacturer = products.some((product) => cleanValue(product.manufacturer || product.origin));
  const showUnit = products.some((product) => cleanValue(product.unit) && cleanUnitName(product.unit));

  return (
    <>
    <div className="hidden overflow-hidden rounded-xl border border-surface-300 bg-white lg:block">
      <table className="w-full border-collapse text-right" aria-label={ariaLabel}>
        <thead className="bg-brand-950 text-white">
          <tr>
            <th scope="col" className="border-l border-white/10 px-3 py-3.5 text-sm font-extrabold">رقم الصنف</th>
            <th scope="col" className="border-l border-white/10 px-3 py-3.5 text-sm font-extrabold">التصنيف</th>
            <th scope="col" className="border-l border-white/10 px-3 py-3.5 text-sm font-extrabold">المادة</th>
            {showType && <th scope="col" className="border-l border-white/10 px-3 py-3.5 text-sm font-extrabold">النوع</th>}
            {showSize && <th scope="col" className="border-l border-white/10 px-3 py-3.5 text-sm font-extrabold">المقاس</th>}
            {showManufacturer && <th scope="col" className="border-l border-white/10 px-3 py-3.5 text-sm font-extrabold">المصنع</th>}
            {showUnit && <th scope="col" className="border-l border-white/10 px-3 py-3.5 text-sm font-extrabold">الوحدة</th>}
            <th scope="col" className="border-l border-white/10 px-3 py-3.5 text-sm font-extrabold">السعر</th>
            <th scope="col" className="px-3 py-3.5 text-sm font-extrabold">نسخ / مشاركة</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-surface-200">
          {products.map((product) => (
            <tr key={product.id} className="transition-colors hover:bg-sand-50/70">
              <td dir="ltr" className="px-3 py-3.5 text-[13px] font-black tabular-nums text-brand-navy">{product.id}</td>
              <td className="px-3 py-3.5 text-[13px] font-bold text-surface-600">{product.category}</td>
              <td className="px-3 py-3.5 text-[15px] font-extrabold leading-6 text-brand-950">{product.name}</td>
              {showType && <td className="px-3 py-3.5 text-[13px] font-semibold text-surface-700">{cleanValue(product.type)}</td>}
              {showSize && <td className="px-3 py-3.5 text-[13px] font-bold text-surface-700">{cleanValue(product.size)}</td>}
              {showManufacturer && <td className="px-3 py-3.5 text-[13px] font-semibold text-surface-700">{cleanValue(product.manufacturer || product.origin)}</td>}
              {showUnit && <td className="px-3 py-3.5 text-[13px] font-bold text-surface-700">{cleanUnitName(product.unit)}</td>}
              <td className="px-3 py-3">
                <PriceDisplay
                  price={product.price}
                  unit={product.unit}
                  available={product.available}
                  size="sm"
                />
              </td>
              <td className="px-2 py-2">
                <PriceActions product={product} compact className="justify-end" />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>

    <div role="list" aria-label={ariaLabel} className="space-y-3 lg:hidden">
      {products.map((product) => {
        const subtitle = getProductSubtitle(product, true);
        const unit = cleanUnitName(product.unit);
        const metadata = [subtitle, unit].filter(Boolean).join(' • ');

        return (
          <article
            key={product.id}
            role="listitem"
            className="rounded-xl border border-surface-300 bg-white p-4 text-right"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0 flex-1">
                <ProductIdBadge productId={product.id} className="mb-1.5" />
                <h3 className="text-[15px] font-extrabold leading-6 text-brand-950">{product.name}</h3>
                {metadata && (
                  <p className="mt-1 break-words text-xs font-semibold leading-5 text-surface-500">{metadata}</p>
                )}
              </div>
              <PriceDisplay
                price={product.price}
                unit={product.unit}
                available={product.available}
                size="md"
                className="flex-shrink-0"
              />
            </div>
            <PriceActions product={product} compact className="mt-3 justify-end border-t border-surface-200 pt-3" />
          </article>
        );
      })}
    </div>
    </>
  );
};
