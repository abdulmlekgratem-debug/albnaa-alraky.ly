/**
 * Robust Excel / Google Sheets Parser and Normalizer
 * Converts Raw SheetJS Workbook or JSON rows into Clean Public ProductDTOs
 */

import * as XLSX from 'xlsx';
import { RawExcelRow, ProductDTO, CategorySummary, CitySummary } from '../types/product';
import { CATEGORY_METADATA } from './constants';

export interface ParseAuditReport {
  totalRows: number;
  activeCount: number;
  inactiveCount: number;
  availableCount: number;
  unavailableCount: number;
  invalidCount: number;
  duplicateIds: string[];
  categories: Record<string, number>;
  warnings: string[];
}

const DEFAULT_CITY = 'طرابلس';

const NON_CITY_COLUMNS = new Set([
  'id',
  'source_code',
  'الترتيب',
  'التصنيف',
  'التصنيف_الفرعي',
  'اسم_العرض',
  'الاسم_الأصلي',
  'المادة',
  'النوع',
  'المقاس',
  'الطول',
  'المصنع_او_المصدر',
  'المصنع',
  'المنشأ',
  'العبوة',
  'الوحدة',
  'سعر_اليوم',
  'متوفر',
  'فعال',
  'آخر_تحديث',
  'آخر تحديث',
  'كلمات_البحث',
  'يحتاج_مراجعة',
  'ملاحظات',
  'رابط_الصورة',
  'رابط الصورة',
  'image_url',
  'imageUrl',
  'معاينة الصورة',
]);

