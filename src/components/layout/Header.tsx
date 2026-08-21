import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowRight, CalendarDays, Clock3, Search } from 'lucide-react';
import { BrandLogo } from '../ui/BrandLogo';
import { BRAND } from '../../lib/constants';

interface HeaderProps {
  title?: string;
  showBack?: boolean;
  backTo?: string;
  backLabel?: string;
}

export const Header: React.FC<HeaderProps> = ({
  title,
  showBack = false,
  backTo,
  backLabel = 'الرجوع للخلف',
}) => {
  const navigate = useNavigate();
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const timer = window.setInterval(() => setNow(new Date()), 30_000);
    return () => window.clearInterval(timer);
  }, []);

  const dateLabel = useMemo(
    () => new Intl.DateTimeFormat('ar-LY', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    }).format(now),
    [now],
  );
  const timeLabel = useMemo(
    () => new Intl.DateTimeFormat('ar-LY', {
      hour: '2-digit',
      minute: '2-digit',
    }).format(now),
    [now],
  );
  const mobileDateLabel = useMemo(
    () => new Intl.DateTimeFormat('ar-LY', {
      day: 'numeric',
      month: 'short',
    }).format(now),
    [now],
  );

  return (
    <header className="sticky top-0 z-40 border-b border-surface-200/80 bg-white/90 shadow-header backdrop-blur-xl">
      <div className="mx-auto grid h-[76px] max-w-[1240px] grid-cols-[minmax(0,1fr)_auto_auto] items-center gap-2.5 px-3 sm:h-24 sm:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] sm:gap-3 sm:px-6 lg:px-8">
        <div className="flex min-w-0 items-center gap-2.5 sm:gap-3">
          {showBack && (
            <button
              onClick={() => (backTo ? navigate(backTo) : navigate(-1))}
              aria-label={backLabel}
              className="flex h-11 w-11 min-w-[44px] items-center justify-center rounded-xl border border-surface-200 bg-surface-50 text-brand-navy transition-colors hover:border-brand-200 hover:bg-brand-50"
            >
              <ArrowRight className="h-5 w-5" aria-hidden="true" />
            </button>
          )}
          <Link
            to="/"
            aria-label="الصفحة الرئيسية - شركة البناء الراقي الجديد"
            className="flex min-w-0 items-center gap-1.5 sm:hidden"
          >
            <img
              src="/images/brand/al-binaa-al-raqi-mark.png"
              alt=""
              width="44"
              height="44"
              className="h-11 w-11 flex-shrink-0 object-contain"
            />
            <span className="max-w-[90px] truncate border-r border-surface-300 pr-1.5 text-[11px] font-black leading-4 text-brand-950 min-[390px]:max-w-[126px] min-[390px]:text-xs">
              {BRAND.shortName}
            </span>
          </Link>
          <div className="hidden sm:block">
            <BrandLogo compact={false} showTagline={!title} />
          </div>
          {title && (
            <h1 className="sr-only">
              {title}
            </h1>
          )}
        </div>

        <div
          className="flex min-w-[74px] flex-col items-center justify-center rounded-xl border border-surface-200 bg-surface-50 px-1.5 py-1.5 text-center max-[359px]:hidden sm:hidden"
          aria-label={`التاريخ والوقت: ${mobileDateLabel}، ${timeLabel}`}
        >
          <span className="whitespace-nowrap text-[11px] font-bold leading-4 text-surface-600">
            {mobileDateLabel}
          </span>
          <span dir="ltr" className="flex items-center gap-1 whitespace-nowrap text-xs font-black leading-4 text-brand-navy tabular-nums">
            <Clock3 className="h-3.5 w-3.5" aria-hidden="true" />
            {timeLabel}
          </span>
        </div>

        <div className="hidden items-center justify-center gap-4 rounded-2xl border border-surface-200 bg-surface-50 px-5 py-2.5 text-surface-700 sm:flex" aria-label={`التاريخ والوقت: ${dateLabel}، ${timeLabel}`}>
          <span className="flex items-center gap-2 whitespace-nowrap text-sm font-bold">
            <CalendarDays className="h-4.5 w-4.5 text-brand-navy" aria-hidden="true" />
            {dateLabel}
          </span>
          <span className="h-5 w-px bg-surface-300" aria-hidden="true" />
          <span dir="ltr" className="flex items-center gap-2 whitespace-nowrap text-sm font-black text-brand-navy">
            <Clock3 className="h-4.5 w-4.5" aria-hidden="true" />
            {timeLabel}
          </span>
        </div>

        <div className="flex items-center justify-end gap-2.5">
          <Link
            to="/search"
            aria-label="البحث عن الأسعار"
            className="flex h-12 w-12 items-center justify-center gap-2 rounded-xl bg-brand-navy text-sm font-extrabold text-white transition-colors hover:bg-brand-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-navy focus-visible:ring-offset-2 sm:h-auto sm:min-h-11 sm:w-auto sm:px-4"
          >
            <Search className="h-5 w-5" aria-hidden="true" />
            <span className="hidden sm:inline">بحث الأسعار</span>
          </Link>
        </div>
      </div>
    </header>
  );
};
