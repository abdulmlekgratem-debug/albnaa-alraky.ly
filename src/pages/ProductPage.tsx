import React, { useState } from 'react';
import { useLocation, useParams, Link } from 'react-router-dom';
import { Clock3, Share2, MapPin, ArrowLeft, ArrowRight, ShieldCheck } from 'lucide-react';
import { Header } from '../components/layout/Header';
import { PriceDisplay } from '../components/ui/PriceDisplay';
import { ProductList } from '../components/ui/ProductList';
import { ProductRow } from '../components/ui/ProductRow';
import { ProductImage } from '../components/ui/ProductImage';
import { SharePriceDialog } from '../components/ui/SharePriceDialog';
import { LoadingSkeleton } from '../components/states/LoadingSkeleton';
import { ErrorState } from '../components/states/ErrorState';
import { EmptyState } from '../components/states/EmptyState';
import { useProducts } from '../context/ProductContext';
import { BRAND } from '../lib/constants';
import { formatArabicDate } from '../lib/formatters';
import { PRICE_DISPLAY_CONFIG } from '../config/priceDisplay';
import { BrowseProgress } from '../components/navigation/BrowseProgress';
import { CitySelector } from '../components/ui/CitySelector';
import { ProductIdBadge } from '../components/ui/ProductIdBadge';

interface ProductNavigationState {
  browseFrom?: string;
  browseLabel?: string;
}

