/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_GOOGLE_SHEET_ID?: string;
  readonly VITE_EXCEL_PUBLIC_URL?: string;
  readonly VITE_CACHE_SECONDS?: string;
  readonly VITE_PRICE_DISPLAY_MODE?: 'live' | 'calibration';
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
