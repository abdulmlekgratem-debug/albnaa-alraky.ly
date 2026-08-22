import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Check,
  ChevronDown,
  Grid3X3,
  MapPin,
  MoveHorizontal,
  Search,
  SlidersHorizontal,
  X,
} from 'lucide-react';
import { getSearchSuggestions, searchProducts } from '../../lib/arabicSearch';
import { getCategoryAsset } from '../../lib/categoryAssets';
import { TOP_CATEGORIES } from '../../lib/constants';
import { CategorySummary, CitySummary, ProductDTO } from '../../types/product';
import { ProductRow } from '../ui/ProductRow';

const ALL_CATEGORIES = 'الكل';
const HOME_PAGE_SIZE = 10;
type FacetKey = 'type' | 'size' | 'manufacturer';

const FACET_DEFINITIONS: Array<{ key: FacetKey; label: string; allLabel: string }> = [
  { key: 'type', label: 'النوع', allLabel: 'كل الأنواع' },
  { key: 'size', label: 'المقاس', allLabel: 'كل المقاسات' },
  { key: 'manufacturer', label: 'المصنع', allLabel: 'كل المصانع' },
];

interface HomePriceBrowserProps {
  products: ProductDTO[];
  categories: CategorySummary[];
  cities: CitySummary[];
  selectedCity: string;
  onCitySelect: (city: string) => void;
}

interface CategoryPreview {
  category: CategorySummary;
  icon: string;
  fallbackIcon: string;
}

const ThumbnailImage: React.FC<{
  src: string;
  fallback: string;
  alt: string;
  className?: string;
}> = ({ src, fallback, alt, className = '' }) => {
  const [failed, setFailed] = useState(false);

  useEffect(() => setFailed(false), [src]);

  return (
    <img
      src={failed ? fallback : src}
      alt={alt}
      loading="lazy"
      onError={() => setFailed(true)}
      className={`h-full w-full object-contain ${className}`}
    />
  );
};

