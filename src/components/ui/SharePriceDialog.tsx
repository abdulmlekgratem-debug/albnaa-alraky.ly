import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Check, Copy, MessageCircle, Share2, X } from 'lucide-react';
import { ProductDTO } from '../../types/product';
import { BRAND } from '../../lib/constants';
import { formatPrice } from '../../lib/formatters';

interface SharePriceDialogProps {
  open: boolean;
  product: ProductDTO;
  city: string;
  onClose: () => void;
}

async function copyTextWithFallback(text: string): Promise<boolean> {
  if (navigator.clipboard?.writeText) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch {
      // Continue to the compatibility fallback below.
    }
  }

  const textarea = document.createElement('textarea');
  textarea.value = text;
  textarea.setAttribute('readonly', '');
  textarea.style.position = 'fixed';
  textarea.style.opacity = '0';
  document.body.appendChild(textarea);
  textarea.select();

  try {
    return typeof document.execCommand === 'function' && document.execCommand('copy');
  } catch {
    return false;
  } finally {
    document.body.removeChild(textarea);
  }
}

export const SharePriceDialog: React.FC<SharePriceDialogProps> = ({
  open,
  product,
  city,
  onClose,
}) => {
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const [feedback, setFeedback] = useState<string>('');

  const pageUrl = typeof window === 'undefined' ? '' : `${window.location.origin}/prices`;
  const priceText = `${formatPrice(product.price)}${product.unit ? ` / ${product.unit}` : ''}`;
  const shareText = useMemo(() => {
    const specification = [product.size, product.manufacturer || product.origin]
      .filter(Boolean)
      .join(' — ');
    return [
      product.name,
      specification || null,
      `السعر في ${city}: ${priceText}`,
      BRAND.name,
      pageUrl || null,
    ].filter(Boolean).join('\n');
  }, [city, pageUrl, priceText, product]);

  useEffect(() => {
    if (!open) return;
    setFeedback('');
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    closeButtonRef.current?.focus();

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [onClose, open]);

  if (!open) return null;

  const handleCopy = async () => {
    const copied = await copyTextWithFallback(shareText);
    setFeedback(copied ? 'تم نسخ السعر والرابط.' : 'تعذر النسخ. استخدم واتساب أو مشاركة الهاتف.');
  };

  const handleSystemShare = async () => {
    if (!navigator.share) {
      setFeedback('المشاركة المباشرة غير مدعومة هنا. استخدم واتساب أو نسخ الرابط.');
      return;
    }

    try {
      await navigator.share({
        title: product.name,
        text: shareText,
        url: pageUrl,
      });
      setFeedback('تم فتح خيارات المشاركة.');
    } catch (error) {
      if (error instanceof DOMException && error.name === 'AbortError') return;
      setFeedback('تعذر فتح مشاركة الهاتف. استخدم واتساب أو نسخ الرابط.');
    }
  };

  return (
    <div
      className="fixed inset-0 z-[100] flex items-end justify-center bg-brand-950/55 p-0 sm:items-center sm:p-4"
      onMouseDown={(event) => {
        if (event.currentTarget === event.target) onClose();
      }}
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="share-price-title"
        className="w-full max-w-lg rounded-t-2xl bg-white p-5 shadow-2xl sm:rounded-xl sm:p-6"
      >
        <div className="flex items-start justify-between gap-4 border-b border-surface-200 pb-4">
          <div>
            <h2 id="share-price-title" className="text-xl font-black text-brand-950">
              مشاركة السعر
            </h2>
            <p className="mt-1 text-sm font-medium text-surface-500">
              اختر الطريقة المناسبة لك.
            </p>
          </div>
          <button
            ref={closeButtonRef}
            type="button"
            onClick={onClose}
            aria-label="إغلاق نافذة المشاركة"
            className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-lg border border-surface-200 text-surface-600 transition-colors hover:bg-surface-100"
          >
            <X className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>

        <div className="my-4 rounded-lg border border-surface-200 bg-surface-50 p-4">
          <h3 className="font-extrabold leading-6 text-surface-900">{product.name}</h3>
          <p className="mt-1 text-sm font-bold text-brand-navy">
            {priceText} — {city}
          </p>
        </div>

        <div className="grid gap-2.5">
          <a
            href={`https://wa.me/?text=${encodeURIComponent(shareText)}`}
            target="_blank"
            rel="noreferrer"
            className="inline-flex min-h-[50px] items-center justify-center gap-2 rounded-lg bg-emerald-600 px-4 text-sm font-extrabold text-white transition-colors hover:bg-emerald-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600 focus-visible:ring-offset-2"
          >
            <MessageCircle className="h-5 w-5" aria-hidden="true" />
            مشاركة عبر واتساب
          </a>

          <button
            type="button"
            onClick={handleSystemShare}
            className="inline-flex min-h-[50px] items-center justify-center gap-2 rounded-lg bg-brand-navy px-4 text-sm font-extrabold text-white transition-colors hover:bg-brand-900"
          >
            <Share2 className="h-5 w-5" aria-hidden="true" />
            مشاركة عبر الهاتف
          </button>

          <button
            type="button"
            onClick={handleCopy}
            className="inline-flex min-h-[50px] items-center justify-center gap-2 rounded-lg border border-surface-300 bg-white px-4 text-sm font-extrabold text-surface-800 transition-colors hover:bg-surface-50"
          >
            {feedback.startsWith('تم نسخ') ? (
              <Check className="h-5 w-5 text-emerald-600" aria-hidden="true" />
            ) : (
              <Copy className="h-5 w-5" aria-hidden="true" />
            )}
            نسخ السعر والرابط
          </button>
        </div>

        <p role="status" aria-live="polite" className="mt-3 min-h-5 text-center text-xs font-bold text-surface-600">
          {feedback}
        </p>
      </section>
    </div>
  );
};
