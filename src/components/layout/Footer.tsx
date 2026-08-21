import React from 'react';
import { Link } from 'react-router-dom';
import { Clock3, MapPin, Phone } from 'lucide-react';
import { BRAND, CONTACT } from '../../lib/constants';
import { BrandLogo } from '../ui/BrandLogo';
import { SocialBrandIcon } from '../ui/SocialBrandIcon';

export const Footer: React.FC = () => (
  <footer className="border-t-4 border-sand-400 bg-brand-950 text-white block">
    <div className="mx-auto max-w-[1240px] px-4 py-8 sm:px-6 sm:py-10 lg:px-8 lg:py-12">
      <div className="grid items-start gap-8 sm:gap-10 lg:grid-cols-[1.25fr_0.75fr]">
        <section aria-label="معلومات الشركة" className="max-w-2xl">
          <BrandLogo compact={false} showTagline theme="dark" />
          <p className="mt-4 text-sm font-medium leading-7 text-white/70">
            أسعار مواد البناء المتاحة حسب المدينة، مع بحث سريع ونسخ أو مشاركة السعر مباشرة.
          </p>
          <div className="mt-4 flex flex-wrap gap-x-6 gap-y-2 text-xs font-bold text-white/65">
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

        <section aria-label="التواصل المباشر" className="lg:text-left">
          <div className="flex flex-wrap gap-2 lg:justify-end">
            {CONTACT.phones.map((phone) => (
              <a
                key={phone}
                href={`tel:${phone.replace(/\s/g, '')}`}
                className="inline-flex min-h-[46px] items-center gap-2 rounded-xl border border-white/15 bg-white/[0.07] px-3.5 text-sm font-black text-white transition-colors hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sand-300"
              >
                <Phone className="h-4 w-4 text-emerald-400" aria-hidden="true" />
                <span dir="ltr">{phone}</span>
              </a>
            ))}
          </div>
          <div className="mt-3 flex gap-2 lg:justify-end" aria-label="صفحات التواصل الاجتماعي">
            {CONTACT.socialLinks.map((social) => (
              <a
                key={social.label}
                href={social.url}
                target="_blank"
                rel="noreferrer"
                aria-label={social.label}
                title={social.label}
                className="rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sand-300"
              >
                <SocialBrandIcon label={social.label} />
              </a>
            ))}
          </div>
        </section>
      </div>

      <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-t border-white/10 pt-5 text-xs font-semibold text-white/55">
        <span>© {new Date().getFullYear()} {BRAND.name}. جميع الحقوق محفوظة.</span>
        <nav aria-label="روابط الفوتر" className="flex flex-wrap gap-5 text-white/70">
          <Link to="/materials" className="hover:text-white transition-colors">المواد</Link>
          <Link to="/prices" className="hover:text-white transition-colors">الأسعار</Link>
          <Link to="/search" className="hover:text-white transition-colors">البحث</Link>
        </nav>
      </div>
    </div>
  </footer>
);
