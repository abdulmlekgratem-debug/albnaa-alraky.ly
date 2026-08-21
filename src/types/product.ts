/**
 * Raw Excel Row matching exactly the 21 columns of `ProductsTable` in sheet `Products`
 */
export interface RawExcelRow {
  [column: string]: unknown;
  id: string | number;
  source_code?: string | number | null;
  الترتيب?: string | number | null;
  التصنيف: string;
  التصنيف_الفرعي?: string | null;
  اسم_العرض?: string | null;
  الاسم_الأصلي?: string | null;
  النوع?: string | null;
  المقاس?: string | null;
  الطول?: string | null;
  المصنع_او_المصدر?: string | null;
  المنشأ?: string | null;
  العبوة?: string | null;
  الوحدة: string;
  سعر_اليوم?: string | number | null;
  متوفر: string; // "نعم" | "لا"
  فعال?: string | null;  // "نعم" | "لا"; omitted in the simplified public schema
  آخر_تحديث?: string | null;
  كلمات_البحث?: string | null;
  يحتاج_مراجعة?: string | null;
  ملاحظات?: string | null;
  رابط_الصورة?: string | null;
  'رابط الصورة'?: string | null;
  image_url?: string | null;
  imageUrl?: string | null;
  'معاينة الصورة'?: string | null;

  // Legacy/public Google Sheet column aliases kept for backwards compatibility.
  المادة?: string | null;
  المصنع?: string | null;
  طرابلس?: string | number | null;
  'آخر تحديث'?: string | null;
}

/**
 * Public Product Data Transfer Object used throughout the UI
 */
export interface ProductDTO {
  id: string;
  sourceCode: number | null;
  sortOrder: number;
  category: string;
  subcategory: string;
  name: string;
  type: string | null;
  size: string | null;
  length: string | null;
  manufacturer: string | null;
  origin: string | null;
  package: string | null;
  unit: string;
  price: number | null; // null if unavailable or 0
  available: boolean;
  updatedAt: string | null;
  searchText: string;
  /** Optional direct image URL, usually merged from the صور الأصناف worksheet by product id. */
  imageUrl?: string | null;
  /** Prices keyed by city column name from the live sheet. Zero/blank values are normalized to null. */
  cityPrices?: Record<string, number | null>;
  /** The explicit value of the sheet's متوفر column before applying the selected city price. */
  sourceAvailable?: boolean;
}

export interface CitySummary {
  name: string;
  productCount: number;
  availableCount: number;
}

export interface CategorySummary {
  name: string;
  count: number;
  slug: string;
  description?: string;
  iconName?: string;
}

export interface PriceDataState {
  products: ProductDTO[];
  categories: CategorySummary[];
  lastUpdated: string | null;
  isLoading: boolean;
  error: string | null;
  isFromSnapshot: boolean;
}
