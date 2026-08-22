import React from 'react';
import { Clock3, MapPin, PhoneCall } from 'lucide-react';
import { BRAND, CONTACT } from '../../lib/constants';
import { BrandLogo } from '../ui/BrandLogo';
import { SocialBrandIcon } from '../ui/SocialBrandIcon';
import { BranchContacts } from '../ui/BranchContacts';

interface FooterProps {
  id?: string;
}

export const Footer: React.FC<FooterProps> = ({ id }) => (
  <footer id={id} className="relative block overflow-hidden border-t-4 border-sand-400 bg-brand-950 text-white">
    <div className="pointer-events-none absolute inset-0" aria-hidden="true">
      <div className="absolute inset-x-0 top-0 h-64 bg-gradient-to-b from-brand-800/35 to-transparent" />
      <div className="absolute -right-36 top-16 h-80 w-80 rounded-full bg-sand-300/[0.055] blur-3xl" />
      <div className="absolute -left-36 bottom-0 h-72 w-72 rounded-full bg-blue-400/[0.045] blur-3xl" />
    </div>

    <div className="relative mx-auto max-w-[1240px] px-4 py-8 sm:px-6 sm:py-10 lg:px-8 lg:py-12">
      <div className="grid gap-4 lg:grid-cols-[1.35fr_0.65fr]">
        <section
          aria-label="معلومات الشركة"
          className="rounded-3xl border border-white/10 bg-white/[0.045] p-5 shadow-[0_24px_70px_rgba(0,0,0,0.16)] backdrop-blur-sm sm:p-6"
        >
          <BrandLogo compact={false} showTagline theme="dark" prominent />
          <p className="mt-4 max-w-2xl text-sm font-semibold leading-7 text-white/75 sm:text-base">
            أسعار مواد البناء المتاحة حسب المدينة، مع وصول مباشر إلى الصنف والسعر وأرقام الفروع.
          </p>
          <div className="mt-5 grid gap-2.5 text-sm font-bold text-white/80 sm:grid-cols-2">
            <span className="flex min-h-[48px] items-center gap-2.5 rounded-xl bg-black/10 px-3.5 ring-1 ring-inset ring-white/[0.06]">
              <MapPin className="h-[18px] w-[18px] flex-none text-sand-300" aria-hidden="true" />
              {BRAND.fullLocation}
            </span>
            <span className="flex min-h-[48px] items-center gap-2.5 rounded-xl bg-black/10 px-3.5 ring-1 ring-inset ring-white/[0.06]">
              <Clock3 className="h-[18px] w-[18px] flex-none text-sand-300" aria-hidden="true" />
              {BRAND.hours}
            </span>
          </div>
        </section>

        <section
          aria-labelledby="footer-social-title"
          className="flex flex-col justify-between rounded-3xl border border-sand-300/20 bg-gradient-to-br from-white/[0.08] to-white/[0.025] p-5 shadow-[0_24px_70px_rgba(0,0,0,0.14)] backdrop-blur-sm sm:p-6"
        >
          <div>
            <span className="text-xs font-black text-sand-300">ابقَ قريبًا</span>
            <h2 id="footer-social-title" className="mt-1 text-xl font-black sm:text-2xl">تابع صفحاتنا</h2>
            <p className="mt-2 text-sm font-semibold leading-6 text-white/65">
              تابع آخر الأسعار والتحديثات عبر منصات التواصل.
            </p>
          </div>

          <div className="mt-5 grid grid-cols-3 gap-2" aria-label="صفحات التواصل الاجتماعي">
            {CONTACT.socialLinks.map((social) => (
              <a
                key={social.label}
                href={social.url}
                target="_blank"
                rel="noreferrer"
                aria-label={social.label}
                title={social.label}
                className="flex min-h-[76px] flex-col items-center justify-center gap-1.5 rounded-2xl bg-black/10 px-2 text-xs font-black text-white/80 ring-1 ring-inset ring-white/[0.07] transition-colors hover:bg-white/10 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sand-300"
              >
                <SocialBrandIcon label={social.label} className="h-10 w-10" />
                <span>{social.label}</span>
              </a>
            ))}
          </div>
        </section>
      </div>

      <section aria-labelledby="footer-contact-title" className="mt-8">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <span className="flex items-center gap-2 text-xs font-black text-sand-300">
              <PhoneCall className="h-4 w-4" aria-hidden="true" />
              خدمة العملاء
            </span>
            <h2 id="footer-contact-title" className="mt-1.5 text-2xl font-black sm:text-3xl">اتصل بالفرع الأقرب</h2>
          </div>
          <p className="max-w-sm text-sm font-semibold leading-6 text-white/60">
            اختر الفرع واضغط على الرقم للاتصال مباشرة.
          </p>
        </div>
        <BranchContacts className="mt-5" />
      </section>

      <div className="mt-8 flex flex-col gap-2 border-t border-white/10 pt-5 text-center text-xs font-semibold leading-6 text-white/60 sm:flex-row sm:items-center sm:justify-between sm:text-right">
        <span>© {new Date().getFullYear()} {BRAND.name}. جميع الحقوق محفوظة.</span>
        <span>جميع الأسعار المعروضة هي آخر الأسعار المعتمدة والمحدثة في المنصة.</span>
      </div>
    </div>
  </footer>
);