export const HomePriceBrowser: React.FC<HomePriceBrowserProps> = ({
  products,
  categories,
  cities,
  selectedCity,
  onCitySelect,
}) => {
  const [selectedCategory, setSelectedCategory] = useState(ALL_CATEGORIES);
  const [selectedFacetValues, setSelectedFacetValues] = useState<Partial<Record<FacetKey, string>>>({});
  const [query, setQuery] = useState('');
  const [visibleCount, setVisibleCount] = useState(HOME_PAGE_SIZE);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const resultsRef = useRef<HTMLElement>(null);

  const orderedCategories = useMemo(() => {
    const priority = TOP_CATEGORIES.flatMap((name) => {
      const category = categories.find((item) => item.name === name);
      return category ? [category] : [];
    });
    const rest = categories.filter((item) => !TOP_CATEGORIES.includes(item.name));
    return [...priority, ...rest];
  }, [categories]);

  const categoryPreviews = useMemo<CategoryPreview[]>(() => {
    return orderedCategories.map((category) => {
      const categoryAsset = getCategoryAsset(category.name);

      return {
        category,
        icon: categoryAsset.icon,
        fallbackIcon: '/images/categories/other.svg',
      };
    });
  }, [orderedCategories]);

  useEffect(() => {
    if (
      selectedCategory !== ALL_CATEGORIES &&
      !categories.some((category) => category.name === selectedCategory)
    ) {
      setSelectedCategory(ALL_CATEGORIES);
    }
  }, [categories, selectedCategory]);

  const productsForCategory = useMemo(() => {
    if (selectedCategory === ALL_CATEGORIES) return products;
    return products.filter((product) => product.category === selectedCategory);
  }, [products, selectedCategory]);

  const activeFacets = useMemo(() => {
    if (selectedCategory === ALL_CATEGORIES) return [];
    return FACET_DEFINITIONS.flatMap((definition) => {
      const values = Array.from(new Set(
        productsForCategory
          .map((product) => product[definition.key]?.trim())
          .filter((value): value is string => Boolean(value)),
      )).sort((left, right) => left.localeCompare(right, 'ar', { numeric: true }));

      return values.length >= 2 ? [{ ...definition, values }] : [];
    });
  }, [productsForCategory, selectedCategory]);

  useEffect(() => {
    setSelectedFacetValues((current) => {
      const next: Partial<Record<FacetKey, string>> = {};
      activeFacets.forEach((facet) => {
        const value = current[facet.key];
        if (value && facet.values.includes(value)) next[facet.key] = value;
      });
      return JSON.stringify(next) === JSON.stringify(current) ? current : next;
    });
  }, [activeFacets]);

  const facetedProducts = useMemo(() => {
    const selectedEntries = Object.entries(selectedFacetValues) as Array<[FacetKey, string]>;
    if (selectedEntries.length === 0) return productsForCategory;
    return productsForCategory.filter((product) =>
      selectedEntries.every(([key, value]) => product[key]?.trim() === value),
    );
  }, [productsForCategory, selectedFacetValues]);

  const visibleProducts = useMemo(
    () => searchProducts(facetedProducts, query),
    [facetedProducts, query],
  );

  useEffect(() => {
    setVisibleCount(HOME_PAGE_SIZE);
  }, [selectedCity, selectedCategory, selectedFacetValues, query]);

  const displayedProducts = visibleProducts.slice(0, visibleCount);
  const remainingProducts = Math.max(0, visibleProducts.length - displayedProducts.length);
  const nextBatchSize = Math.min(HOME_PAGE_SIZE, remainingProducts);

  const suggestions = useMemo(
    () => getSearchSuggestions(products, query, 5),
    [products, query],
  );

  const handleCitySelect = (city: string) => {
    setSelectedCategory(ALL_CATEGORIES);
    setSelectedFacetValues({});
    setFiltersOpen(false);
    setQuery('');
    onCitySelect(city);
  };

  const handleCategorySelect = (category: string) => {
    setSelectedCategory(category);
    setSelectedFacetValues({});
    setFiltersOpen(false);
    setQuery('');

    // On phones, a category tap means “show me its prices”. Move the result
    // list into view while keeping filters available just above it.
    if (typeof window !== 'undefined' && window.innerWidth < 768) {
      window.requestAnimationFrame(() => {
        const reduceMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;
        resultsRef.current?.scrollIntoView?.({
          behavior: reduceMotion ? 'auto' : 'smooth',
          block: 'start',
        });
      });
    }
  };

  const handleQueryChange = (value: string) => {
    setSelectedCategory(ALL_CATEGORIES);
    setSelectedFacetValues({});
    setQuery(value);
  };

  const selectedFacetLabel = Object.values(selectedFacetValues).filter(Boolean).join('، ');
  const selectedFacetCount = Object.values(selectedFacetValues).filter(Boolean).length;
  const activeLabel = query.trim()
    ? `نتائج البحث عن «${query.trim()}»`
    : selectedCategory === ALL_CATEGORIES
      ? `كل المواد المتاحة في ${selectedCity}`
      : `${selectedCategory}${selectedFacetLabel ? ` – ${selectedFacetLabel}` : ''} في ${selectedCity}`;

  return (
    <section id="materials" className="relative z-20 mt-3 sm:-mt-8 scroll-mt-20 pb-12 sm:pb-16">
      <div className="mx-auto max-w-[1240px] px-3 sm:px-6 lg:px-8">
        <div className="overflow-hidden rounded-[24px] border border-surface-200 bg-white shadow-premium">
          <header className="border-b border-surface-200 bg-sand-50 px-4 py-4 sm:px-6 sm:py-5">
            <div>
              <span className="text-sm font-extrabold text-sand-700">الوصول السريع للأسعار</span>
                <h2 className="mt-1 text-2xl font-black leading-snug text-brand-950 sm:text-3xl">
                اختر المدينة، ثم المادة أو ابحث مباشرة
              </h2>
            </div>
          </header>

          <div className="space-y-6 p-4 sm:p-6">
            <section aria-labelledby="home-city-title">
              <div className="mb-3 flex items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-brand-navy text-sm font-black text-white">1</span>
                  <div>
                    <h3 id="home-city-title" className="text-lg font-black text-brand-950">مدينة السعر</h3>
                    <p className="text-xs font-bold text-surface-500">الأسعار تتغير فورًا حسب المدينة.</p>
                  </div>
                </div>
                <span className="hidden items-center gap-1.5 rounded-full bg-brand-50 px-3 py-1.5 text-xs font-extrabold text-brand-navy sm:inline-flex">
                  <MapPin className="h-4 w-4" aria-hidden="true" />
                  {selectedCity} محددة
                </span>
              </div>

              <div
                role="radiogroup"
                aria-label="اختر مدينة الأسعار"
                className="grid grid-cols-2 gap-2.5 sm:grid-cols-4"
              >
                {cities.map((city) => {
                  const selected = city.name === selectedCity;
                  const enabled = city.availableCount > 0;
                  return (
                    <button
                      key={city.name}
                      type="button"
                      role="radio"
                      aria-checked={selected}
                      disabled={!enabled}
                      onClick={() => handleCitySelect(city.name)}
                      className={`relative min-h-[72px] min-w-0 w-full rounded-xl border-2 px-3 py-2.5 text-right transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-navy focus-visible:ring-offset-2 ${
                        selected
                          ? 'border-brand-navy bg-brand-navy text-white shadow-md shadow-brand-950/15'
                          : enabled
                            ? 'border-surface-200 bg-white text-surface-900 hover:border-brand-300 hover:bg-brand-50 active:bg-brand-100'
                            : 'cursor-not-allowed border-surface-200 bg-surface-100 text-surface-400 opacity-70'
                      }`}
                    >
                      <span className="flex items-center justify-between gap-2">
                        <span className="text-base font-black sm:text-lg">{city.name}</span>
                        {selected ? (
                          <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-white text-brand-navy">
                            <Check className="h-4 w-4" strokeWidth={3} aria-hidden="true" />
                          </span>
                        ) : (
                          <MapPin className="h-5 w-5 text-brand-500" aria-hidden="true" />
                        )}
                      </span>
                      <span className={`mt-1 block text-xs font-bold ${selected ? 'text-blue-100' : 'text-surface-500'}`}>
                        {enabled ? `${city.availableCount} صنفًا` : 'لا توجد أسعار'}
                      </span>
                    </button>
                  );
                })}
              </div>
            </section>

            <section className="border-t border-surface-200 pt-5" aria-labelledby="home-category-title">
              <div className="mb-3 flex items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-brand-navy text-sm font-black text-white">2</span>
                  <div>
                    <h3 id="home-category-title" className="text-lg font-black text-brand-950">مادة البناء</h3>
                    <p className="flex items-center gap-1 text-xs font-bold text-surface-500">
                      <MoveHorizontal className="h-4 w-4" aria-hidden="true" />
                      اسحب الصور يمينًا ويسارًا للتنقل.
                    </p>
                  </div>
                </div>

              </div>

              <div
                dir="rtl"
                className="no-scrollbar flex snap-x snap-mandatory gap-3 overflow-x-auto overscroll-x-contain pb-2 md:grid md:grid-cols-5 md:overflow-visible"
              >
                <button
                  type="button"
                  aria-pressed={selectedCategory === ALL_CATEGORIES}
                  aria-label={`عرض كل المواد، ${products.length} صنفًا`}
                  onClick={() => handleCategorySelect(ALL_CATEGORIES)}
                  className={`group relative min-h-[164px] w-[132px] flex-none snap-start rounded-2xl border-2 p-3 text-center transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-navy focus-visible:ring-offset-2 sm:w-[142px] md:w-auto ${
                    selectedCategory === ALL_CATEGORIES
                      ? 'border-brand-navy bg-brand-50 shadow-md shadow-brand-950/10'
                      : 'border-surface-200 bg-white hover:border-brand-300 hover:bg-surface-50'
                  }`}
                >
                  <span
                    data-transparent-category-icon="true"
                    className="mx-auto flex h-[94px] w-[94px] items-center justify-center bg-transparent text-brand-navy"
                  >
                    <Grid3X3 className="h-[70px] w-[70px]" strokeWidth={1.6} aria-hidden="true" />
                  </span>
                  <span className="mt-2.5 block text-[15px] font-black leading-5 text-brand-950">كل المواد</span>
                  <span className="mt-0.5 block text-xs font-bold text-surface-500">{products.length} صنفًا</span>
                  {selectedCategory === ALL_CATEGORIES && (
                    <span className="absolute left-1.5 top-1.5 inline-flex h-6 w-6 items-center justify-center rounded-full bg-brand-navy text-white">
                      <Check className="h-3.5 w-3.5" strokeWidth={3} aria-hidden="true" />
                    </span>
                  )}
                </button>

                {categoryPreviews.map(({ category, icon, fallbackIcon }) => {
                  const selected = selectedCategory === category.name;
                  return (
                    <button
                      key={category.name}
                      type="button"
                      aria-pressed={selected}
                      aria-label={`عرض ${category.name}، ${category.count} صنفًا`}
                      onClick={() => handleCategorySelect(category.name)}
                      className={`group relative min-h-[164px] w-[132px] flex-none snap-start rounded-2xl border-2 p-3 text-center transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-navy focus-visible:ring-offset-2 sm:w-[142px] md:w-auto ${
                        selected
                          ? 'border-brand-navy bg-brand-50 shadow-md shadow-brand-950/10'
                          : 'border-surface-200 bg-white hover:border-brand-300 hover:bg-surface-50'
                      }`}
                    >
                      <span
                        data-transparent-category-icon="true"
                        className="mx-auto block h-[94px] w-[94px] bg-transparent p-0"
                      >
                        <ThumbnailImage
                          src={icon}
                          fallback={fallbackIcon}
                          alt={`أيقونة ${category.name}`}
                        />
                      </span>
                      <span className="mt-2.5 block line-clamp-2 text-[15px] font-black leading-5 text-brand-950">{category.name}</span>
                      <span className="mt-0.5 block text-xs font-bold text-surface-500">{category.count} صنفًا</span>
                      {selected && (
                        <span className="absolute left-1.5 top-1.5 inline-flex h-6 w-6 items-center justify-center rounded-full bg-brand-navy text-white">
                          <Check className="h-3.5 w-3.5" strokeWidth={3} aria-hidden="true" />
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>

              {activeFacets.length > 0 && (
                <div className="mt-4 rounded-2xl border border-brand-100 bg-brand-50/70 p-3.5 sm:p-4">
                  <button
                    type="button"
                    aria-expanded={filtersOpen}
                    aria-controls="home-category-filters"
                    onClick={() => setFiltersOpen((current) => !current)}
                    className="flex min-h-[48px] w-full items-center justify-between gap-3 rounded-xl px-1 text-right text-brand-950 transition-colors hover:text-brand-navy focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-navy"
                  >
                    <span className="flex min-w-0 items-center gap-2.5">
                      <span className="inline-flex h-9 w-9 flex-none items-center justify-center rounded-lg bg-white text-brand-navy shadow-sm">
                        <SlidersHorizontal className="h-5 w-5" aria-hidden="true" />
                      </span>
                      <span className="min-w-0">
                        <span className="block text-sm font-black sm:text-base">
                          تصفية نتائج {selectedCategory} <span className="text-xs text-surface-500">(اختياري)</span>
                        </span>
                        <span className="mt-0.5 block truncate text-xs font-bold text-surface-600">
                          {selectedFacetLabel || `${activeFacets.length} خيارات لتضييق النتائج`}
                        </span>
                      </span>
                    </span>
                    <span className="flex flex-none items-center gap-2">
                      {selectedFacetCount > 0 && (
                        <span className="rounded-full bg-brand-navy px-2.5 py-1 text-xs font-black text-white">
                          {selectedFacetCount}
                        </span>
                      )}
                      <ChevronDown
                        className={`h-5 w-5 transition-transform ${filtersOpen ? 'rotate-180' : ''}`}
                        aria-hidden="true"
                      />
                    </span>
                  </button>

                  {filtersOpen && (
                    <div id="home-category-filters" className="mt-3 space-y-3 border-t border-brand-100 pt-3">
                      {activeFacets.map((facet) => (
                        <div key={facet.key} className="sm:flex sm:items-start sm:gap-3">
                          <span className="mb-2 block min-w-16 pt-2 text-sm font-extrabold text-surface-700 sm:mb-0">
                            {facet.label}
                          </span>
                          <div className="no-scrollbar flex min-w-0 flex-1 gap-2 overflow-x-auto pb-1 md:flex-wrap md:overflow-visible" role="group" aria-label={`فلترة ${selectedCategory} حسب ${facet.label}`}>
                            <button
                              type="button"
                              aria-pressed={!selectedFacetValues[facet.key]}
                              onClick={() => setSelectedFacetValues((current) => ({ ...current, [facet.key]: '' }))}
                              className={`min-h-[44px] flex-none rounded-xl border px-3.5 text-sm font-extrabold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-navy ${
                                !selectedFacetValues[facet.key]
                                  ? 'border-brand-navy bg-brand-navy text-white'
                                  : 'border-surface-300 bg-white text-brand-950 hover:border-brand-300 hover:bg-brand-50'
                              }`}
                            >
                              {facet.allLabel}
                            </button>
                            {facet.values.map((value) => {
                              const selected = selectedFacetValues[facet.key] === value;
                              return (
                                <button
                                  key={value}
                                  type="button"
                                  aria-pressed={selected}
                                  onClick={() => setSelectedFacetValues((current) => ({ ...current, [facet.key]: value }))}
                                  className={`min-h-[44px] flex-none rounded-xl border px-3.5 text-sm font-extrabold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-navy ${
                                    selected
                                      ? 'border-brand-navy bg-brand-navy text-white'
                                      : 'border-surface-300 bg-white text-brand-950 hover:border-brand-300 hover:bg-brand-50'
                                  }`}
                                >
                                  {value}
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </section>

            <section className="border-t border-surface-200 pt-5" aria-labelledby="home-search-title">
              <div className="mb-3 flex items-center gap-2.5">
                <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-brand-navy text-sm font-black text-white">3</span>
                <div>
                  <h3 id="home-search-title" className="text-lg font-black text-brand-950">بحث سريع</h3>
                  <p className="text-xs font-bold text-surface-500">اكتب الاسم أو المقاس أو المصنع، حتى مع خطأ بسيط.</p>
                </div>
              </div>

              <label className="block">
                <span className="sr-only">ابحث في جميع مواد البناء</span>
                <span className="relative flex items-center">
                  <Search className="pointer-events-none absolute right-4 h-5 w-5 text-brand-navy" aria-hidden="true" />
                  <input
                    type="text"
                    role="searchbox"
                    value={query}
                    onChange={(event) => handleQueryChange(event.target.value)}
                    placeholder="مثال: حديد 12، أسمنت اتحاد، بلوك 20..."
                    autoComplete="off"
                    className="min-h-[58px] w-full rounded-xl border-2 border-surface-300 bg-white py-3.5 pl-12 pr-12 text-base font-bold text-surface-900 outline-none transition-colors placeholder:text-surface-400 focus:border-brand-navy focus:ring-2 focus:ring-brand-100"
                  />
                  {query && (
                    <button
                      type="button"
                      onClick={() => setQuery('')}
                      aria-label="مسح البحث"
                      className="absolute left-2 inline-flex h-11 w-11 items-center justify-center rounded-lg text-surface-600 transition-colors hover:bg-surface-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-navy"
                    >
                      <X className="h-5 w-5" aria-hidden="true" />
                    </button>
                  )}
                </span>
              </label>

              {query.trim().length >= 2 && suggestions.length > 0 && (
                <div className="no-scrollbar mt-2.5 flex gap-2 overflow-x-auto pb-1" aria-label="اقتراحات البحث السريعة">
                  {suggestions.map((product) => (
                    <button
                      key={product.id}
                      type="button"
                      onClick={() => handleQueryChange(product.name)}
                      className="min-h-[44px] flex-none rounded-full border border-brand-200 bg-brand-50 px-4 text-sm font-extrabold text-brand-navy transition-colors hover:border-brand-navy hover:bg-brand-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-navy"
                    >
                      {product.name}
                    </button>
                  ))}
                </div>
              )}
            </section>

            <section ref={resultsRef} className="scroll-mt-20" aria-labelledby="home-results-title">
              <div
                className="rounded-2xl border border-surface-200 bg-white shadow-inner"
              >
                <div className="sticky top-[76px] z-10 flex min-h-[66px] items-center justify-between gap-3 border-b border-surface-200 bg-white/95 px-4 py-3 backdrop-blur-sm sm:top-24 sm:px-5">
                  <div className="min-w-0">
                    <h3 id="home-results-title" className="truncate text-base font-black text-brand-950 sm:text-lg">
                      {activeLabel}
                    </h3>
                    <p className="text-xs font-bold text-surface-500">
                      يظهر {displayedProducts.length} من {visibleProducts.length}؛ استخدم «عرض المزيد» عند الحاجة.
                    </p>
                  </div>
                  <span aria-live="polite" className="flex-shrink-0 rounded-full bg-brand-navy px-3 py-1.5 text-xs font-black text-white sm:text-sm">
                    {visibleProducts.length} صنفًا
                  </span>
                </div>

                {visibleProducts.length === 0 ? (
                  <div className="flex min-h-[320px] flex-col items-center justify-center px-5 text-center">
                    <span className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-surface-100 text-brand-navy">
                      <Search className="h-7 w-7" aria-hidden="true" />
                    </span>
                    <h4 className="mt-4 text-xl font-black text-brand-950">لا توجد نتيجة مطابقة</h4>
                    <p className="mt-2 max-w-md text-sm font-semibold leading-7 text-surface-600">
                      جرّب كتابة كلمة أقصر، أو امسح البحث للعودة إلى كل المواد المتاحة في {selectedCity}.
                    </p>
                    <button
                      type="button"
                      onClick={() => {
                        setQuery('');
                        setSelectedCategory(ALL_CATEGORIES);
                      }}
                      className="mt-4 min-h-[48px] rounded-xl bg-brand-navy px-5 text-sm font-extrabold text-white transition-colors hover:bg-brand-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-navy focus-visible:ring-offset-2"
                    >
                      عرض كل المواد
                    </button>
                  </div>
                ) : (
                  <div
                    role="list"
                    aria-label={activeLabel}
                    className="divide-y divide-surface-200 lg:grid lg:grid-cols-2 lg:gap-3 lg:divide-y-0 lg:bg-surface-50 lg:p-3"
                  >
                    {displayedProducts.map((product) => (
                      <ProductRow
                        key={product.id}
                        product={product}
                        showCategory={selectedCategory === ALL_CATEGORIES}
                        className="lg:rounded-2xl lg:border lg:border-surface-200 lg:bg-white lg:shadow-sm"
                      />
                    ))}
                  </div>
                )}

                {remainingProducts > 0 && (
                  <div className="border-t border-surface-200 bg-white p-3 sm:p-4">
                    <button
                      type="button"
                      onClick={() => setVisibleCount((current) => current + HOME_PAGE_SIZE)}
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
            </section>
          </div>
        </div>
      </div>
    </section>
  );
};
