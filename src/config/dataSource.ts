/**
 * Centralized Data Source Configuration
 * Supports:
 * 1. Google Sheets ID (VITE_GOOGLE_SHEET_ID)
 * 2. Google Sheets Share/View URL (with auto export?format=xlsx & gid preservation)
 * 3. Google Drive file links (auto uc?export=download)
 * 4. Microsoft OneDrive / SharePoint links (auto &download=1)
 * 5. Dropbox links (auto dl=1 / raw=1)
 * 6. Direct XLSX URLs
 * 7. Runtime fail-closed policy (NO silent local snapshot for customers)
 */

/**
 * Converts any Google Sheets, Google Drive, OneDrive, or Dropbox link into a direct XLSX export/download URL
 */
export function normalizeExcelUrl(rawUrlOrId: string): string {
  if (!rawUrlOrId || !rawUrlOrId.trim()) return '';

  const trimmed = rawUrlOrId.trim();

  // Case 1: Plain Google Sheet ID (alphanumeric, dashes, underscores, typically 20+ chars)
  if (!trimmed.startsWith('http') && /^[a-zA-Z0-9-_]{20,}$/.test(trimmed)) {
    return `https://docs.google.com/spreadsheets/d/${trimmed}/export?format=xlsx`;
  }

  // Case 2: Google Spreadsheet URL (view / edit / share)
  // e.g. https://docs.google.com/spreadsheets/d/1AbC.../edit?usp=sharing#gid=0
  const gSheetMatch = trimmed.match(/docs\.google\.com\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/);
  if (gSheetMatch && gSheetMatch[1]) {
    const sheetId = gSheetMatch[1];
    // Check if gid is present
    const gidMatch = trimmed.match(/[?&#]gid=([0-9]+)/);
    const gidParam = gidMatch ? `&gid=${gidMatch[1]}` : '';
    return `https://docs.google.com/spreadsheets/d/${sheetId}/export?format=xlsx${gidParam}`;
  }

  // Case 3: Google Drive file link
  // e.g. https://drive.google.com/file/d/1AbC.../view
  const gDriveMatch = trimmed.match(/drive\.google\.com\/file\/d\/([a-zA-Z0-9-_]+)/);
  if (gDriveMatch && gDriveMatch[1]) {
    const fileId = gDriveMatch[1];
    return `https://drive.google.com/uc?export=download&id=${fileId}`;
  }

  // Case 4: Microsoft OneDrive link (1drv.ms or sharepoint)
  // e.g. https://1drv.ms/x/s!...
  if (trimmed.includes('1drv.ms') || (trimmed.includes('sharepoint.com') && !trimmed.includes('download=1'))) {
    const separator = trimmed.includes('?') ? '&' : '?';
    return `${trimmed}${separator}download=1`;
  }

  // Case 5: Dropbox link
  // e.g. https://www.dropbox.com/s/xxxx/file.xlsx?dl=0
  if (trimmed.includes('dropbox.com')) {
    if (trimmed.includes('dl=0')) {
      return trimmed.replace('dl=0', 'dl=1');
    }
    if (!trimmed.includes('dl=1') && !trimmed.includes('raw=1')) {
      const separator = trimmed.includes('?') ? '&' : '?';
      return `${trimmed}${separator}dl=1`;
    }
  }

  // Case 6: Direct XLSX URL
  return trimmed;
}

// Official Google Sheet URL for production fallback if environment variable is omitted
const DEFAULT_GOOGLE_SHEET_ID = 'https://docs.google.com/spreadsheets/d/1NYpSUjzWoJXgO5hG4LMq8RkdoAxZNbIX99UnLiurno8/edit?gid=1362371690#gid=1362371690';

export const DATA_CONFIG = {
  // Configured Sheet ID or Raw URL from environment with official fallback
  rawGoogleSheetId: (import.meta.env.VITE_GOOGLE_SHEET_ID || DEFAULT_GOOGLE_SHEET_ID).trim(),
  rawExcelPublicUrl: (import.meta.env.VITE_EXCEL_PUBLIC_URL || '').trim(),

  // Resolved Direct XLSX URL
  getResolvedUrl(): string {
    if (this.rawGoogleSheetId) {
      return normalizeExcelUrl(this.rawGoogleSheetId);
    }
    if (this.rawExcelPublicUrl) {
      return normalizeExcelUrl(this.rawExcelPublicUrl);
    }
    return '';
  },

  // Cache TTL in seconds (default: 60s)
  cacheSeconds: Number(import.meta.env.VITE_CACHE_SECONDS) || 60,

  // Target worksheet name
  sheetName: 'Products',
  tableName: 'ProductsTable',

  // Check if live data source is configured
  isLiveConfigured(): boolean {
    const resolved = this.getResolvedUrl();
    return Boolean(resolved && resolved.startsWith('http'));
  },

  isProduction(): boolean {
    return Boolean(import.meta.env.PROD);
  },

};
