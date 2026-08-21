import React from 'react';
import { Link } from 'react-router-dom';
import { Clock3, MapPin, Phone } from 'lucide-react';
import { Header } from '../components/layout/Header';
import { BrandLogo } from '../components/ui/BrandLogo';
import { LoadingSkeleton } from '../components/states/LoadingSkeleton';
import { ErrorState } from '../components/states/ErrorState';
import { useProducts } from '../context/ProductContext';
import { BRAND, CONTACT } from '../lib/constants';
import { formatArabicDate } from '../lib/formatters';
import { HERO_IMAGE } from '../lib/categoryAssets';
import { SocialBrandIcon } from '../components/ui/SocialBrandIcon';
import { HomePriceBrowser } from '../components/home/HomePriceBrowser';

export const HomePage: React.FC = () => {
  const {
    products,
    categories,
    cities,
    selectedCity,
    setSelectedCity,
    lastUpdated,
    isLoading,
    error,
    refreshPrices,
  } = useProducts();

  if (isLoading && products.length === 0) {
    return (
      <div className="min-h-screen bg-sand-50">
        <Header />
        <div className="mx-auto max-w-[1240px] px-4 py-8 sm:px-6 lg:px-8">
          <LoadingSkeleton rows={6} />
        </div>
      </div>
    );
  }

  if (error && products.length === 0) {
    return (
      <div className="min-h-screen bg-sand-50">
        <Header />
        <div className="mx-auto max-w-[1240px] px-4 py-12 sm:px-6 lg:px-8">
          <ErrorState message={error} onRetry={refreshPrices} />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-sand-50 text-surface-900">
      <Header />

      <main>
        <section className="relative isolate overflow-hidden bg-brand-950 text-white">
          <img
            src={HERO_IMAGE}
            alt="ساحة ومخازن مواد البناء التابعة للشركة"
            className="absolute inset-0 -z-20 h-full w-full object-cover object-center"
            loading="eager"
          />
          <div className="absolute inset-0 -z-10 bg-gradient-to-l from-brand-950 via-brand-950/95 to-brand-950/45" aria-hidden="true" />
          <div className="absolute inset-0 -z-10 bg-gradient-to-t from-brand-950/80 via-transparent to-transparent" aria-hidden="true" />

          <div className="mx-auto max-w-[1240px] px-4 pt-8 pb-12 sm:px-6 sm:py-16 lg:px-8 lg:py-20">
            <div className="max-w-2xl">
              <div className="flex items-center gap-2 text-xs font-bold text-sand-200 sm:text-sm">
                <MapPin className="h-4 w-4" aria-hidden="true" />
                <span>{BRAND.name} — أسعار {selectedCity}</span>
              </div>

              <h1 className="mt-3 text-[28px] font-black leading-[1.18] tracking-tight sm:mt-5 sm:text-5xl lg:text-6xl">
                <span className="block">أسعار مواد البناء اليوم</span>
                <span className="mt-1 block text-sand-300">في {selectedCity}</span>
              </h1>
              <p className="mt-3 max-w-xl text-sm font-medium leading-7 text-white/85 sm:mt-4 sm:text-lg sm:leading-8">
                الأسعار الحالية لمختلف مواد البناء والإنشاء في مدينة <strong className="text-white">{selectedCity}</strong> وضواحيها.
              </p>

              <div className="mt-4 flex flex-wrap gap-x-5 gap-y-1.5 border-t border-white/20 pt-3 text-[11px] font-bold text-white/75 sm:mt-6 sm:gap-x-6 sm:gap-y-2 sm:pt-4 sm:text-xs">
                <span>{products.length} صنفًا متاحًا</span>
                <span>{categories.length} أقسام</span>
                <span className="flex items-center gap-1.5">
                  <Clock3 className="h-3.5 w-3.5" aria-hidden="true" />
                  آخر تحديث: {formatArabicDate(lastUpdated)}
                </span>
              </div>
            </div>
          </div>
        </section>

        <HomePriceBrowser
          products={products}
          categories={categories}
          cities={cities}
          selectedCity={selectedCity}
          onCitySelect={setSelectedCity}
        />

        <footer id="contact" className="relative overflow-hidden border-t-4 border-sand-400 bg-brand-950 text-white">
          <div className="pointer-events-none absolute inset-x-0 top-0 h-44 bg-gradient-to-b from-brand-900/45 to-transparent" aria-hidden="true" />

          <div className="relative mx-auto max-w-[1240px] px-4 py-8 sm:px-6 sm:py-11 lg:px-8 lg:py-12">
            <div className="grid gap-9 lg:grid-cols-[1.15fr_0.95fr_0.8fr] lg:gap-12">
              <section aria-label="معلومات الشركة">
                <BrandLogo theme="dark" showTagline className="w-fit" />
                <p className="mt-5 max-w-md text-base font-medium leading-7 text-white/75">
                  أسعار مواد البناء المتاحة حسب المدينة، مع وصول سريع إلى الصنف والسعر ووسائل التواصل.
                </p>
                <div className="mt-5 flex flex-wrap gap-x-5 gap-y-2 text-sm font-bold text-white/70">
                  <span className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-sand-300" aria-hidden="true" />
                    {BRAND.fullLocation}
                  </span>
                  <span className="flex items-center gap-2">
                    <Clock3 className="h-4 w-4 text-sand-300" aria-hidden="true" />
                    {BRAND.hours}
                  </span>
                </div>
              </section>

              <section aria-labelledby="footer-contact-title">
                <span className="text-sm font-extrabold text-sand-300">خدمة العملاء</span>
                <h2 id="footer-contact-title" className="mt-1.5 text-2xl font-black">اتصل بنا مباشرة</h2>
                <div className="mt-4 grid gap-2.5">
                  {CONTACT.phones.map((phone) => (
                    <a
                      key={phone}
                      href={`tel:${phone.replace(/\s/g, '')}`}
                      className="group flex min-h-[58px] items-center justify-between gap-3 rounded-xl border border-white/15 bg-white/[0.07] px-3.5 transition-colors hover:border-emerald-400/60 hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sand-300"
                    >
                      <span className="flex items-center gap-3">
                        <span className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-emerald-500 text-white">
                          <Phone className="h-5 w-5" aria-hidden="true" />
                        </span>
                        <span className="text-sm font-extrabold text-white/80">اتصال مباشر</span>
                      </span>
                      <span dir="ltr" className="text-base font-black tabular-nums text-white sm:text-lg">{phone}</span>
                    </a>
                  ))}
                </div>
              </section>

              <section aria-labelledby="footer-social-title">
                <span className="text-sm font-extrabold text-sand-300">نحن على التواصل</span>
                <h2 id="footer-social-title" className="mt-1.5 text-2xl font-black">تابع صفحاتنا</h2>
                <div className="mt-4 flex gap-3">
                  {CONTACT.socialLinks.map((social) => (
                    <a
                      key={social.label}
                      href={social.url}
                      target="_blank"
                      rel="noreferrer"
                      aria-label={social.label}
                      title={social.label}
                      className="rounded-xl transition-transform hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sand-300 focus-visible:ring-offset-2 focus-visible:ring-offset-brand-950"
                    >
                      <SocialBrandIcon label={social.label} className="h-12 w-12" />
                    </a>
                  ))}
                </div>

                <nav aria-label="روابط الفوتر" className="mt-6 flex flex-wrap gap-x-5 gap-y-3 text-sm font-bold text-white/75">
                  <Link to="/materials" className="inline-flex min-h-[44px] items-center transition-colors hover:text-white">المواد</Link>
                  <Link to="/prices" className="inline-flex min-h-[44px] items-center transition-colors hover:text-white">الأسعار</Link>
                  <Link to="/search" className="inline-flex min-h-[44px] items-center transition-colors hover:text-white">البحث</Link>
                </nav>
              </section>
            </div>

            <div className="mt-9 flex flex-col gap-2 border-t border-white/10 pt-5 text-center text-xs font-semibold leading-6 text-white/55 sm:flex-row sm:items-center sm:justify-between sm:text-right">
              <span>© {new Date().getFullYear()} {BRAND.name}. جميع الحقوق محفوظة.</span>
              <span>جميع الأسعار المعروضة هي آخر الأسعار المعتمدة والمحدثة في المنصة.</span>
            </div>
          </div>
        </footer>
      </main>
    </div>
  );
};
