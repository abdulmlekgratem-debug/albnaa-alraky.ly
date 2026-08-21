import { describe, it, expect } from 'vitest';
import {
  parseRawRowsToProducts,
  auditRawDataset,
} from '../src/lib/excelParser';
import {
  extractIronSizes,
  extractBrickTypes,
  extractSandSubcategories,
  getQuickFeaturedPrices,
} from '../src/services/productService';
import { normalizeExcelUrl } from '../src/config/dataSource';
import { isZipXlsxBuffer } from '../src/lib/excelLoader';
import { RawExcelRow } from '../src/types/product';
import { LOCAL_RAW_SNAPSHOT } from '../src/data/localSnapshot';

describe('Data Pipeline & Multi-Cloud Link Normalization Audit', () => {
  it('correctly normalizes Google Sheets, Google Drive, OneDrive, and Dropbox links', () => {
    // 1. Plain Google Sheet ID
    expect(normalizeExcelUrl('1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms')).toBe(
      'https://docs.google.com/spreadsheets/d/1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms/export?format=xlsx'
    );

    // 2. Google Sheet with GID parameter
    expect(
      normalizeExcelUrl(
        'https://docs.google.com/spreadsheets/d/1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms/edit#gid=123456'
      )
    ).toBe(
      'https://docs.google.com/spreadsheets/d/1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms/export?format=xlsx&gid=123456'
    );

    // 3. Google Drive file link
    expect(
      normalizeExcelUrl('https://drive.google.com/file/d/1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms/view')
    ).toBe(
      'https://drive.google.com/uc?export=download&id=1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms'
    );

    // 4. Microsoft OneDrive link
    expect(normalizeExcelUrl('https://1drv.ms/x/s!Ak789123xyz')).toBe(
      'https://1drv.ms/x/s!Ak789123xyz?download=1'
    );

    // 5. Dropbox link
    expect(normalizeExcelUrl('https://www.dropbox.com/s/abcd1234/prices.xlsx?dl=0')).toBe(
      'https://www.dropbox.com/s/abcd1234/prices.xlsx?dl=1'
    );

    // 6. Direct link
    expect(normalizeExcelUrl('https://company.ly/prices.xlsx')).toBe('https://company.ly/prices.xlsx');
  });

  it('validates binary magic header of XLSX and rejects HTML buffers', () => {
    const validZipHeader = new Uint8Array([0x50, 0x4b, 0x03, 0x04, 0x14, 0x00]);
    expect(isZipXlsxBuffer(validZipHeader.buffer)).toBe(true);

    const htmlHeader = new Uint8Array([0x3c, 0x21, 0x44, 0x4f]);
    expect(isZipXlsxBuffer(htmlHeader.buffer)).toBe(false);

    expect(isZipXlsxBuffer(new ArrayBuffer(0))).toBe(false);
  });

  it('audits the complete 134-item dataset without duplicate IDs or unhandled rows', () => {
    const audit = auditRawDataset(LOCAL_RAW_SNAPSHOT);

    expect(audit.totalRows).toBe(134);
    expect(audit.activeCount).toBe(134);
    expect(audit.inactiveCount).toBe(0);
    expect(audit.duplicateIds.length).toBe(0);
    expect(audit.invalidCount).toBe(0);

    // Verify all 9 standard categories exist with exact item counts
    expect(audit.categories['الحديد']).toBe(35);
    expect(audit.categories['الأسمنت']).toBe(25);
    expect(audit.categories['الياجور والبلوك']).toBe(29);
    expect(audit.categories['الرمل والركام']).toBe(19);
    expect(audit.categories['الجبس والمواد اللاصقة']).toBe(5);
    expect(audit.categories['المسامير والتربيط']).toBe(8);
    expect(audit.categories['العتبات']).toBe(8);
    expect(audit.categories['البومشي']).toBe(4);
    expect(audit.categories['مواد أخرى']).toBe(1);
  });

  it('safely normalizes contradictory availability states', () => {
    // Case A: متوفر = نعم but price is 0
    const rowZero: RawExcelRow = {
      id: 'TEST_01',
      التصنيف: 'الحديد',
      اسم_العرض: 'حديد تجريبي',
      الوحدة: 'طن',
      متوفر: 'نعم',
      فعال: 'نعم',
      سعر_اليوم: '0',
    };

    // Case B: متوفر = لا but price is 3950
    const rowUnavailWithPrice: RawExcelRow = {
      id: 'TEST_02',
      التصنيف: 'الحديد',
      اسم_العرض: 'حديد غير متوفر',
      الوحدة: 'طن',
      متوفر: 'لا',
      فعال: 'نعم',
      سعر_اليوم: '3950',
    };

    const parsed = parseRawRowsToProducts([rowZero, rowUnavailWithPrice]);

    expect(parsed[0].available).toBe(false);
    expect(parsed[0].price).toBeNull();

    expect(parsed[1].available).toBe(false);
    expect(parsed[1].price).toBeNull();
  });

  it('dynamically extracts distinct iron sizes without hardcoding', () => {
    const products = parseRawRowsToProducts(LOCAL_RAW_SNAPSHOT);
    const ironProducts = products.filter((p) => p.category === 'الحديد');
    const sizes = extractIronSizes(ironProducts);

    expect(sizes.length).toBeGreaterThan(5);
    expect(sizes).toContain('12 مم');
    expect(sizes).toContain('8 مم');
    expect(sizes).toContain('10 مم');
    expect(sizes).toContain('14 مم');
    expect(sizes).toContain('16 مم');
    expect(sizes).toContain('20 مم');

    const firstNum = parseFloat(sizes[0].replace(/[^\d.]/g, ''));
    const lastNum = parseFloat(sizes[sizes.length - 1].replace(/[^\d.]/g, ''));
    expect(firstNum).toBeLessThan(lastNum);
  });

  it('dynamically extracts brick types and sand subcategories from data', () => {
    const products = parseRawRowsToProducts(LOCAL_RAW_SNAPSHOT);

    const brickProducts = products.filter((p) => p.category === 'الياجور والبلوك');
    const brickTypes = extractBrickTypes(brickProducts);
    expect(brickTypes.length).toBeGreaterThan(1);
    expect(brickTypes.some((t) => t.includes('ياجور') || t.includes('بلوك'))).toBe(true);

    const sandProducts = products.filter((p) => p.category === 'الرمل والركام');
    const sandSubs = extractSandSubcategories(sandProducts);
    expect(sandSubs.length).toBeGreaterThan(1);
  });

  it('selects 3 distinct benchmark quick prices for the home page', () => {
    const products = parseRawRowsToProducts(LOCAL_RAW_SNAPSHOT);
    const quickPrices = getQuickFeaturedPrices(products);

    expect(quickPrices.length).toBe(3);
    expect(quickPrices.every((p) => p.available)).toBe(true);
  });
});