export const ProductPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const location = useLocation();
  const {
    products,
    isLoading,
    error,
    refreshPrices,
    cities,
    selectedCity,
    setSelectedCity,
  } = useProducts();
  const [shareOpen, setShareOpen] = useState(false);
  const isCalibrationMode = PRICE_DISPLAY_CONFIG.isCalibrationMode();

  const product = products.find((p) => p.id === id);

  const navigationState = location.state as ProductNavigationState | null;
  const categoryBackPath = product
    ? `/materials/${encodeURIComponent(product.category)}`
    : '/materials';
  const browseFrom = navigationState?.browseFrom || categoryBackPath;
  const browseLabel = navigationState?.browseLabel || `العودة إلى أصناف ${product?.category || 'المواد'}`;

  // Prefer variants that share the same size, then type, then subcategory.
  const relatedProducts = products
    .filter((candidate) => {
      if (candidate.id === id || candidate.category !== product?.category) return false;
      if (product?.size) return candidate.size === product.size;
      if (product?.type) return candidate.type === product.type;
      if (product?.subcategory) return candidate.subcategory === product.subcategory;
      return true;
    })
    .slice(0, 4);

  if (isLoading && products.length === 0) {
    return (
      <div className="min-h-screen bg-surface-50">
        <Header showBack={true} backTo="/materials" backLabel="العودة إلى المواد" />
        <div className="max-w-[1240px] mx-auto px-4 py-8">
          <LoadingSkeleton rows={4} />
        </div>
      </div>
    );
  }

  if (error && products.length === 0) {
    return (
      <div className="min-h-screen bg-surface-50">
        <Header showBack={true} backTo="/materials" backLabel="العودة إلى المواد" />
        <div className="max-w-[1240px] mx-auto px-4 py-12">
          <ErrorState message={error} onRetry={refreshPrices} />
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-surface-50">
        <Header title="المنتج غير موجود" showBack={true} backTo="/materials" backLabel="العودة إلى المواد" />
        <div className="max-w-[1240px] mx-auto px-4 py-12">
          <EmptyState
            title="لم يتم العثور على هذا الصنف"
            description="قد يكون تم تعديل المعرف أو إخفاء الصنف."
            actionText="عرض جميع المواد"
            actionHref="/materials"
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface-50">
      <Header
        title={product.category}
        showBack={true}
        backTo={browseFrom}
        backLabel={browseLabel}
      />

      <main id="city-scoped-content" className="mx-auto max-w-[1240px] space-y-5 px-4 py-5 sm:space-y-8 sm:px-6 sm:py-12 lg:px-8">
        <CitySelector
          cities={cities}
          selectedCity={selectedCity}
          onSelect={setSelectedCity}
        />

        <BrowseProgress
          city={selectedCity}
          category={product.category}
          specification={[product.type, product.size].filter(Boolean).join(' — ') || product.subcategory}
          productName={product.name}
          activeStep={4}
        />

        <Link
          to={browseFrom}
          className="inline-flex min-h-[44px] items-center gap-2 rounded-xl border border-surface-200 bg-white px-4 text-sm font-extrabold text-brand-navy shadow-xs transition-colors hover:bg-brand-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-navy"
        >
          <ArrowRight className="h-4 w-4" aria-hidden="true" />
          {browseLabel}
        </Link>

        {/* Clean 2-column Product Card */}
        <div className="mx-auto max-w-[960px] rounded-2xl border border-surface-200 bg-white p-4 shadow-subtle sm:p-10">
          <div className="grid grid-cols-1 items-center gap-5 sm:gap-8 md:grid-cols-12">
            {/* Product Real Image Frame */}
            <div className="order-2 md:order-1 md:col-span-5">
              <div className="w-full aspect-[4/3] rounded-xl bg-surface-50 border border-surface-200/70 p-4 flex items-center justify-center overflow-hidden">
                <ProductImage product={product} size="hero" className="border-0 bg-transparent p-0" />
              </div>
            </div>

            {/* Title, Specs & Price Block */}
            <div className="order-1 space-y-5 md:order-2 md:col-span-7">
              <div className="space-y-2">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="inline-block rounded-full border border-brand-100 bg-brand-50 px-3 py-1 text-xs font-bold text-brand-navy">
                      {product.category}
                    </span>
                    <ProductIdBadge productId={product.id} />
                  </div>
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-surface-500">
                    <MapPin className="w-3.5 h-3.5 text-brand-navy" />
                    <span>{selectedCity} – {BRAND.country}</span>
                  </div>
                </div>

                <h1 className="text-2xl sm:text-3xl font-extrabold text-surface-900 leading-tight">
                  {product.name}
                </h1>

                {(product.size || product.manufacturer || product.origin) && (
                  <p className="text-sm sm:text-base font-semibold text-surface-600">
                    {[product.size, product.manufacturer, product.origin]
                      .filter(Boolean)
                      .join(' — ')}
                  </p>
                )}
              </div>

              {/* Price Box */}
              <div className="p-5 rounded-xl bg-surface-50 border border-surface-200/80 space-y-1">
                <span className="block text-xs font-bold text-surface-500">
                  {isCalibrationMode ? `السعر المتاح حاليًا في ${selectedCity}:` : `سعر اليوم الحالي في ${selectedCity}:`}
                </span>
                <PriceDisplay
                  price={product.price}
                  unit={product.unit}
                  available={product.available}
                  size="lg"
                />
              </div>

              {/* Last updated & Unit info */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs sm:text-sm text-surface-600 pt-2 border-t border-surface-100">
                <div className="flex items-center gap-2">
                  <Clock3 className="w-4 h-4 text-brand-navy flex-shrink-0" />
                  <span>
                    آخر تحديث: {formatArabicDate(product.updatedAt)}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                  <span>
                    الوحدة المعتمدة:{' '}
                    {product.unit && product.unit.trim() !== 'غير محددة'
                      ? product.unit
                      : 'حسب المصدر'}
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => setShareOpen(true)}
                  className="flex min-h-[48px] w-full items-center justify-center gap-2 rounded-lg bg-brand-navy px-5 py-3 text-sm font-extrabold text-white transition-colors hover:bg-brand-900 active:bg-brand-950"
                >
                  <Share2 className="w-4 h-4" />
                  <span>مشاركة السعر والرابط</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Related Products in Unified Card */}
        {relatedProducts.length > 0 && (
          <section className="max-w-[960px] mx-auto space-y-3 pt-4">
            <div className="flex items-center justify-between px-1">
              <h3 className="font-extrabold text-base sm:text-lg text-surface-900">
                {product.size
                  ? `بدائل بنفس المقاس — ${product.size}`
                  : product.type
                    ? `أصناف أخرى من نوع ${product.type}`
                    : 'أصناف مشابهة'}
              </h3>
              <Link
                to={browseFrom}
                className="text-xs sm:text-sm font-bold text-brand-navy hover:underline flex items-center gap-1"
              >
                <span>العودة إلى القائمة</span>
                <ArrowLeft className="w-3.5 h-3.5" />
              </Link>
            </div>

            <p className="px-1 text-xs font-medium leading-6 text-surface-500 sm:text-sm">
              مصانع وأصناف أخرى متاحة بنفس المواصفة لتتمكن من مقارنة السعر والاختيار بسرعة.
            </p>

            <ProductList ariaLabel="بدائل ومصانع بنفس المواصفة">
              {relatedProducts.map((relProduct) => (
                <ProductRow
                  key={relProduct.id}
                  product={relProduct}
                  backTo={browseFrom}
                  backLabel={browseLabel}
                />
              ))}
            </ProductList>
          </section>
        )}
      </main>

      <SharePriceDialog
        open={shareOpen}
        product={product}
        city={selectedCity}
        onClose={() => setShareOpen(false)}
      />
    </div>
  );
};