function normalizeImageUrl(value: unknown): string | null {
  if (value === null || value === undefined) return null;
  const url = String(value).trim().replace(/^['"]|['"]$/g, '');
  if (!url) return null;

  // Turn common Google Drive share links into browser-displayable image URLs.
  const driveFileMatch = url.match(/drive\.google\.com\/file\/d\/([^/]+)/i);
  if (driveFileMatch?.[1]) {
    return `https://drive.google.com/uc?export=view&id=${driveFileMatch[1]}`;
  }

  const driveIdMatch = url.match(/[?&]id=([^&]+)/i);
  if (/drive\.google\.com/i.test(url) && driveIdMatch?.[1]) {
    return `https://drive.google.com/uc?export=view&id=${driveIdMatch[1]}`;
  }

  return /^(https?:\/\/|\/)/i.test(url) ? url : null;
}

/**
 * Parse a single numeric price value.
 * Handles strings, numbers, empty cells, decimals, and prevents 0 from being a valid price.
 */
export function parsePrice(val: unknown): number | null {
  if (val === null || val === undefined) return null;

  if (typeof val === 'number') {
    if (isNaN(val) || val <= 0) return null;
    return val;
  }

  if (typeof val === 'string') {
    const trimmed = val.trim();
    if (!trimmed || trimmed === '0' || trimmed === '0.00' || trimmed === '0.000' || trimmed === '-' || trimmed === '—') {
      return null;
    }
    // Normalize Arabic/Persian digits and Arabic decimal/thousands separators.
    const normalized = trimmed
      .replace(/[٠-٩]/g, (digit) => String('٠١٢٣٤٥٦٧٨٩'.indexOf(digit)))
      .replace(/[۰-۹]/g, (digit) => String('۰۱۲۳۴۵۶۷۸۹'.indexOf(digit)))
      .replace(/[٬,\s]/g, '')
      .replace(/٫/g, '.');
    const numericMatch = normalized.match(/\d+(?:\.\d+)?/);
    const num = numericMatch ? parseFloat(numericMatch[0]) : NaN;
    if (isNaN(num) || num <= 0) return null;
    return num;
  }

  return null;
}

/**
 * Detect city price columns dynamically. In the public sheet they are placed
 * between الوحدة and متوفر (for example طرابلس، مصراتة، زليتن، صرمان).
 */
export function extractCityPricesFromRow(row: RawExcelRow): Record<string, number | null> {
  const keys = Object.keys(row);
  const unitIndex = keys.indexOf('الوحدة');
  const availabilityIndex = keys.indexOf('متوفر');

  const orderedCandidates =
    unitIndex >= 0 && availabilityIndex > unitIndex
      ? keys.slice(unitIndex + 1, availabilityIndex)
      : keys;

  const cityKeys = orderedCandidates.filter(
    (key) => key.trim() && !NON_CITY_COLUMNS.has(key.trim()),
  );

  const cityPrices: Record<string, number | null> = {};
  for (const city of cityKeys) {
    cityPrices[city.trim()] = parsePrice(row[city]);
  }

  // Canonical 21-column workbooks use سعر_اليوم instead of separate city columns.
  if (Object.keys(cityPrices).length === 0) {
    cityPrices[DEFAULT_CITY] = parsePrice(row.سعر_اليوم);
  }

  return cityPrices;
}

/**
 * Normalize an Arabic boolean cell ("نعم" -> true, "لا" -> false)
 */
export function parseExcelBool(val: unknown): boolean {
  if (!val) return false;
  const str = String(val).trim().toLowerCase();
  return str === 'نعم' || str === 'yes' || str === 'true' || str === '1';
}

/** Missing فعال means the simpler public sheet schema is active by default. */
function isRowActive(row: RawExcelRow): boolean {
  const value = row.فعال;
  if (value === undefined || value === null || String(value).trim() === '') return true;
  return parseExcelBool(value);
}

/**
 * Transform a Raw Excel Row into a validated ProductDTO with audit warning metadata
 */
export function parseRawRowWithAudit(
  row: RawExcelRow,
  seenIds?: Set<string>
): { product: ProductDTO | null; warning?: string } {
  if (!row || typeof row !== 'object') {
    return { product: null, warning: 'Invalid row object' };
  }

  // Google Sheets may auto-fill the image-preview formula far beyond the
  // actual data range. Treat rows with no source product data as blank so
  // they do not create hundreds of misleading “empty ID” warnings.
  const hasProductData = Object.entries(row).some(([key, value]) => {
    if (key.trim() === 'معاينة الصورة') return false;
    if (value === null || value === undefined) return false;
    return typeof value !== 'string' || value.trim() !== '';
  });
  if (!hasProductData) {
    return { product: null };
  }

  // Normalize the legacy public sheet schema into the canonical app schema.
  // The public sheet uses المادة/المصنع/طرابلس/آخر تحديث.
  const normalizedRow: RawExcelRow = {
    ...row,
    اسم_العرض: row.اسم_العرض || row.المادة || '',
    المصنع_او_المصدر: row.المصنع_او_المصدر || row.المصنع || null,
    آخر_تحديث: row.آخر_تحديث || row['آخر تحديث'] || null,
  };

  // 1. Check active flag (فعال)
  const isActive = isRowActive(normalizedRow);
  if (!isActive) {
    return { product: null };
  }

  // 2. ID Validation & Uniqueness Check
  const rawId = normalizedRow.id !== undefined && normalizedRow.id !== null ? String(normalizedRow.id).trim() : '';
  if (!rawId) {
    return { product: null, warning: 'Product has empty ID' };
  }

  if (seenIds) {
    if (seenIds.has(rawId)) {
      return { product: null, warning: `Duplicate product ID detected: "${rawId}"` };
    }
    seenIds.add(rawId);
  }

  // 3. Mandatory Fields
  const category = (normalizedRow.التصنيف || '').trim();
  const name = (normalizedRow.اسم_العرض || '').trim();
  if (!category || !name) {
    return { product: null, warning: `Product ${rawId} missing name or category` };
  }

  // 4. Availability & Price Integrity Normalization
  const isAvailableFlag = parseExcelBool(normalizedRow.متوفر);
  const rawCityPrices = extractCityPricesFromRow(normalizedRow);
  const cityPrices = Object.fromEntries(
    Object.entries(rawCityPrices).map(([city, cityPrice]) => [
      city,
      isAvailableFlag && cityPrice !== null && cityPrice > 0 ? cityPrice : null,
    ]),
  );
  const cityNames = Object.keys(cityPrices);
  const primaryCity = cityNames.includes(DEFAULT_CITY) ? DEFAULT_CITY : cityNames[0];
  const parsedPrice = primaryCity ? cityPrices[primaryCity] : null;
  const hasAnyRawCityPrice = Object.values(rawCityPrices).some(
    (cityPrice) => cityPrice !== null && cityPrice > 0,
  );

  let finalPrice: number | null = null;
  let finalAvailable = false;
  let warning: string | undefined;

  if (isAvailableFlag && parsedPrice !== null && parsedPrice > 0) {
    finalPrice = parsedPrice;
    finalAvailable = true;
  } else if (isAvailableFlag && !hasAnyRawCityPrice) {
    // Inconsistent Case A/B: متوفر=نعم but price is empty or 0
    finalPrice = null;
    finalAvailable = false;
    warning = `Product ${rawId} marked as available (متوفر=نعم) but has zero or empty price. Normalized to unavailable.`;
  } else if (!isAvailableFlag && hasAnyRawCityPrice) {
    // Inconsistent Case C: متوفر=لا but price entered
    finalPrice = null;
    finalAvailable = false;
    warning = `Product ${rawId} marked as unavailable (متوفر=لا) but has a city price. Normalized to unavailable in every city.`;
  } else {
    // Normal unavailable case
    finalPrice = null;
    finalAvailable = false;
  }

  // Sort order
  let sortOrder = 999;
  if (normalizedRow.الترتيب !== undefined && normalizedRow.الترتيب !== null) {
    const parsedOrder = parseInt(String(normalizedRow.الترتيب), 10);
    if (!isNaN(parsedOrder)) {
      sortOrder = parsedOrder;
    }
  }

  // Source code
  let sourceCode: number | null = null;
  if (normalizedRow.source_code !== undefined && normalizedRow.source_code !== null) {
    const parsedSc = parseInt(String(normalizedRow.source_code), 10);
    if (!isNaN(parsedSc)) {
      sourceCode = parsedSc;
    }
  }

  // Unit: faithfully use whatever is in Google Sheet/Excel
  const rawUnit = (normalizedRow.الوحدة || '').trim();
  const unit = rawUnit && rawUnit !== 'غير محددة' ? rawUnit : '';

  const product: ProductDTO = {
    id: rawId,
    sourceCode,
    sortOrder,
    category,
    subcategory: (normalizedRow.التصنيف_الفرعي || '').trim(),
    name,
    type: normalizedRow.النوع ? String(normalizedRow.النوع).trim() : null,
    size: normalizedRow.المقاس ? String(normalizedRow.المقاس).trim() : null,
    length: normalizedRow.الطول ? String(normalizedRow.الطول).trim() : null,
    manufacturer: normalizedRow.المصنع_او_المصدر ? String(normalizedRow.المصنع_او_المصدر).trim() : null,
    origin: normalizedRow.المنشأ ? String(normalizedRow.المنشأ).trim() : null,
    package: normalizedRow.العبوة ? String(normalizedRow.العبوة).trim() : null,
    unit,
    price: finalPrice,
    available: finalAvailable,
    updatedAt: normalizedRow.آخر_تحديث ? String(normalizedRow.آخر_تحديث).trim() : null,
    searchText: (normalizedRow.كلمات_البحث || '').trim(),
    imageUrl: normalizeImageUrl(
      normalizedRow.رابط_الصورة ||
      normalizedRow['رابط الصورة'] ||
      normalizedRow.image_url ||
      normalizedRow.imageUrl,
    ),
    cityPrices,
    sourceAvailable: isAvailableFlag,
  };

  return { product, warning };
}

/**
 * Direct row to product parser
 */
export function parseRawRowToProduct(row: RawExcelRow, seenIds?: Set<string>): ProductDTO | null {
  const { product } = parseRawRowWithAudit(row, seenIds);
  return product;
}

/**
 * Parse an array of Raw Excel rows into clean ProductDTOs
 */
export function parseRawRowsToProducts(rows: RawExcelRow[]): ProductDTO[] {
  const products: ProductDTO[] = [];
  const seenIds = new Set<string>();

  for (const row of rows) {
    const { product, warning } = parseRawRowWithAudit(row, seenIds);
    if (warning && process.env.NODE_ENV !== 'production') {
      console.warn('[Data Integrity Warning]:', warning);
    }
    if (product) {
      products.push(product);
    }
  }

  // Sort by sortOrder ascending
  return products.sort((a, b) => a.sortOrder - b.sortOrder);
}

/**
 * Audit parsing an entire dataset and return a structured statistical report
 */
export function auditRawDataset(rows: RawExcelRow[]): ParseAuditReport {
  const seenIds = new Set<string>();
  const duplicateIds: string[] = [];
  const warnings: string[] = [];
  const categories: Record<string, number> = {};

  let activeCount = 0;
  let inactiveCount = 0;
  let availableCount = 0;
  let unavailableCount = 0;
  let invalidCount = 0;

  for (const row of rows) {
    const rawId = row.id !== undefined && row.id !== null ? String(row.id).trim() : '';
    if (rawId) {
      if (seenIds.has(rawId)) {
        duplicateIds.push(rawId);
      } else {
        seenIds.add(rawId);
      }
    }

    const isActive = isRowActive(row);
    if (!isActive) {
      inactiveCount++;
      continue;
    }

    const { product, warning } = parseRawRowWithAudit(row);
    if (warning) {
      warnings.push(warning);
    }

    if (!product) {
      invalidCount++;
      continue;
    }

    activeCount++;
    categories[product.category] = (categories[product.category] || 0) + 1;

    if (product.available) {
      availableCount++;
    } else {
      unavailableCount++;
    }
  }

  return {
    totalRows: rows.length,
    activeCount,
    inactiveCount,
    availableCount,
    unavailableCount,
    invalidCount,
    duplicateIds,
    categories,
    warnings,
  };
}

/**
 * Parse an entire SheetJS workbook
 */
export function parseExcelWorkbook(workbook: XLSX.WorkBook, targetSheet = 'Products'): ProductDTO[] {
  const sheetName = workbook.SheetNames.find(
    (name) => name.toLowerCase() === targetSheet.toLowerCase()
  ) || workbook.SheetNames[0];

  if (!sheetName) {
    throw new Error(`لم يتم العثور على ورقة العمل "${targetSheet}" داخل ملف Excel / Google Sheets`);
  }

  const sheet = workbook.Sheets[sheetName];
  if (!sheet) {
    throw new Error(`ورقة العمل "${sheetName}" فارغة`);
  }

  // Convert sheet to JSON rows using header row
  const rawRows = XLSX.utils.sheet_to_json<RawExcelRow>(sheet, {
    raw: false,
    defval: null,
  });

  const products = parseRawRowsToProducts(rawRows);
  const imageSheetName = workbook.SheetNames.find((name) =>
    ['صور الأصناف', 'صور الاصناف', 'productimages', 'images'].includes(name.trim().toLowerCase()),
  );

  if (!imageSheetName) return products;

  const imageRows = XLSX.utils.sheet_to_json<Record<string, unknown>>(workbook.Sheets[imageSheetName], {
    raw: false,
    defval: null,
  });
  const imagesById = new Map<string, string>();

  for (const imageRow of imageRows) {
    const id = String(imageRow.id || imageRow.ID || '').trim();
    const imageUrl = normalizeImageUrl(
      imageRow.رابط_الصورة || imageRow['رابط الصورة'] || imageRow.image_url || imageRow.imageUrl,
    );
    if (id && imageUrl) imagesById.set(id, imageUrl);
  }

  return products.map((product) => ({
    ...product,
    imageUrl: imagesById.get(product.id) || product.imageUrl || null,
  }));
}

/**
 * Dynamically extract unique categories and count active products in each
 */
export function extractCategories(products: ProductDTO[]): CategorySummary[] {
  const catMap = new Map<string, number>();

  for (const p of products) {
    catMap.set(p.category, (catMap.get(p.category) || 0) + 1);
  }

  const result: CategorySummary[] = [];

  for (const [name, count] of catMap.entries()) {
    const meta = CATEGORY_METADATA[name];
    result.push({
      name,
      count,
      slug: meta ? meta.slug : encodeURIComponent(name),
      description: meta?.description,
    });
  }

  return result;
}

/** Extract city tabs dynamically from the city-price columns present in products. */
export function extractCities(products: ProductDTO[]): CitySummary[] {
  const cityMap = new Map<string, CitySummary>();

  for (const product of products) {
    const prices = product.cityPrices || { [DEFAULT_CITY]: product.price };
    const sourceAvailable = product.sourceAvailable ?? product.available;

    for (const [city, price] of Object.entries(prices)) {
      const current = cityMap.get(city) || {
        name: city,
        productCount: 0,
        availableCount: 0,
      };
      current.productCount += 1;
      if (sourceAvailable && price !== null && price > 0) {
        current.availableCount += 1;
      }
      cityMap.set(city, current);
    }
  }

  return Array.from(cityMap.values());
}

/** Apply one selected city's price and availability to the legacy single-price DTO fields. */
export function applyCityPriceToProduct(product: ProductDTO, city: string): ProductDTO {
  const prices = product.cityPrices || { [DEFAULT_CITY]: product.price };
  const sourceAvailable = product.sourceAvailable ?? product.available;
  const cityPrice = Object.prototype.hasOwnProperty.call(prices, city) ? prices[city] : null;
  const available = sourceAvailable && cityPrice !== null && cityPrice > 0;

  return {
    ...product,
    price: available ? cityPrice : null,
    available,
  };
}

/**
 * Find latest updated timestamp among products
 */
export function getLatestUpdatedTimestamp(products: ProductDTO[]): string | null {
  for (const p of products) {
    if (p.updatedAt && p.updatedAt.trim()) {
      return p.updatedAt;
    }
  }
  return null;
}
