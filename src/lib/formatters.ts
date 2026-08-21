/**
 * Formatting Utilities for Price, Currency, Units, and Arabic Timestamps
 */

import { BRAND } from './constants';

/**
 * Format numeric price into Libyan Dinar string, e.g. 3950 -> "3,950 د.ل"
 * Preserves decimal points if present (e.g. 28.5 -> "28.50 د.ل")
 */
export function formatPrice(price: number | null | undefined): string {
  if (price === null || price === undefined || price <= 0 || isNaN(price)) {
    return 'السعر غير متوفر حاليًا';
  }

  // Format with thousand separators and preserve decimal digits if not whole number
  const isInteger = Number.isInteger(price);
  const formattedNumber = new Intl.NumberFormat('en-US', {
    minimumFractionDigits: isInteger ? 0 : 2,
    maximumFractionDigits: 2,
  }).format(price);

  return `${formattedNumber} ${BRAND.currency}`;
}

/**
 * Format unit into display string with preposition, e.g. "طن" -> "للطن", "كيس" -> "للكيس"
 * If unit is empty or "غير محددة", returns empty string.
 */
export function formatUnit(unit: string | null | undefined): string {
  if (!unit || !unit.trim()) return '';

  const cleanUnit = unit.trim();
  if (cleanUnit === 'غير محددة') return '';
  
  if (cleanUnit.startsWith('لل')) {
    return cleanUnit;
  }
  
  if (cleanUnit.startsWith('ال')) {
    return 'ل' + cleanUnit;
  }

  return `لل${cleanUnit}`;
}

/**
 * Clean simple unit representation, e.g. "طن", "كيس", "قطعة"
 */
export function cleanUnitName(unit: string | null | undefined): string {
  if (!unit || unit.trim() === 'غير محددة') return '';
  return unit.trim();
}

/**
 * Format date/time into Arabic human readable string with Tripoli timezone handling
 * Example: "20/08/2026 08:30" -> "اليوم 08:30 صباحًا"
 */
export function formatArabicDate(dateStr: string | null | undefined): string {
  if (!dateStr || !dateStr.trim()) {
    return 'اليوم 08:30 صباحًا';
  }

  const str = dateStr.trim();

  // If already contains formatted Arabic text
  if (str.includes('اليوم') || str.includes('أمس') || str.includes('صباح') || str.includes('مساء')) {
    return str;
  }

  // Try parsing standard format or ISO date
  try {
    const d = new Date(str);
    if (!isNaN(d.getTime())) {
      const now = new Date();
      const isToday = d.toDateString() === now.toDateString();
      
      const timeStr = d.toLocaleTimeString('ar-LY', {
        timeZone: 'Africa/Tripoli',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
      });

      if (isToday) {
        return `اليوم ${timeStr}`;
      }

      const datePart = d.toLocaleDateString('ar-LY', {
        timeZone: 'Africa/Tripoli',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });

      return `${datePart} - ${timeStr}`;
    }
  } catch {
    // fallback to raw string
  }

  return str;
}
