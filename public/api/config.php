<?php
/**
 * Al-Binaa Al-Raqi Database & Auth Configuration
 * Optimized for Libyan Spider / cPanel shared hosting (PHP 8 + MySQL PDO)
 */

// Enable session if not already started
if (session_status() === PHP_SESSION_NONE) {
    // Set secure session parameters
    ini_set('session.cookie_httponly', 1);
    ini_set('session.use_only_cookies', 1);
    session_start();
}

// Database Credentials (Update these with your cPanel MySQL details on Libyan Spider)
define('DB_HOST', getenv('DB_HOST') ?: 'localhost');
define('DB_NAME', getenv('DB_NAME') ?: 'alraky_db');
define('DB_USER', getenv('DB_USER') ?: 'root');
define('DB_PASS', getenv('DB_PASS') ?: '');
define('DB_CHARSET', 'utf8mb4');

/**
 * Get or create singleton PDO database connection
 */
function getDbConnection() {
    static $pdo = null;
    if ($pdo !== null) {
        return $pdo;
    }

    $dsn = "mysql:host=" . DB_HOST . ";dbname=" . DB_NAME . ";charset=" . DB_CHARSET;
    $options = [
        PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
        PDO::ATTR_EMULATE_PREPARES   => false,
    ];

    try {
        $pdo = new PDO($dsn, DB_USER, DB_PASS, $options);
        return $pdo;
    } catch (PDOException $e) {
        // Return null if database is not yet configured or connected
        return null;
    }
}

/**
 * Standard JSON response helper
 */
function jsonResponse($data, $statusCode = 200) {
    http_response_code($statusCode);
    header('Content-Type: application/json; charset=utf-8');
    header('Access-Control-Allow-Origin: *');
    header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
    header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With');
    echo json_encode($data, JSON_UNESCAPED_UNICODE);
    exit;
}

/**
 * Handle HTTP OPTIONS preflight
 */
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    jsonResponse(['ok' => true]);
}

/**
 * Get current authenticated user from session
 */
function getCurrentUser() {
    if (isset($_SESSION['user_id']) && !empty($_SESSION['user_id'])) {
        return [
            'id' => $_SESSION['user_id'],
            'username' => $_SESSION['username'],
            'fullName' => $_SESSION['full_name'] ?? $_SESSION['username'],
            'role' => $_SESSION['role'] ?? 'editor'
        ];
    }
    return null;
}

/**
 * Require authenticated user (any role)
 */
function requireAuth() {
    $user = getCurrentUser();
    if (!$user) {
        jsonResponse(['error' => 'غير مصرح لك بالوصول. يرجى تسجيل الدخول.'], 401);
    }
    return $user;
}

/**
 * Require admin role
 */
function requireAdmin() {
    $user = requireAuth();
    if ($user['role'] !== 'admin') {
        jsonResponse(['error' => 'هذا الإجراء يتطلب صلاحية مدير عام.'], 403);
    }
    return $user;
}
