import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

function extractGoogleSheetId(value: string): string {
  const trimmed = value.trim();
  if (/^[a-zA-Z0-9-_]{20,}$/.test(trimmed)) return trimmed;
  return trimmed.match(/docs\.google\.com\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/)?.[1] || '';
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const googleSheetId = extractGoogleSheetId(
    env.VITE_GOOGLE_SHEET_ID || env.VITE_EXCEL_PUBLIC_URL || '',
  );

  return {
    plugins: [react()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },
    server: {
      port: 3000,
      host: true,
      proxy: googleSheetId
        ? {
            '/api/excel': {
              target: 'https://docs.google.com',
              changeOrigin: true,
              secure: true,
              rewrite: () => `/spreadsheets/d/${googleSheetId}/export?format=xlsx`,
            },
          }
        : undefined,
    },
    build: {
      chunkSizeWarningLimit: 600,
      rollupOptions: {
        output: {
          manualChunks: {
            'vendor-react': ['react', 'react-dom', 'react-router-dom'],
            'vendor-xlsx': ['xlsx'],
            'vendor-icons': ['lucide-react'],
          },
        },
      },
    },
    test: {
      globals: true,
      environment: 'jsdom',
      setupFiles: './tests/setup.ts',
    },
  };
});
