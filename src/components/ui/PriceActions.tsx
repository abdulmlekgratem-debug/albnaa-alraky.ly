import React, { useEffect, useMemo, useState } from 'react';
import { Check, Copy, Share2 } from 'lucide-react';
import { ProductDTO } from '../../types/product';
import { BRAND } from '../../lib/constants';
import { cleanUnitName, formatPrice } from '../../lib/formatters';
import { useOptionalProducts } from '../../context/ProductContext';
import { SharePriceDialog } from './SharePriceDialog';

interface PriceActionsProps {
  product: ProductDTO;
  compact?: boolean;
  className?: string;
}

async function copyText(text: string): Promise<void> {
  if (navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(text);
    return;
  }

  const textarea = document.createElement('textarea');
  textarea.value = text;
  textarea.setAttribute('readonly', '');
  textarea.style.position = 'fixed';
  textarea.style.opacity = '0';
  document.body.appendChild(textarea);
  textarea.select();
  const copied = document.execCommand('copy');
  document.body.removeChild(textarea);
  if (!copied) throw new Error('تعذر النسخ');
}

export const PriceActions: React.FC<PriceActionsProps> = ({
  product,
  compact = false,
  className = '',
}) => {
  const selectedCity = useOptionalProducts()?.selectedCity || BRAND.city;
  const [copied, setCopied] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);

  const shareText = useMemo(() => {
    const unit = cleanUnitName(product.unit);
    return [
      product.name,
      formatPrice(product.price),
      unit ? `الوحدة: ${unit}` : '',
      `مدينة السعر: ${selectedCity}`,
      BRAND.name,
    ].filter(Boolean).join(' — ');
  }, [product, selectedCity]);

  useEffect(() => {
    if (!copied) return;
    const timeout = window.setTimeout(() => setCopied(false), 2200);
    return () => window.clearTimeout(timeout);
  }, [copied]);

  const handleCopy = async () => {
    try {
      await copyText(shareText);
      setCopied(true);
    } catch {
      setCopied(false);
    }
  };

  const handleShare = () => {
    // Always open the reliable in-app sheet first. Native sharing remains
    // available inside it, alongside WhatsApp and copy fallbacks.
    setShareOpen(true);
  };

  return (
    <>
      <div className={`flex items-center gap-2 ${className}`} aria-label={`إجراءات سعر ${product.name}`}>
        <button
          type="button"
          onClick={handleCopy}
          className={`inline-flex min-h-[46px] items-center justify-center gap-2 rounded-lg border border-surface-300 bg-white px-3 text-sm font-extrabold text-brand-navy transition-colors hover:bg-brand-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-navy ${compact ? 'min-w-[66px]' : 'min-w-[78px]'}`}
          aria-label={`نسخ سعر ${product.name}`}
        >
          {copied ? <Check className="h-4 w-4" aria-hidden="true" /> : <Copy className="h-4 w-4" aria-hidden="true" />}
          <span>{copied ? 'تم' : 'نسخ'}</span>
        </button>
        <button
          type="button"
          onClick={handleShare}
          className={`inline-flex min-h-[46px] items-center justify-center gap-2 rounded-lg bg-brand-navy px-3 text-sm font-extrabold text-white transition-colors hover:bg-brand-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-navy focus-visible:ring-offset-2 ${compact ? 'min-w-[78px]' : 'min-w-[88px]'}`}
          aria-label={`مشاركة سعر ${product.name}`}
        >
          <Share2 className="h-4 w-4" aria-hidden="true" />
          <span>مشاركة</span>
        </button>
      </div>

      {shareOpen && (
        <SharePriceDialog
          open={shareOpen}
          product={product}
          city={selectedCity}
          onClose={() => setShareOpen(false)}
        />
      )}
    </>
  );
};
