<?php
/**
 * Products & Prices API Endpoint
 * Provides public read access and authenticated CRUD & price updates.
 */

require_once __DIR__ . '/config.php';

$pdo = getDbConnection();
$method = $_SERVER['REQUEST_METHOD'];
$action = $_GET['action'] ?? '';

if (!$pdo) {
    jsonResponse(['error' => 'قاعدة البيانات غير متصلة.'], 500);
}

// -------------------------------------------------------------
// 1. GET: Fetch Products (Public / Admin)
// -------------------------------------------------------------
if ($method === 'GET') {
    $includeAll = isset($_GET['all']) && $_GET['all'] === '1' && getCurrentUser();
    
    $sql = $includeAll 
        ? "SELECT * FROM products ORDER BY sort_order ASC, id ASC"
        : "SELECT * FROM products WHERE active = 1 ORDER BY sort_order ASC, id ASC";

    $stmt = $pdo->query($sql);
    $rows = $stmt->fetchAll();

    $products = [];
    foreach ($rows as $row) {
        $tripoliPrice = $row['price_tripoli'] !== null ? (float)$row['price_tripoli'] : null;
        $misrataPrice = $row['price_misrata'] !== null ? (float)$row['price_misrata'] : null;
        $benghaziPrice = $row['price_benghazi'] !== null ? (float)$row['price_benghazi'] : null;
        $isAvailable = (bool)$row['available'];

        $products[] = [
            'id' => (string)$row['id'],
            'sourceCode' => null,
            'sortOrder' => (int)$row['sort_order'],
            'category' => $row['category'],
            'subcategory' => $row['subcategory'] ?: '',
            'name' => $row['name'],
            'type' => $row['type'],
            'size' => $row['size'],
            'length' => null,
            'manufacturer' => $row['manufacturer'],
            'origin' => null,
            'package' => null,
            'unit' => $row['unit'],
            'price' => $isAvailable && $tripoliPrice !== null && $tripoliPrice > 0 ? $tripoliPrice : null,
            'available' => $isAvailable,
            'active' => (bool)$row['active'],
            'updatedAt' => $row['updated_at'] ? date('d/m/Y H:i', strtotime($row['updated_at'])) : null,
            'searchText' => $row['name'] . ' ' . $row['category'] . ' ' . ($row['type'] ?? '') . ' ' . ($row['size'] ?? ''),
            'imageUrl' => $row['image_url'],
            'cityPrices' => [
                'طرابلس' => $isAvailable && $tripoliPrice !== null && $tripoliPrice > 0 ? $tripoliPrice : null,
                'مصراتة' => $isAvailable && $misrataPrice !== null && $misrataPrice > 0 ? $misrataPrice : null,
                'بنغازي' => $isAvailable && $benghaziPrice !== null && $benghaziPrice > 0 ? $benghaziPrice : null,
            ],
            'rawPrices' => [
                'طرابلس' => $tripoliPrice,
                'مصراتة' => $misrataPrice,
                'بنغازي' => $benghaziPrice,
            ],
            'sourceAvailable' => $isAvailable,
        ];
    }

    jsonResponse(['products' => $products]);
}

