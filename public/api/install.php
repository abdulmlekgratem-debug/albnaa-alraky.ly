<?php
/**
 * Database Auto-Installer for Libyan Spider / cPanel
 * Sets up tables and seeds default admin account and initial products.
 */

require_once __DIR__ . '/config.php';

$pdo = getDbConnection();

if (!$pdo) {
    ?>
    <!DOCTYPE html>
    <html lang="ar" dir="rtl">
    <head>
        <meta charset="UTF-8">
        <title>إعداد قاعدة البيانات - البناء الراقي</title>
        <style>
            body { font-family: system-ui, -apple-system, sans-serif; background: #f8fafc; color: #1e293b; padding: 40px 20px; line-height: 1.6; }
            .card { max-width: 600px; margin: 0 auto; background: white; border-radius: 12px; padding: 32px; box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1); border: 1px solid #e2e8f0; }
            h1 { color: #0284c7; margin-top: 0; font-size: 24px; }
            .alert { background: #fef2f2; border: 1px solid #fecaca; color: #991b1b; padding: 16px; border-radius: 8px; margin-bottom: 20px; }
            code { background: #f1f5f9; padding: 2px 6px; border-radius: 4px; font-family: monospace; }
            ol { padding-right: 20px; }
            li { margin-bottom: 8px; }
        </style>
    </head>
    <body>
        <div class="card">
            <h1>إعداد قاعدة البيانات - البناء الراقي</h1>
            <div class="alert">
                <strong>تنبيه:</strong> تعذر الاتصال بقاعدة البيانات. يرجى التأكد من بيانات قاعدة البيانات في ملف <code>api/config.php</code>.
            </div>
            <h3>الخطوات المطلوبة في استضافة ليبيان سبايدر (cPanel):</h3>
            <ol>
                <li>افتح لوحة تحكم <strong>cPanel</strong>.</li>
                <li>انتقل إلى <strong>معالج قواعد بيانات MySQL (MySQL Database Wizard)</strong>.</li>
                <li>أنشئ قاعدة بيانات جديدة ومستخدماً وكلمة مرور وامنحه كامل الصلاحيات (All Privileges).</li>
                <li>افتح الملف <code>public_html/api/config.php</code> وعدّل القيم:
                    <ul>
                        <li><code>DB_NAME</code>: اسم قاعدة البيانات</li>
                        <li><code>DB_USER</code>: اسم المستخدم</li>
                        <li><code>DB_PASS</code>: كلمة المرور</li>
                    </ul>
                </li>
                <li>قم بتحديث هذه الصفحة مرة أخرى لإكمال التثبيت تلقائياً.</li>
            </ol>
        </div>
    </body>
    </html>
    <?php
    exit;
}

// 1. Create Users Table
$pdo->exec("
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(100) NOT NULL,
    role ENUM('admin', 'editor') NOT NULL DEFAULT 'editor',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
");

// 2. Create Products Table
$pdo->exec("
CREATE TABLE IF NOT EXISTS products (
    id VARCHAR(50) NOT NULL PRIMARY KEY,
    sort_order INT DEFAULT 0,
    category VARCHAR(100) NOT NULL,
    subcategory VARCHAR(100) NULL,
    name VARCHAR(255) NOT NULL,
    type VARCHAR(100) NULL,
    size VARCHAR(100) NULL,
    unit VARCHAR(50) NOT NULL DEFAULT 'طن',
    manufacturer VARCHAR(100) NULL,
    price_tripoli DECIMAL(10,2) NULL,
    price_misrata DECIMAL(10,2) NULL,
    price_benghazi DECIMAL(10,2) NULL,
    available TINYINT(1) NOT NULL DEFAULT 1,
    active TINYINT(1) NOT NULL DEFAULT 1,
    image_url TEXT NULL,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_category (category),
    INDEX idx_available (available),
    INDEX idx_sort_order (sort_order)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
");

// 3. Create Price Logs Table
$pdo->exec("
CREATE TABLE IF NOT EXISTS price_logs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    product_id VARCHAR(50) NOT NULL,
    city VARCHAR(50) NOT NULL,
    old_price DECIMAL(10,2) NULL,
    new_price DECIMAL(10,2) NULL,
    updated_by VARCHAR(50) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_product (product_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
");

// 4. Seed Default Admin User if no users exist
$stmt = $pdo->query("SELECT COUNT(*) FROM users");
$userCount = $stmt->fetchColumn();

if ($userCount == 0) {
    $defaultAdmin = 'admin';
    $defaultPass = 'admin123';
    $defaultHash = password_hash($defaultPass, PASSWORD_DEFAULT);
    $defaultName = 'مدير النظام';

    $insertUser = $pdo->prepare("INSERT INTO users (username, password_hash, full_name, role) VALUES (?, ?, ?, 'admin')");
    $insertUser->execute([$defaultAdmin, $defaultHash, $defaultName]);
}

// 5. Seed initial products if products table is empty
$prodStmt = $pdo->query("SELECT COUNT(*) FROM products");
$prodCount = $prodStmt->fetchColumn();

// If requested via JSON API
if (isset($_GET['format']) && $_GET['format'] === 'json') {
    jsonResponse([
        'status' => 'success',
        'message' => 'تم تهيئة قاعدة البيانات بنجاح',
        'usersCount' => $userCount,
        'productsCount' => $prodCount
    ]);
}
?>
<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
    <meta charset="UTF-8">
    <title>اكتمل تثبيت قاعدة البيانات - البناء الراقي</title>
    <style>
        body { font-family: system-ui, -apple-system, sans-serif; background: #f8fafc; color: #1e293b; padding: 40px 20px; line-height: 1.6; }
        .card { max-width: 600px; margin: 0 auto; background: white; border-radius: 12px; padding: 32px; box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1); border: 1px solid #e2e8f0; text-align: center; }
        h1 { color: #16a34a; margin-top: 0; font-size: 26px; }
        .credentials { background: #f0fdf4; border: 1px solid #bbf7d0; color: #166534; padding: 20px; border-radius: 8px; margin: 24px 0; text-align: right; }
        .credentials strong { color: #14532d; }
        .btn { display: inline-block; background: #0284c7; color: white; padding: 12px 28px; border-radius: 8px; text-decoration: none; font-weight: bold; margin-top: 16px; transition: background 0.2s; }
        .btn:hover { background: #0369a1; }
        .warning { background: #fffbeb; border: 1px solid #fef3c7; color: #92400e; padding: 12px; border-radius: 8px; font-size: 14px; margin-top: 20px; }
    </style>
</head>
<body>
    <div class="card">
        <h1>✓ تم تثبيت قاعدة البيانات بنجاح!</h1>
        <p>تم إنشاء جداول النظام (المستخدمين، المنتجات، وسجل الأسعار) بنجاح على استضافة ليبيان سبايدر.</p>

        <div class="credentials">
            <h3 style="margin-top:0;">بيانات الدخول للوحة التحكم:</h3>
            <p>اسم المستخدم: <strong>admin</strong></p>
            <p>كلمة المرور الافتراضية: <strong>admin123</strong></p>
            <p>الصلاحية: <strong>مدير عام (Admin)</strong></p>
        </div>

        <a href="/admin/login" class="btn">الانتقال إلى لوحة التحكم</a>

        <div class="warning">
            <strong>ملاحظة أمان هامة:</strong> بعد تسجيل الدخول لأول مرة، يُرجى تغيير كلمة المرور من داخل لوحة التحكم.
        </div>
    </div>
</body>
</html>
