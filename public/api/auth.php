<?php
/**
 * Authentication API Endpoint
 * Handles login, session status (me), and logout.
 */

require_once __DIR__ . '/config.php';

$pdo = getDbConnection();
$action = $_GET['action'] ?? 'me';

if (!$pdo) {
    jsonResponse(['error' => 'قاعدة البيانات غير متصلة.'], 500);
}

// 1. Check current session status (GET /api/auth.php?action=me)
if ($action === 'me') {
    $user = getCurrentUser();
    jsonResponse(['user' => $user]);
}

// 2. Login (POST /api/auth.php?action=login)
if ($action === 'login') {
    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
        jsonResponse(['error' => 'طريقة الطلب غير صالحة.'], 405);
    }

    $rawInput = file_get_contents('php://input');
    $data = json_decode($rawInput, true);

    $username = trim($data['username'] ?? '');
    $password = trim($data['password'] ?? '');

    if (empty($username) || empty($password)) {
        jsonResponse(['error' => 'يرجى إدخال اسم المستخدم وكلمة المرور.'], 400);
    }

    $stmt = $pdo->prepare("SELECT * FROM users WHERE username = ? LIMIT 1");
    $stmt->execute([$username]);
    $user = $stmt->fetch();

    if (!$user || !password_verify($password, $user['password_hash'])) {
        jsonResponse(['error' => 'اسم المستخدم أو كلمة المرور غير صحيحة.'], 401);
    }

    // Set Session
    $_SESSION['user_id'] = $user['id'];
    $_SESSION['username'] = $user['username'];
    $_SESSION['full_name'] = $user['full_name'];
    $_SESSION['role'] = $user['role'];

    jsonResponse([
        'status' => 'success',
        'user' => [
            'id' => $user['id'],
            'username' => $user['username'],
            'fullName' => $user['full_name'],
            'role' => $user['role']
        ]
    ]);
}

// 3. Logout (POST /api/auth.php?action=logout)
if ($action === 'logout') {
    $_SESSION = [];
    if (ini_get("session.use_cookies")) {
        $params = session_get_cookie_params();
        setcookie(session_name(), '', time() - 42000,
            $params["path"], $params["domain"],
            $params["secure"], $params["httponly"]
        );
    }
    session_destroy();
    jsonResponse(['status' => 'success', 'message' => 'تم تسجيل الخروج بنجاح']);
}

jsonResponse(['error' => 'إجراء غير معروف.'], 400);
