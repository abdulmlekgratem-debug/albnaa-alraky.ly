import React, { useState, useMemo } from 'react';
import { Search, X } from 'lucide-react';
import { Header } from '../components/layout/Header';
import { ProgressiveProductRows } from '../components/ui/ProgressiveProductRows';
import { SearchEmptyState } from '../components/states/SearchEmptyState';
import { useProducts } from '../context/ProductContext';
import { getSearchSuggestions, searchProducts } from '../lib/arabicSearch';
import { formatPrice } from '../lib/formatters';
import { CitySelector } from '../components/ui/CitySelector';
import { BrowseStepHeader } from '../components/navigation/BrowseStepHeader';

export const SearchPage: React.FC = () => {
  const { products, cities, selectedCity, setSelectedCity } = useProducts();
  const [query, setQuery] = useState('');

  const popularKeywords = useMemo(() => {
    const candidates = [
      'حديد 12',
      'حديد 8',
      'أسمنت',
      'ياجور 20',
      'رمل',
      'بلوك 15',
      'سلك رباط',
      'مصراتة',
      'كناوف',
      'شرشور',
    ];

    return candidates
      .filter((keyword) => searchProducts(products, keyword).length > 0)
      .slice(0, 8);
  }, [products]);

  const results = useMemo(() => {
    return searchProducts(products, query);
  }, [products, query]);

  const suggestions = useMemo(
    () => getSearchSuggestions(products, query, 5),
    [products, query],
  );

  return (
    <div className="min-h-screen bg-surface-50">
      <Header title={`البحث في أسعار ${selectedCity}`} showBack={true} backTo="/" backLabel="العودة إلى الرئيسية" />

      <main className="mx-auto max-w-[920px] space-y-6 px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
        <CitySelector
          cities={cities}
          selectedCity={selectedCity}
          onSelect={setSelectedCity}
        />

        {/* Search Input Box */}
        <section className="space-y-4 rounded-2xl border border-surface-200 bg-white p-4 shadow-subtle sm:p-5" aria-labelledby="search-products-title">
          <BrowseStepHeader
            number={2}
            id="search-products-title"
            title="ابحث عن الصنف"
            description="اكتب اسم المادة، ثم أضف المقاس أو المصنع إن أردت. نتعامل مع الأخطاء الإملائية البسيطة والكلمات الشائعة."
          />
          <div className="relative">
          <div className="relative flex items-center">
            <Search className="absolute right-4 w-5 h-5 text-brand-navy pointer-events-none" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="ابحث عن مادة، مقاس، مصنع أو تصنيف..."
              className="min-h-[60px] w-full rounded-xl border-2 border-surface-300 bg-sand-50/50 py-4 pl-11 pr-12 text-base font-bold text-surface-900 outline-none transition-colors placeholder:text-surface-400 focus:border-brand-navy focus:bg-white focus:ring-2 focus:ring-brand-100 sm:min-h-[64px]"
            />
            {query && (
              <button
                type="button"
                onClick={() => setQuery('')}
                aria-label="مسح نص البحث"
                className="absolute left-4 w-8 h-8 rounded-full bg-surface-100 text-surface-600 hover:bg-surface-200 flex items-center justify-center transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
          </div>
        </section>

        {!query && (
          <p className="rounded-xl border border-brand-100 bg-brand-50 px-4 py-3 text-sm font-bold leading-6 text-brand-950 sm:text-base">
            مثال للبحث: «حديد 12 مصراتة» أو «أسمنت اتحاد» أو «بلوك 20×20×40».
          </p>
        )}

        {query.trim().length >= 2 && suggestions.length > 0 && (
          <section className="space-y-2" aria-labelledby="quick-suggestions-title">
            <h2 id="quick-suggestions-title" className="text-base font-extrabold text-surface-800">
              اقتراحات سريعة حسب ما كتبت
            </h2>
            <div className="overflow-hidden rounded-xl border border-surface-200 bg-white divide-y divide-surface-200">
              {suggestions.map((product) => (
                <button
                  key={product.id}
                  type="button"
                  onClick={() => setQuery(product.name)}
                  className="flex min-h-[60px] w-full items-center justify-between gap-4 px-4 py-3 text-right transition-colors hover:bg-brand-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-brand-navy"
                >
                  <span className="min-w-0 truncate text-base font-extrabold text-surface-900">{product.name}</span>
                  <span dir="ltr" className="flex-shrink-0 text-base font-black tabular-nums text-brand-navy">
                    {formatPrice(product.price)}
                  </span>
                </button>
              ))}
            </div>
          </section>
        )}

        {/* Quick Suggestion Tags when query is empty */}
        {!query && (
          <div className="space-y-3">
            <h2 className="px-0.5 text-base font-extrabold text-surface-800">
              عمليات بحث شائعة في {selectedCity}:
            </h2>
            <div className="flex flex-wrap gap-2">
              {popularKeywords.map((kw) => (
                <button
                  key={kw}
                  type="button"
                  onClick={() => setQuery(kw)}
                  className="min-h-[48px] rounded-full border border-surface-200 bg-white px-4 py-2.5 text-sm font-bold text-surface-700 shadow-subtle transition-colors hover:border-brand-navy hover:bg-brand-50 hover:text-brand-navy sm:text-base"
                >
                  {kw}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Search Results in Unified List Container */}
        {query && (
          <div className="space-y-3">
            <div className="flex items-center justify-between px-1">
              <h2 className="font-extrabold text-sm sm:text-base text-surface-900">
                نتائج البحث عن "{query}" في {selectedCity}
              </h2>
              <span className="text-xs font-semibold text-surface-500">
                {results.length} نتيجة مطابقة
              </span>
            </div>

            {results.length === 0 ? (
              <SearchEmptyState query={query} onClear={() => setQuery('')} />
            ) : (
              <ProgressiveProductRows
                products={results}
                ariaLabel={`نتائج البحث عن ${query}`}
                showCategory
                resetKey={`${selectedCity}-${query}`}
              />
            )}
          </div>
        )}
      </main>
    </div>
  );
};
