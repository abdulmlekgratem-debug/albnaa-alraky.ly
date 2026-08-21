/**
 * Arabic Text Normalization and Robust Instant Search
 */

import { ProductDTO } from '../types/product';

/**
 * Normalizes Arabic text for flexible matching:
 * - Unifies Alef variants (أ, إ, آ, ٱ -> ا)
 * - Unifies Taa Marbuta (ة -> ه)
 * - Unifies Yaa / Alef Maksura (ى -> ي)
 * - Strips Diacritics / Tashkeel
 * - Strips Tatweel (ـ)
 * - Normalizes whitespaces & punctuation
 */
export function normalizeArabic(text: string | null | undefined): string {
  if (!text) return '';

  return text
    .toString()
    .toLowerCase()
    // Remove diacritics / harakat
    .replace(/[\u064B-\u065F\u0670]/g, '')
    // Remove tatweel
    .replace(/\u0640/g, '')
    // Normalize Alef forms
    .replace(/[أإآٱ]/g, 'ا')
    // Normalize Taa Marbuta
    .replace(/ة/g, 'ه')
    // Normalize Yaa / Alef Maksura
    .replace(/[ى]/g, 'ي')
    // Normalize common Hamza carriers
    .replace(/ؤ/g, 'و')
    .replace(/ئ/g, 'ي')
    // Replace non-alphanumeric separators with spaces except dimensions (e.g. 20x40 or 20×40)
    .replace(/[,\-_/\\()+]/g, ' ')
    // Normalize Arabic multiplication sign
    .replace(/×/g, 'x')
    // Collapse whitespace
    .replace(/\s+/g, ' ')
    .trim()
    // Normalize millimetre abbreviations only as complete words so product names are not corrupted.
    .replace(/(^| )(?:ملي|ملم|مل)(?= |$)/g, '$1مم');
}

const SEARCH_SYNONYMS: Record<string, string> = {
  سمنت: 'اسمنت',
  سمينت: 'اسمنت',
  اسمينت: 'اسمنت',
  طوب: 'ياجور',
  اجر: 'ياجور',
  اجور: 'ياجور',
  سيخ: 'حديد',
  اسياخ: 'حديد',
  رمله: 'رمل',
  زلط: 'ركام',
  حصي: 'ركام',
  حصوه: 'ركام',
  بلوكه: 'بلوك',
  ملي: 'مم',
  ملم: 'مم',
  مل: 'مم',
};

function canonicalSearchText(text: string | null | undefined): string {
  return normalizeArabic(text)
    .split(' ')
    .filter(Boolean)
    .map((token) => SEARCH_SYNONYMS[token] || token)
    .join(' ');
}

function editDistance(left: string, right: string): number {
  const rows = left.length + 1;
  const columns = right.length + 1;
  const matrix = Array.from({ length: rows }, () => Array<number>(columns).fill(0));

  for (let row = 0; row < rows; row += 1) matrix[row][0] = row;
  for (let column = 0; column < columns; column += 1) matrix[0][column] = column;

  for (let row = 1; row < rows; row += 1) {
    for (let column = 1; column < columns; column += 1) {
      const substitutionCost = left[row - 1] === right[column - 1] ? 0 : 1;
      matrix[row][column] = Math.min(
        matrix[row - 1][column] + 1,
        matrix[row][column - 1] + 1,
        matrix[row - 1][column - 1] + substitutionCost,
      );
    }
  }

  return matrix[left.length][right.length];
}

function matchToken(queryToken: string, corpus: string, corpusTokens: string[]): number {
  if (corpus.includes(queryToken)) return 20;

  const prefixMatch = corpusTokens.some(
    (token) => token.startsWith(queryToken) || queryToken.startsWith(token),
  );
  if (prefixMatch) return 12;

  if (queryToken.length < 3) return 0;
  const allowedDistance = queryToken.length >= 7 ? 2 : 1;
  const fuzzyMatch = corpusTokens.some((token) => {
    if (Math.abs(token.length - queryToken.length) > allowedDistance) return false;
    return editDistance(queryToken, token) <= allowedDistance;
  });

  return fuzzyMatch ? 6 : 0;
}

/**
 * Perform instant normalized search over products
 * Checks: name, size, manufacturer, origin, category, subcategory, search_aliases
 */
export function searchProducts(
  products: ProductDTO[],
  query: string
): ProductDTO[] {
  if (!query || !query.trim()) {
    return products;
  }

  const normalizedQuery = canonicalSearchText(query);
  const queryTokens = normalizedQuery.split(' ').filter(Boolean);

  if (queryTokens.length === 0) {
    return products;
  }

  return products
    .map((product) => {
    const corpus = canonicalSearchText(
      [
        product.name,
        product.searchText,
        product.category,
        product.subcategory,
        product.type,
        product.size,
        product.manufacturer,
        product.origin,
        product.package,
        product.unit,
      ]
        .filter(Boolean)
        .join(' ')
    );
      const corpusTokens = Array.from(new Set(corpus.split(' ').filter(Boolean)));
      const tokenScores = queryTokens.map((token) => matchToken(token, corpus, corpusTokens));
      if (tokenScores.some((score) => score === 0)) return null;

      const normalizedName = canonicalSearchText(product.name);
      const directNameBonus = normalizedName.includes(normalizedQuery) ? 80 : 0;
      const exactPhraseBonus = corpus.includes(normalizedQuery) ? 40 : 0;
      return {
        product,
        score: tokenScores.reduce((total, score) => total + score, 0) + directNameBonus + exactPhraseBonus,
      };
    })
    .filter((item): item is { product: ProductDTO; score: number } => item !== null)
    .sort((left, right) => right.score - left.score || left.product.sortOrder - right.product.sortOrder)
    .map((item) => item.product);
}

/**
 * Extract instant query suggestions (up to 5 items)
 */
export function getSearchSuggestions(
  products: ProductDTO[],
  query: string,
  limit = 5
): ProductDTO[] {
  if (!query || query.trim().length < 2) return [];
  const results = searchProducts(products, query);
  if (results.length > 0) return results.slice(0, limit);

  // If an exact multi-token query has no available result (for example an
  // unavailable size), keep the useful text token and offer nearby available
  // products instead of leaving the customer at a dead end.
  const fallbackTokens = canonicalSearchText(query)
    .split(' ')
    .filter((token) => token.length >= 3 && !/^\d+(?:[.,]\d+)?$/.test(token));

  const seen = new Set<string>();
  const fallbackResults: ProductDTO[] = [];
  fallbackTokens.forEach((token) => {
    searchProducts(products, token).forEach((product) => {
      if (seen.has(product.id) || fallbackResults.length >= limit) return;
      seen.add(product.id);
      fallbackResults.push(product);
    });
  });

  return fallbackResults.slice(0, limit);
}
