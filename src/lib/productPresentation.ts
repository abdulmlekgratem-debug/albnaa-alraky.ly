import { ProductDTO } from '../types/product';
import { normalizeArabic } from './arabicSearch';

/**
 * Builds useful secondary metadata without repeating words already present
 * in the product name or the selected filter.
 */
export function getProductSubtitle(
  product: ProductDTO,
  showCategory: boolean,
  highlightSpec?: string
): string {
  const parts: string[] = [];
  const nameNorm = normalizeArabic(product.name);
  const highlightedNorm = normalizeArabic(highlightSpec);

  const addPart = (value: string | null | undefined) => {
    const cleanValue = value?.trim();
    if (!cleanValue) return;

    const normalizedValue = normalizeArabic(cleanValue);
    if (!normalizedValue || normalizedValue === highlightedNorm) return;
    if (nameNorm.includes(normalizedValue)) return;

    const duplicatesExistingPart = parts.some((part) => {
      const normalizedPart = normalizeArabic(part);
      return (
        normalizedPart === normalizedValue ||
        normalizedPart.includes(normalizedValue) ||
        normalizedValue.includes(normalizedPart)
      );
    });

    if (!duplicatesExistingPart) parts.push(cleanValue);
  };

  if (showCategory) addPart(product.category);

  if (product.subcategory && product.subcategory !== product.category) {
    addPart(product.subcategory);
  }

  addPart(product.type);
  addPart(product.size);

  if (product.manufacturer) {
    addPart(product.manufacturer);
  } else if (product.origin) {
    addPart(product.origin);
  }

  addPart(product.package);

  return parts.join(' • ');
}
