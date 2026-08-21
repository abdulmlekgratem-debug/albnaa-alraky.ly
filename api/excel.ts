import type { IncomingMessage, ServerResponse } from 'http';
import https from 'https';
import http from 'http';
import { URL } from 'url';

/**
 * Production Serverless Endpoint (/api/excel) for Vercel / Netlify / Node Functions.
 * Proxies Google Sheets, OneDrive, Dropbox, or Google Drive XLSX binary files with CORS headers.
 * Zero database, zero secrets, zero transformations.
 */

function normalizeTargetUrl(raw: string): string {
  if (!raw || !raw.trim()) return '';
  const trimmed = raw.trim();

  // Plain Google Sheet ID
  if (!trimmed.startsWith('http') && /^[a-zA-Z0-9-_]{20,}$/.test(trimmed)) {
    return `https://docs.google.com/spreadsheets/d/${trimmed}/export?format=xlsx`;
  }

  // Google Spreadsheet URL (with gid support)
  const gSheetMatch = trimmed.match(/docs\.google\.com\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/);
  if (gSheetMatch && gSheetMatch[1]) {
    const sheetId = gSheetMatch[1];
    const gidMatch = trimmed.match(/[?&#]gid=([0-9]+)/);
    const gidParam = gidMatch ? `&gid=${gidMatch[1]}` : '';
    return `https://docs.google.com/spreadsheets/d/${sheetId}/export?format=xlsx${gidParam}`;
  }

  // Google Drive file link
  const gDriveMatch = trimmed.match(/drive\.google\.com\/file\/d\/([a-zA-Z0-9-_]+)/);
  if (gDriveMatch && gDriveMatch[1]) {
    const fileId = gDriveMatch[1];
    return `https://drive.google.com/uc?export=download&id=${fileId}`;
  }

  // Microsoft OneDrive / SharePoint
  if (trimmed.includes('1drv.ms') || (trimmed.includes('sharepoint.com') && !trimmed.includes('download=1'))) {
    const separator = trimmed.includes('?') ? '&' : '?';
    return `${trimmed}${separator}download=1`;
  }

  // Dropbox
  if (trimmed.includes('dropbox.com')) {
    if (trimmed.includes('dl=0')) {
      return trimmed.replace('dl=0', 'dl=1');
    }
    if (!trimmed.includes('dl=1') && !trimmed.includes('raw=1')) {
      const separator = trimmed.includes('?') ? '&' : '?';
      return `${trimmed}${separator}dl=1`;
    }
  }

  return trimmed;
}

export default async function handler(req: IncomingMessage, res: ServerResponse) {
  // CORS Headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, HEAD, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Range, If-None-Match');

  if (req.method === 'OPTIONS') {
    res.statusCode = 204;
    res.end();
    return;
  }

  const sheetIdOrUrl =
    process.env.VITE_GOOGLE_SHEET_ID ||
    process.env.VITE_EXCEL_PUBLIC_URL ||
    process.env.GOOGLE_SHEET_ID ||
    process.env.EXCEL_PUBLIC_URL ||
    '';

  const targetUrl = normalizeTargetUrl(sheetIdOrUrl);

  if (!targetUrl || !targetUrl.startsWith('http')) {
    res.statusCode = 400;
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    res.end(JSON.stringify({ error: 'لم يتم ضبط رابط Google Sheet أو Excel في متغيرات البيئة.' }));
    return;
  }

  try {
    const fetchStream = (urlStr: string, redirectCount = 0) => {
      if (redirectCount > 5) {
        res.statusCode = 502;
        res.setHeader('Content-Type', 'application/json; charset=utf-8');
        res.end(JSON.stringify({ error: 'تجاوز عدد التحويلات المسموح بها من المصدر السحابي.' }));
        return;
      }

      const parsedUrl = new URL(urlStr);
      const client = parsedUrl.protocol === 'https:' ? https : http;

      client
        .get(urlStr, { headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' } }, (upstreamRes) => {
          // Handle HTTP Redirects (301, 302, 303, 307, 308)
          if (
            upstreamRes.statusCode &&
            upstreamRes.statusCode >= 300 &&
            upstreamRes.statusCode < 400 &&
            upstreamRes.headers.location
          ) {
            const redirectUrl = new URL(upstreamRes.headers.location, urlStr).toString();
            fetchStream(redirectUrl, redirectCount + 1);
            return;
          }

          if (upstreamRes.statusCode && upstreamRes.statusCode >= 400) {
            res.statusCode = upstreamRes.statusCode;
            res.setHeader('Content-Type', 'application/json; charset=utf-8');
            res.end(JSON.stringify({ error: `المصدر السحابي أعاد رمز الخطأ: ${upstreamRes.statusCode}` }));
            return;
          }

          res.statusCode = 200;
          res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
          res.setHeader('Cache-Control', 'public, max-age=60, s-maxage=60, stale-while-revalidate=30');

          upstreamRes.pipe(res);
        })
        .on('error', (err) => {
          res.statusCode = 502;
          res.setHeader('Content-Type', 'application/json; charset=utf-8');
          res.end(JSON.stringify({ error: 'خطأ أثناء الاتصال بالمصدر السحابي: ' + err.message }));
        });
    };

    fetchStream(targetUrl);
  } catch (err) {
    res.statusCode = 500;
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    res.end(JSON.stringify({ error: 'خطأ غير متوقع في الخادم: ' + (err instanceof Error ? err.message : '') }));
  }
}
