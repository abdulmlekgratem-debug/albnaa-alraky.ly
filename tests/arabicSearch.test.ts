import { describe, it, expect } from 'vitest';
import { getSearchSuggestions, normalizeArabic, searchProducts } from '../src/lib/arabicSearch';
import { parseRawRowsToProducts } from '../src/lib/excelParser';
import { LOCAL_RAW_SNAPSHOT } from '../src/data/localSnapshot';

describe('Arabic Search Normalization & Real Query Matching', () => {
  const products = parseRawRowsToProducts(LOCAL_RAW_SNAPSHOT);

  it('normalizes Arabic characters including Taa Marbuta and Alef variants', () => {
    expect(normalizeArabic('مصراتة')).toBe('مصراته');
    expect(normalizeArabic('مصراته')).toBe('مصراته');
    expect(normalizeArabic('أسمنت')).toBe('اسمنت');
    expect(normalizeArabic('اسمنت')).toBe('اسمنت');
    expect(normalizeArabic('إسمنت')).toBe('اسمنت');
    expect(normalizeArabic('آجر')).toBe('اجر');
    expect(normalizeArabic('حــديــد')).toBe('حديد');
    expect(normalizeArabic('12 ملي')).toBe('12 مم');
  });

  it('finds Misurata iron using "مصراته" with Ha or "مصراتة" with Taa Marbuta', () => {
    const withTaa = searchProducts(products, '12 مصراتة');
    const withHa = searchProducts(products, '12 مصراته');

    expect(withTaa.length).toBeGreaterThan(0);
    expect(withHa.length).toBeGreaterThan(0);
    expect(withTaa[0].id).toBe(withHa[0].id);
    expect(withTaa[0].name).toContain('12');
    expect(withTaa[0].name).toContain('مصراتة');
  });

  it('finds cement with "اسمنت اتحاد" and "أسمنت اتحاد"', () => {
    const res1 = searchProducts(products, 'اسمنت اتحاد');
    const res2 = searchProducts(products, 'أسمنت اتحاد');

    expect(res1.length).toBeGreaterThan(0);
    expect(res2.length).toBeGreaterThan(0);
    expect(res1[0].id).toBe(res2[0].id);
    expect(res1[0].name).toContain('اتحاد');
  });

  it('tolerates simple spelling mistakes while keeping relevant results first', () => {
    const cementWithTypo = searchProducts(products, 'اسمينت اتحاد');
    const cementWithPartialName = searchProducts(products, 'اسمينت اتح');
    const ironWithTypo = searchProducts(products, 'حدبد 12');

    expect(cementWithTypo.length).toBeGreaterThan(0);
    expect(cementWithTypo[0].name).toContain('اتحاد');
    expect(cementWithPartialName.length).toBeGreaterThan(0);
    expect(cementWithPartialName[0].name).toContain('اتحاد');
    expect(ironWithTypo.length).toBeGreaterThan(0);
    expect(ironWithTypo[0].category).toBe('الحديد');
  });

  it('finds iron products with "حديد 12"', () => {
    const results = searchProducts(products, 'حديد 12');
    expect(results.length).toBeGreaterThan(0);
    expect(results.every((p) => p.category === 'الحديد')).toBe(true);
  });

  it('finds Knauf gypsum with "كناوف"', () => {
    const results = searchProducts(products, 'كناوف');
    expect(results.length).toBeGreaterThan(0);
    expect(results[0].name).toContain('كناوف');
  });

  it('finds building brick 20 with "ياجور 20"', () => {
    const results = searchProducts(products, 'ياجور 20');
    expect(results.length).toBeGreaterThan(0);
    expect(results.some((p) => p.category === 'الياجور والبلوك')).toBe(true);
  });

  it('finds crushed stone 1 with "شرشور 1"', () => {
    const results = searchProducts(products, 'شرشور 1');
    expect(results.length).toBeGreaterThan(0);
    expect(results.some((p) => p.name.includes('شرشور 1'))).toBe(true);
  });

  it('suggests nearby available products when the requested specification has no exact result', () => {
    const ironWithoutSize12 = products.filter(
      (product) => product.category === 'الحديد' && !product.name.includes('12'),
    );
    const suggestions = getSearchSuggestions(ironWithoutSize12, 'حدبد 12');

    expect(suggestions.length).toBeGreaterThan(0);
    expect(suggestions.every((product) => product.category === 'الحديد')).toBe(true);
  });
});
