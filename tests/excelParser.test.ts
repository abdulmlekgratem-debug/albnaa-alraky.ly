import { describe, it, expect, vi } from 'vitest';
import * as XLSX from 'xlsx';
import {
  parsePrice,
  parseExcelBool,
  parseRawRowToProduct,
  parseRawRowsToProducts,
  extractCategories,
  extractCities,
  applyCityPriceToProduct,
  parseExcelWorkbook,
} from '../src/lib/excelParser';
import { RawExcelRow } from '../src/types/product';
import { LOCAL_RAW_SNAPSHOT } from '../src/data/localSnapshot';

describe('Excel Parser & Normalizer', () => {
  it('correctly parses prices and prevents 0 or negative values', () => {
    expect(parsePrice(3950)).toBe(3950);
    expect(parsePrice('3950')).toBe(3950);
    expect(parsePrice('28.50')).toBe(28.5);
    expect(parsePrice(28.5)).toBe(28.5);
    expect(parsePrice(0)).toBeNull();
    expect(parsePrice('0')).toBeNull();
    expect(parsePrice('0.000')).toBeNull();
    expect(parsePrice('-')).toBeNull();
    expect(parsePrice('')).toBeNull();
    expect(parsePrice(null)).toBeNull();
    expect(parsePrice(undefined)).toBeNull();
    expect(parsePrice('3٬950٫00')).toBe(3950);
    expect(parsePrice('٢٨٫٥٠')).toBe(28.5);
  });

  it('correctly normalizes Arabic boolean strings', () => {
    expect(parseExcelBool('نعم')).toBe(true);
    expect(parseExcelBool(' نعم ')).toBe(true);
    expect(parseExcelBool('لا')).toBe(false);
    expect(parseExcelBool('')).toBe(false);
    expect(parseExcelBool(null)).toBe(false);
  });

  it('silently skips blank spreadsheet rows that only contain an image-preview formula', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    const products = parseRawRowsToProducts([
      { id: '', التصنيف: '', المادة: '', الوحدة: '', متوفر: '', 'معاينة الصورة': '#N/A' },
    ]);

    expect(products).toEqual([]);
    expect(warn).not.toHaveBeenCalled();
    warn.mockRestore();
  });

  it('excludes inactive products when فعال = "لا"', () => {
    const inactiveRow: RawExcelRow = {
      id: 'P999',
      التصنيف: 'الحديد',
      اسم_العرض: 'منتج غير فعال',
      الوحدة: 'طن',
      متوفر: 'نعم',
      فعال: 'لا',
      سعر_اليوم: '3900',
    };

    const parsed = parseRawRowToProduct(inactiveRow);
    expect(parsed).toBeNull();
  });

  it('handles unavailable products with price null when متوفر = "لا"', () => {
    const unavailableRow: RawExcelRow = {
      id: 'P998',
      التصنيف: 'الحديد',
      اسم_العرض: 'حديد 12 مم',
      الوحدة: 'طن',
      متوفر: 'لا',
      فعال: 'نعم',
      سعر_اليوم: '3900',
    };

    const parsed = parseRawRowToProduct(unavailableRow);
    expect(parsed).not.toBeNull();
    expect(parsed?.available).toBe(false);
    expect(parsed?.price).toBeNull();
  });

  it('supports the legacy public Google Sheet column names', () => {
    const legacyRow: RawExcelRow = {
      id: 'P003',
      التصنيف: 'الأسمنت',
      المادة: 'اسمنت مكيس مصنع العربية',
      النوع: 'عادي',
      المصنع: 'العربية',
      الوحدة: 'كيس',
      طرابلس: '28٫00',
      متوفر: 'نعم',
      فعال: 'نعم',
      'آخر تحديث': '20/08/2026 13:37',
      اسم_العرض: '',
    };

    const parsed = parseRawRowToProduct(legacyRow);
    expect(parsed?.name).toBe('اسمنت مكيس مصنع العربية');
    expect(parsed?.manufacturer).toBe('العربية');
    expect(parsed?.price).toBe(28);
    expect(parsed?.available).toBe(true);
    expect(parsed?.updatedAt).toBe('20/08/2026 13:37');
  });

  it('reads city columns dynamically and treats a zero price as unavailable', () => {
    const multiCityRow: RawExcelRow = {
      id: 'CITY_01',
      التصنيف: 'الحديد',
      المادة: 'حديد تسليح 12 مم',
      اسم_العرض: '',
      الوحدة: 'طن',
      طرابلس: '0',
      مصراتة: '3٬950٫00',
      زليتن: '',
      صرمان: '3900',
      متوفر: 'نعم',
      فعال: 'نعم',
    };

    const parsed = parseRawRowToProduct(multiCityRow);
    expect(parsed).not.toBeNull();
    expect(parsed?.cityPrices).toEqual({
      طرابلس: null,
      مصراتة: 3950,
      زليتن: null,
      صرمان: 3900,
    });

    const tripoliProduct = applyCityPriceToProduct(parsed!, 'طرابلس');
    expect(tripoliProduct.price).toBeNull();
    expect(tripoliProduct.available).toBe(false);

    const misrataProduct = applyCityPriceToProduct(parsed!, 'مصراتة');
    expect(misrataProduct.price).toBe(3950);
    expect(misrataProduct.available).toBe(true);

    expect(extractCities([parsed!])).toEqual([
      { name: 'طرابلس', productCount: 1, availableCount: 0 },
      { name: 'مصراتة', productCount: 1, availableCount: 1 },
      { name: 'زليتن', productCount: 1, availableCount: 0 },
      { name: 'صرمان', productCount: 1, availableCount: 1 },
    ]);
  });

  it('makes every city unavailable when the availability column is no', () => {
    const unavailableEverywhere: RawExcelRow = {
      id: 'CITY_02',
      التصنيف: 'الأسمنت',
      المادة: 'أسمنت اختباري',
      اسم_العرض: '',
      الوحدة: 'كيس',
      طرابلس: '28.5',
      مصراتة: '29',
      متوفر: 'لا',
      فعال: 'نعم',
    };

    const parsed = parseRawRowToProduct(unavailableEverywhere);
    expect(parsed?.cityPrices).toEqual({ طرابلس: null, مصراتة: null });
    expect(applyCityPriceToProduct(parsed!, 'طرابلس').available).toBe(false);
    expect(applyCityPriceToProduct(parsed!, 'مصراتة').price).toBeNull();
  });

  it('parses the entire 134-item snapshot accurately', () => {
    const products = parseRawRowsToProducts(LOCAL_RAW_SNAPSHOT);
    expect(products.length).toBe(134);

    // Verify all IDs are unique
    const idSet = new Set(products.map((p) => p.id));
    expect(idSet.size).toBe(134);

    // Check sample iron item (P020: حديد 12 مم مصراتة)
    const iron12 = products.find((p) => p.id === 'P020');
    expect(iron12).toBeDefined();
    expect(iron12?.name).toContain('12');
    expect(iron12?.category).toBe('الحديد');
    expect(iron12?.unit).toBe('طن');

    // Check sample cement item (P001: أسمنت اتحاد)
    const unionCement = products.find((p) => p.id === 'P001');
    expect(unionCement).toBeDefined();
    expect(unionCement?.name).toContain('اتحاد');
    expect(unionCement?.category).toBe('الأسمنت');
    expect(unionCement?.unit).toBe('كيس');
  });

  it('extracts unique categories dynamically with product counts', () => {
    const products = parseRawRowsToProducts(LOCAL_RAW_SNAPSHOT);
    const categories = extractCategories(products);

    expect(categories.length).toBe(9);
    const ironCat = categories.find((c) => c.name === 'الحديد');
    expect(ironCat?.count).toBe(35);

    const cementCat = categories.find((c) => c.name === 'الأسمنت');
    expect(cementCat?.count).toBe(25);

    const brickCat = categories.find((c) => c.name === 'الياجور والبلوك');
    expect(brickCat?.count).toBe(29);
  });

  it('merges direct image links from the صور الأصناف sheet by product id', () => {
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(
      workbook,
      XLSX.utils.json_to_sheet([{
        id: 'P001',
        التصنيف: 'الأسمنت',
        اسم_العرض: 'اسمنت اتحاد',
        الوحدة: 'كيس',
        سعر_اليوم: 28.5,
        متوفر: 'نعم',
        فعال: 'نعم',
      }]),
      'Products',
    );
    XLSX.utils.book_append_sheet(
      workbook,
      XLSX.utils.json_to_sheet([{ id: 'P001', رابط_الصورة: 'https://example.com/union-cement.jpg' }]),
      'صور الأصناف',
    );

    const [product] = parseExcelWorkbook(workbook);
    expect(product.imageUrl).toBe('https://example.com/union-cement.jpg');
  });

  it('reads رابط_الصورة from the public city-price table without treating معاينة الصورة as a city', () => {
    const row = {
      id: 'P-CITY-IMAGE',
      التصنيف: 'الحديد',
      المادة: 'حديد تسليح 12 مم',
      النوع: 'مشرشر',
      المقاس: '12 مم',
      المصنع: 'مصراتة',
      الوحدة: 'طن',
      طرابلس: 3950,
      مصراتة: 3900,
      زليتن: 3920,
      صرمان: 3940,
      متوفر: 'نعم',
      'آخر تحديث': '2026-08-21',
      'معاينة الصورة': '=IMAGE(P2)',
      رابط_الصورة: 'https://example.com/rebar.jpg',
    } as RawExcelRow;

    const product = parseRawRowToProduct(row);

    expect(product?.imageUrl).toBe('https://example.com/rebar.jpg');
    expect(product?.cityPrices).toEqual({
      طرابلس: 3950,
      مصراتة: 3900,
      زليتن: 3920,
      صرمان: 3940,
    });
    expect(product?.cityPrices).not.toHaveProperty('معاينة الصورة');
    expect(product?.available).toBe(true);
  });

  it('normalizes Google Drive image links and rejects non-image-link text', () => {
    const baseRow = {
      id: 'P-DRIVE',
      التصنيف: 'الأسمنت',
      المادة: 'اسمنت اختبار',
      الوحدة: 'كيس',
      طرابلس: 30,
      متوفر: 'نعم',
      فعال: 'نعم',
    } as RawExcelRow;

    expect(parseRawRowToProduct({
      ...baseRow,
      رابط_الصورة: 'https://drive.google.com/file/d/FILE_123/view?usp=sharing',
    })?.imageUrl).toBe('https://drive.google.com/uc?export=view&id=FILE_123');

    expect(parseRawRowToProduct({
      ...baseRow,
      id: 'P-BAD-IMAGE',
      رابط_الصورة: 'لا يوجد رابط',
    })?.imageUrl).toBeNull();
  });
});
