<?php
/**
 * User & Permissions Management API Endpoint
 * Admin Only Access
 */

require_once __DIR__ . '/config.php';

$admin = requireAdmin();
$pdo = getDbConnection();
$method = $_SERVER['REQUEST_METHOD'];

if (!$pdo) {
    jsonResponse(['error' => 'قاعدة البيانات غير متصلة.'], 500);
}

// 1. GET: List all users
if ($method === 'GET') {
    $stmt = $pdo->query("SELECT id, username, full_name, role, created_at FROM users ORDER BY id ASC");
    $users = $stmt->fetchAll();
    jsonResponse(['users' => $users]);
}

// 2. POST: Create new user
if ($method === 'POST') {
    $rawInput = file_get_contents('php://input');
    $data = json_decode($rawInput, true);

    $username = trim($data['username'] ?? '');
    $password = trim($data['password'] ?? '');
    $fullName = trim($data['fullName'] ?? '');
    $role = in_array($data['role'] ?? '', ['admin', 'editor']) ? $data['role'] : 'editor';

    if (empty($username) || empty($password) || empty($fullName)) {
        jsonResponse(['error' => 'يرجى إدخال اسم المستخدم وكلمة المرور والاسم الكامل.'], 400);
    }

    if (strlen($password) < 6) {
        jsonResponse(['error' => 'كلمة المرور يجب أن لا تقل عن 6 خانات.'], 400);
    }

    // Check duplicate
    $check = $pdo->prepare("SELECT id FROM users WHERE username = ?");
    $check->execute([$username]);
    if ($check->fetch()) {
        jsonResponse(['error' => "اسم المستخدم '{$username}' مستخدم بالفعل."], 400);
    }

    $hash = password_hash($password, PASSWORD_DEFAULT);
    $stmt = $pdo->prepare("INSERT INTO users (username, password_hash, full_name, role) VALUES (?, ?, ?, ?)");
    $stmt->execute([$username, $hash, $fullName, $role]);

    jsonResponse(['status' => 'success', 'message' => 'تم إنشاء المستخدم بنجاح.']);
}

// 3. PUT: Update user (Password / Name / Role)
if ($method === 'PUT') {
    $rawInput = file_get_contents('php://input');
    $data = json_decode($rawInput, true);

    $id = (int)($data['id'] ?? 0);
    if ($id <= 0) {
        jsonResponse(['error' => 'معرف المستخدم غير صالح.'], 400);
    }

    $fullName = trim($data['fullName'] ?? '');
    $role = in_array($data['role'] ?? '', ['admin', 'editor']) ? $data['role'] : 'editor';
    $password = trim($data['password'] ?? '');

    // Check user exists
    $stmt = $pdo->prepare("SELECT id, username FROM users WHERE id = ?");
    $stmt->execute([$id]);
    $user = $stmt->fetch();
    if (!$user) {
        jsonResponse(['error' => 'المستخدم غير موجود.'], 404);
    }

    if (!empty($password)) {
        if (strlen($password) < 6) {
            jsonResponse(['error' => 'كلمة المرور يجب أن لا تقل عن 6 خانات.'], 400);
        }
        $hash = password_hash($password, PASSWORD_DEFAULT);
        $updateStmt = $pdo->prepare("UPDATE users SET full_name = ?, role = ?, password_hash = ? WHERE id = ?");
        $updateStmt->execute([$fullName ?: $user['username'], $role, $hash, $id]);
    } else {
        $updateStmt = $pdo->prepare("UPDATE users SET full_name = ?, role = ? WHERE id = ?");
        $updateStmt->execute([$fullName ?: $user['username'], $role, $id]);
    }

    jsonResponse(['status' => 'success', 'message' => 'تم تحديث بيانات المستخدم بنجاح.']);
}

// 4. DELETE: Delete user
if ($method === 'DELETE') {
    $id = (int)($_GET['id'] ?? 0);
    if ($id <= 0) {
        jsonResponse(['error' => 'معرف المستخدم غير صالح.'], 400);
    }

    // Protect against self-deletion
    if ($id === (int)$admin['id']) {
        jsonResponse(['error' => 'لا يمكنك حذف حسابك الشخصي الحالي.'], 400);
    }

    $stmt = $pdo->prepare("DELETE FROM users WHERE id = ?");
    $stmt->execute([$id]);

    jsonResponse(['status' => 'success', 'message' => 'تم حذف المستخدم بنجاح.']);
}

jsonResponse(['error' => 'طريقة الطلب غير مدعومة.'], 405);
