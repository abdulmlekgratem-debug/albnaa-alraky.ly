<?php
/**
 * Server-side Excel Proxy for Libyan Spider / cPanel hosting
 * Bypasses browser CORS restrictions by fetching Google Sheets server-to-server.
 */

// Allow cross-origin requests
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, OPTIONS");
header("Access-Control-Allow-Headers: *");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

$sheetUrl = "https://docs.google.com/spreadsheets/d/1NYpSUjzWoJXgO5hG4LMq8RkdoAxZNbIX99UnLiurno8/export?format=xlsx&gid=1362371690";

// Initialize cURL session
$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, $sheetUrl);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_FOLLOWLOCATION, true);
curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, true);
curl_setopt($ch, CURLOPT_TIMEOUT, 30);
curl_setopt($ch, CURLOPT_USERAGENT, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36');

$binaryData = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);

// Verify that valid binary was received (ZIP/XLSX starts with PK\x03\x04)
if ($httpCode === 200 && $binaryData && strlen($binaryData) > 4) {
    if (substr($binaryData, 0, 2) === "PK") {
        header("Content-Type: application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
        header("Content-Disposition: attachment; filename=prices.xlsx");
        header("Cache-Control: public, max-age=60");
        header("Content-Length: " . strlen($binaryData));
        echo $binaryData;
        exit;
    }
}

// Fallback if cURL failed or returned non-excel data
http_response_code(502);
header("Content-Type: application/json; charset=utf-8");
echo json_encode(["error" => "تعذر جلب ملف الأسعار من الخادم السحابي."], JSON_UNESCAPED_UNICODE);