// -------------------------------------------------------------
// 2. POST: Create Product OR Bulk Import (Protected)
// -------------------------------------------------------------
if ($method === 'POST') {
    $user = requireAuth();

    $rawInput = file_get_contents('php://input');
    $data = json_decode($rawInput, true);

    // Bulk Import / Seed Action (admin only)
    if ($action === 'bulk_import') {
        requireAdmin();
        $items = $data['items'] ?? [];
        if (!is_array($items) || empty($items)) {
            jsonResponse(['error' => 'لا توجد أصناف للإدراج.'], 400);
        }

        $stmt = $pdo->prepare("
            INSERT INTO products (
                id, sort_order, category, subcategory, name, type, size, unit,
                manufacturer, price_tripoli, price_misrata, price_benghazi, available, active, image_url
            ) VALUES (
                :id, :sort_order, :category, :subcategory, :name, :type, :size, :unit,
                :manufacturer, :price_tripoli, :price_misrata, :price_benghazi, :available, :active, :image_url
            ) ON DUPLICATE KEY UPDATE
                sort_order = VALUES(sort_order),
                category = VALUES(category),
                subcategory = VALUES(subcategory),
                name = VALUES(name),
                type = VALUES(type),
                size = VALUES(size),
                unit = VALUES(unit),
                manufacturer = VALUES(manufacturer),
                price_tripoli = VALUES(price_tripoli),
                price_misrata = VALUES(price_misrata),
                price_benghazi = VALUES(price_benghazi),
                available = VALUES(available),
                active = VALUES(active),
                image_url = VALUES(image_url)
        ");

        $pdo->beginTransaction();
        $count = 0;
        foreach ($items as $idx => $item) {
            $id = trim($item['id'] ?? '');
            $name = trim($item['name'] ?? '');
            $category = trim($item['category'] ?? '');
            if (empty($id) || empty($name) || empty($category)) continue;

            $stmt->execute([
                ':id' => $id,
                ':sort_order' => $item['sortOrder'] ?? ($idx + 1),
                ':category' => $category,
                ':subcategory' => $item['subcategory'] ?? null,
                ':name' => $name,
                ':type' => $item['type'] ?? null,
                ':size' => $item['size'] ?? null,
                ':unit' => $item['unit'] ?? 'طن',
                ':manufacturer' => $item['manufacturer'] ?? null,
                ':price_tripoli' => isset($item['price_tripoli']) && $item['price_tripoli'] !== '' ? (float)$item['price_tripoli'] : ($item['price'] ?? null),
                ':price_misrata' => isset($item['price_misrata']) && $item['price_misrata'] !== '' ? (float)$item['price_misrata'] : null,
                ':price_benghazi' => isset($item['price_benghazi']) && $item['price_benghazi'] !== '' ? (float)$item['price_benghazi'] : null,
                ':available' => isset($item['available']) ? ($item['available'] ? 1 : 0) : 1,
                ':active' => isset($item['active']) ? ($item['active'] ? 1 : 0) : 1,
                ':image_url' => $item['imageUrl'] ?? null,
            ]);
            $count++;
        }
        $pdo->commit();

        jsonResponse(['status' => 'success', 'message' => "تم استيراد/تحديث {$count} منتجًا بنجاح."]);
    }

    // Single Product Creation
    $id = trim($data['id'] ?? '');
    $name = trim($data['name'] ?? '');
    $category = trim($data['category'] ?? '');

    if (empty($id) || empty($name) || empty($category)) {
        jsonResponse(['error' => 'يرجى إدخال رمز المنتج واسم المادة والتصنيف.'], 400);
    }

    // Check duplicate ID
    $checkStmt = $pdo->prepare("SELECT id FROM products WHERE id = ?");
    $checkStmt->execute([$id]);
    if ($checkStmt->fetch()) {
        jsonResponse(['error' => "رمز المنتج '{$id}' مستخدم بالفعل."], 400);
    }

    // Default sort order to max + 1
    $maxSortStmt = $pdo->query("SELECT MAX(sort_order) FROM products");
    $nextSort = (int)$maxSortStmt->fetchColumn() + 1;

    $stmt = $pdo->prepare("
        INSERT INTO products (
            id, sort_order, category, subcategory, name, type, size, unit,
            manufacturer, price_tripoli, price_misrata, price_benghazi, available, active, image_url
        ) VALUES (
            ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?
        )
    ");

    $stmt->execute([
        $id,
        $data['sortOrder'] ?? $nextSort,
        $category,
        $data['subcategory'] ?? null,
        $name,
        $data['type'] ?? null,
        $data['size'] ?? null,
        $data['unit'] ?? 'طن',
        $data['manufacturer'] ?? null,
        isset($data['price_tripoli']) && $data['price_tripoli'] !== '' ? (float)$data['price_tripoli'] : null,
        isset($data['price_misrata']) && $data['price_misrata'] !== '' ? (float)$data['price_misrata'] : null,
        isset($data['price_benghazi']) && $data['price_benghazi'] !== '' ? (float)$data['price_benghazi'] : null,
        isset($data['available']) ? ($data['available'] ? 1 : 0) : 1,
        isset($data['active']) ? ($data['active'] ? 1 : 0) : 1,
        $data['imageUrl'] ?? null,
    ]);

    jsonResponse(['status' => 'success', 'message' => 'تمت إضافة المنتج بنجاح.']);
}

// -------------------------------------------------------------
// 3. PUT: Update Product / Prices (Protected)
// -------------------------------------------------------------
if ($method === 'PUT') {
    $user = requireAuth();

    $rawInput = file_get_contents('php://input');
    $data = json_decode($rawInput, true);

    $id = trim($data['id'] ?? '');
    if (empty($id)) {
        jsonResponse(['error' => 'رمز المنتج مفقود.'], 400);
    }

    // Fetch existing product
    $existStmt = $pdo->prepare("SELECT * FROM products WHERE id = ?");
    $existStmt->execute([$id]);
    $existing = $existStmt->fetch();
    if (!$existing) {
        jsonResponse(['error' => 'المنتج غير موجود.'], 404);
    }

    // Log price changes if applicable
    $newPriceTripoli = isset($data['price_tripoli']) && $data['price_tripoli'] !== '' ? (float)$data['price_tripoli'] : null;
    if ($newPriceTripoli !== null && (float)$existing['price_tripoli'] !== $newPriceTripoli) {
        $logStmt = $pdo->prepare("INSERT INTO price_logs (product_id, city, old_price, new_price, updated_by) VALUES (?, 'طرابلس', ?, ?, ?)");
        $logStmt->execute([$id, $existing['price_tripoli'], $newPriceTripoli, $user['username']]);
    }

    $stmt = $pdo->prepare("
        UPDATE products SET
            name = :name,
            category = :category,
            subcategory = :subcategory,
            type = :type,
            size = :size,
            unit = :unit,
            manufacturer = :manufacturer,
            price_tripoli = :price_tripoli,
            price_misrata = :price_misrata,
            price_benghazi = :price_benghazi,
            available = :available,
            active = :active,
            image_url = :image_url,
            sort_order = :sort_order
        WHERE id = :id
    ");

    $stmt->execute([
        ':id' => $id,
        ':name' => trim($data['name'] ?? $existing['name']),
        ':category' => trim($data['category'] ?? $existing['category']),
        ':subcategory' => $data['subcategory'] ?? $existing['subcategory'],
        ':type' => $data['type'] ?? $existing['type'],
        ':size' => $data['size'] ?? $existing['size'],
        ':unit' => $data['unit'] ?? $existing['unit'],
        ':manufacturer' => $data['manufacturer'] ?? $existing['manufacturer'],
        ':price_tripoli' => $newPriceTripoli,
        ':price_misrata' => isset($data['price_misrata']) && $data['price_misrata'] !== '' ? (float)$data['price_misrata'] : ($existing['price_misrata'] ?? null),
        ':price_benghazi' => isset($data['price_benghazi']) && $data['price_benghazi'] !== '' ? (float)$data['price_benghazi'] : ($existing['price_benghazi'] ?? null),
        ':available' => isset($data['available']) ? ($data['available'] ? 1 : 0) : (int)$existing['available'],
        ':active' => isset($data['active']) ? ($data['active'] ? 1 : 0) : (int)$existing['active'],
        ':image_url' => $data['imageUrl'] ?? $existing['image_url'],
        ':sort_order' => isset($data['sortOrder']) ? (int)$data['sortOrder'] : (int)$existing['sort_order'],
    ]);

    jsonResponse(['status' => 'success', 'message' => 'تم تحديث بيانات المنتج بنجاح.']);
}

// -------------------------------------------------------------
// 4. DELETE: Delete Product (Admin Only)
// -------------------------------------------------------------
if ($method === 'DELETE') {
    requireAdmin();

    $id = trim($_GET['id'] ?? '');
    if (empty($id)) {
        jsonResponse(['error' => 'رمز المنتج مفقود.'], 400);
    }

    $stmt = $pdo->prepare("DELETE FROM products WHERE id = ?");
    $stmt->execute([$id]);

    jsonResponse(['status' => 'success', 'message' => "تم حذف المنتج {$id} بنجاح."]);
}

jsonResponse(['error' => 'طريقة الطلب غير مدعومة.'], 405);
