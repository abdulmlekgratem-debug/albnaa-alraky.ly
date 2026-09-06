/**
 * Excel / Google Sheets Binary Loader with Dynamic Lazy Import, CORS Fallback & Production Fail-Closed
 */

import { ProductDTO } from '../types/product';
import { parseExcelWorkbook } from './excelParser';
import { DATA_CONFIG } from '../config/dataSource';
import { LOCAL_PRODUCTS_SNAPSHOT } from '../data/localSnapshot';

export interface LoadProductsResult {
  products: ProductDTO[];
  isFromSnapshot: boolean;
  timestamp: string;
  sourceUrl?: string;
}

/**
 * Validates that binary buffer is a valid OpenXML/ZIP archive (starts with PK\x03\x04)
 * and not an HTML login page, error page, or Google Docs preview.
 */
export function isZipXlsxBuffer(buffer: ArrayBuffer): boolean {
  if (buffer.byteLength < 4) return false;
  const header = new Uint8Array(buffer.slice(0, 4));
  // ZIP Magic Number: 50 4B 03 04 ("PK\x03\x04")
  return header[0] === 0x50 && header[1] === 0x4B && header[2] === 0x03 && header[3] === 0x04;
}

/**
 * Fetch array buffer from direct URL or via /api/excel proxy
 */
async function fetchSpreadsheetBuffer(url: string, bypassCache: boolean): Promise<ArrayBuffer> {
  const separator = url.includes('?') ? '&' : '?';
  const finalUrl = bypassCache ? `${url}${separator}ts=${Date.now()}` : url;

  // 1. Try Direct Fetch first
  try {
    const response = await fetch(finalUrl, {
      method: 'GET',
      headers: {
        'Accept': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/octet-stream, */*',
      },
    });

    if (response.ok) {
      const contentType = (response.headers.get('Content-Type') || '').toLowerCase();
      if (contentType.includes('text/html')) {
        throw new Error(
          'Google Sheets source returned HTML instead of XLSX binary. يرجى التأكد من إتاحة الملف العام (Anyone with the link).'
        );
      }

      const buffer = await response.arrayBuffer();
      if (!isZipXlsxBuffer(buffer)) {
        throw new Error(
          'الملف المستلم ليس ملف Excel (.xlsx) صالح (فشل فحص الترويسة الثنائية PK).'
        );
      }

      return buffer;
    }
  } catch (directErr: unknown) {
    // If running in browser and direct fetch failed (likely CORS or network), attempt /api/excel proxy fallback
    if (typeof window !== 'undefined' && !url.startsWith('/api/excel')) {
      const proxyUrl = `/api/excel${bypassCache ? `?ts=${Date.now()}` : ''}`;
      try {
        const proxyResponse = await fetch(proxyUrl, { method: 'GET' });
        if (proxyResponse.ok) {
          const buffer = await proxyResponse.arrayBuffer();
          if (isZipXlsxBuffer(buffer)) {
            return buffer;
          }
        }
      } catch {
        // proxy failed, throw original direct error
      }
    }

    const errorMsg = directErr instanceof Error ? directErr.message : 'فشل تحميل ملف الأسعار';
    throw new Error(errorMsg);
  }

  throw new Error('تعذر تحميل ملف الأسعار من الخادم السحابي.');
}

/**
 * Fetch and load products from Google Sheets / Excel URL with fail-closed production safety
 */
export async function loadProducts(bypassCache = false): Promise<LoadProductsResult> {
  // Tests must remain deterministic and must never depend on a live network source.
  if (import.meta.env.MODE === 'test') {
    return {
      products: LOCAL_PRODUCTS_SNAPSHOT,
      isFromSnapshot: true,
      timestamp: new Date().toISOString(),
    };
  }

  // 1. Check MySQL Database API first (/api/products.php)
  if (typeof window !== 'undefined') {
    try {
      const dbResponse = await fetch(`/api/products.php${bypassCache ? `?ts=${Date.now()}` : ''}`, {
        method: 'GET',
      });
      if (dbResponse.ok) {
        const data = await dbResponse.json();
        if (data && Array.isArray(data.products) && data.products.length > 0) {
          return {
            products: data.products,
            isFromSnapshot: false,
            timestamp: new Date().toISOString(),
            sourceUrl: '/api/products.php',
          };
        }
      }
    } catch {
      // Database API not reachable or not yet configured; gracefully fall through to remote spreadsheet
    }
  }

  const targetUrl = DATA_CONFIG.getResolvedUrl();
  const isProd = DATA_CONFIG.isProduction();

  // Rule 1: Fail closed in every customer-facing runtime if no remote source is configured.
  // Local snapshot data is reserved for deterministic automated tests only.
  if (!targetUrl || !targetUrl.startsWith('http')) {
    throw new Error(
      'المنظومة قيد الصيانة وتحديث قائمة الأسعار حاليًا لمطابقة ومراجعة الأسعار المعتمدة، وسنعود للعمل قريبًا.'
    );
  }

  // Rule 2: Fetch and Parse Remote Spreadsheet
  try {
    const arrayBuffer = await fetchSpreadsheetBuffer(targetUrl, bypassCache);

    // Dynamic Lazy Import of SheetJS to keep main bundle ultra lightweight
    const XLSX = await import('xlsx');

    const workbook = XLSX.read(arrayBuffer, {
      type: 'array',
      cellDates: true,
      cellStyles: false,
    });

    const products = parseExcelWorkbook(workbook, DATA_CONFIG.sheetName);

    if (products.length === 0) {
      throw new Error('جاري مراجعة وتحديث أصناف وقائمة الأسعار حاليًا، يرجى المحاولة بعد قليل.');
    }

    return {
      products,
      isFromSnapshot: false,
      timestamp: new Date().toISOString(),
      sourceUrl: targetUrl,
    };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'خطأ أثناء قراءة ملف الأسعار';
    console.error('[ExcelLoader Error]:', message);

    // Production: Fail-closed, friendly maintenance message
    if (isProd) {
      throw new Error(
        'المنظومة قيد التحديث والصيانة الدورية حاليًا لمطابقة الأسعار المعتمدة، يرجى إعادة المحاولة بعد قليل.'
      );
    }

    // In Dev Mode with failed URL: Throw clear development error
    throw new Error(message);
  }
}
