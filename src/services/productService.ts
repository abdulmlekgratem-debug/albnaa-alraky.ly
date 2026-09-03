/**
 * Product Data Service with in-memory caching, category queries, and domain-specific selectors
 */

import { ProductDTO, CategorySummary } from '../types/product';
import { loadProducts, LoadProductsResult } from '../lib/excelLoader';
import { extractCategories, getLatestUpdatedTimestamp } from '../lib/excelParser';
import { DATA_CONFIG } from '../config/dataSource';

interface CacheEntry {
  data: LoadProductsResult;
  expiresAt: number;
}

let memoryCache: CacheEntry | null = null;

/**
 * Get all active products with short-term in-memory cache (30-60s TTL)
 */
export async function getActiveProducts(bypassCache = false): Promise<LoadProductsResult> {
  const now = Date.now();

  if (!bypassCache && memoryCache && memoryCache.expiresAt > now) {
    return memoryCache.data;
  }

  const result = await loadProducts(bypassCache);

  memoryCache = {
    data: result,
    expiresAt: now + DATA_CONFIG.cacheSeconds * 1000,
  };

  return result;
}

/**
 * Find single product by ID (e.g. "P020")
 */
export async function getProductById(id: string): Promise<ProductDTO | null> {
  const { products } = await getActiveProducts();
  return products.find((p) => p.id === id) || null;
}

/**
 * Filter products by category name
 */
export async function getProductsByCategory(categoryName: string): Promise<ProductDTO[]> {
  const { products } = await getActiveProducts();
  return products.filter((p) => p.category.trim() === categoryName.trim());
}

/**
 * Get all available categories with product counts
 */
export async function getAllCategories(): Promise<CategorySummary[]> {
  const { products } = await getActiveProducts();
  return extractCategories(products);
}

/**
 * Get overall latest updated timestamp string
 */
export async function getLatestUpdate(): Promise<string | null> {
  const { products } = await getActiveProducts();
  return getLatestUpdatedTimestamp(products);
}

/**
 * Get 3 featured quick prices for the Home screen
 */
export function getQuickFeaturedPrices(products: ProductDTO[]): ProductDTO[] {
  // 1. Try finding specific benchmark items (Iron 12mm Misurata, Union Cement, Brick 20x20x40)
  const preferredIds = ['P020', 'P001', 'P057'];
  const preferred = preferredIds
    .map((id) => products.find((p) => p.id === id))
    .filter((p): p is ProductDTO => Boolean(p && p.available));

  if (preferred.length >= 3) {
    return preferred.slice(0, 3);
  }

  // Otherwise, select top available products from different categories
  const seenCategories = new Set<string>();
  const fallback: ProductDTO[] = [];

  for (const p of products) {
    if (p.available && !seenCategories.has(p.category)) {
      seenCategories.add(p.category);
      fallback.push(p);
      if (fallback.length === 3) break;
    }
  }

  return fallback.length > 0 ? fallback : products.slice(0, 3);
}

/**
 * Helper: Extract distinct iron sizes sorted numerically
 */
export function extractIronSizes(ironProducts: ProductDTO[]): string[] {
  const sizeSet = new Set<string>();
  for (const p of ironProducts) {
    if (p.size && p.size.trim()) {
      sizeSet.add(p.size.trim());
    }
  }

  return Array.from(sizeSet);
}

/**
 * Helper: Extract distinct brick types (ياجور بناء، ياجور سقف، بلوك)
 */
export function extractBrickTypes(brickProducts: ProductDTO[]): string[] {
  const typeSet = new Set<string>();
  for (const p of brickProducts) {
    const t = p.type || p.subcategory;
    if (t && t.trim()) {
      typeSet.add(t.trim());
    }
  }
  return Array.from(typeSet);
}

/**
 * Helper: Extract distinct sand subcategories
 */
export function extractSandSubcategories(sandProducts: ProductDTO[]): string[] {
  const subSet = new Set<string>();
  for (const p of sandProducts) {
    const sub = p.subcategory || p.type;
    if (sub && sub.trim()) {
      subSet.add(sub.trim());
    }
  }
  return Array.from(subSet);
}
