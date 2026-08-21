/**
 * Optional Minimal CORS Proxy for Public Excel Online XLSX file
 * Used ONLY if the hosting provider (e.g. OneDrive / SharePoint) blocks browser CORS.
 * No databases, no secrets, no OAuth - strictly streams the public binary file.
 */

import http from 'http';
import https from 'https';
import { URL } from 'url';

const PORT = process.env.PORT || 3001;
const PUBLIC_EXCEL_URL = process.env.VITE_EXCEL_PUBLIC_URL || '';

const server = http.createServer((req, res) => {
  // CORS Headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Range');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  if (req.url?.startsWith('/api/excel')) {
    const targetUrl = PUBLIC_EXCEL_URL;

    if (!targetUrl || !targetUrl.startsWith('http')) {
      res.writeHead(400, { 'Content-Type': 'application/json; charset=utf-8' });
      res.end(JSON.stringify({ error: 'لم يتم تعيين رابط ملف Excel العام في VITE_EXCEL_PUBLIC_URL' }));
      return;
    }

    try {
      const parsedUrl = new URL(targetUrl);
      const client = parsedUrl.protocol === 'https:' ? https : http;

      client.get(targetUrl, (proxyRes) => {
        // Handle HTTP redirects (e.g. 302 / 301 OneDrive download redirects)
        if (proxyRes.statusCode && proxyRes.statusCode >= 300 && proxyRes.statusCode < 400 && proxyRes.headers.location) {
          client.get(proxyRes.headers.location, (redirectRes) => {
            res.writeHead(redirectRes.statusCode || 200, {
              'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
              'Cache-Control': 'public, max-age=60',
            });
            redirectRes.pipe(res);
          }).on('error', (err) => {
            res.writeHead(500, { 'Content-Type': 'application/json; charset=utf-8' });
            res.end(JSON.stringify({ error: 'خطأ أثناء تحميل الملف المحول: ' + err.message }));
          });
          return;
        }

        res.writeHead(proxyRes.statusCode || 200, {
          'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          'Cache-Control': 'public, max-age=60',
        });
        proxyRes.pipe(res);
      }).on('error', (err) => {
        res.writeHead(500, { 'Content-Type': 'application/json; charset=utf-8' });
        res.end(JSON.stringify({ error: 'خطأ في الاتصال بالرابط: ' + err.message }));
      });
    } catch (err) {
      res.writeHead(500, { 'Content-Type': 'application/json; charset=utf-8' });
      res.end(JSON.stringify({ error: 'رابط غير صالح: ' + (err instanceof Error ? err.message : '') }));
    }
    return;
  }

  res.writeHead(404, { 'Content-Type': 'text/plain' });
  res.end('Not Found');
});

if (process.env.NODE_ENV !== 'test') {
  server.listen(PORT, () => {
    console.log(`[Excel Proxy Server] Running on http://localhost:${PORT}/api/excel`);
  });
}

export default server;
