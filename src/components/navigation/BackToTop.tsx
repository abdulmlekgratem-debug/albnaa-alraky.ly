import React, { useEffect, useState } from 'react';
import { ArrowUp } from 'lucide-react';

export const BackToTop: React.FC = () => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const updateVisibility = () => setVisible(window.scrollY > 400);
    updateVisibility();
    window.addEventListener('scroll', updateVisibility, { passive: true });
    return () => window.removeEventListener('scroll', updateVisibility);
  }, []);

  if (!visible) return null;

  const scrollToTop = () => {
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    window.scrollTo({ top: 0, behavior: reduceMotion ? 'auto' : 'smooth' });
  };

  return (
    <button
      type="button"
      onClick={scrollToTop}
      aria-label="العودة إلى أعلى الصفحة"
      className="fixed bottom-4 right-4 z-30 inline-flex min-h-[46px] items-center justify-center gap-1.5 rounded-full bg-brand-navy px-3.5 text-xs font-black text-white shadow-xl shadow-brand-950/30 transition-all hover:bg-brand-900 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-navy focus-visible:ring-offset-2 sm:bottom-6 sm:right-6 sm:min-h-[50px] sm:px-4 sm:text-sm"
    >
      <ArrowUp className="h-4 w-4 sm:h-5 sm:w-5" strokeWidth={2.5} aria-hidden="true" />
      <span>إلى الأعلى</span>
    </button>
  );
};
