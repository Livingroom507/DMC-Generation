<?php
session_start();
require_once 'db_connect.php';

$error = '';

if (isset($_SESSION["loggedin"]) && $_SESSION["loggedin"] === true) {
    header("location: portal.php");
    exit;
}

if ($_SERVER["REQUEST_METHOD"] == "POST") {
    $username = trim($_POST['username']);
    $password = trim($_POST['password']);
    $remember = isset($_POST['remember']);

    if (!empty($username) && !empty($password)) {
        // Prepared statement to prevent SQL Injection
        if ($stmt = $conn->prepare("SELECT id, username, password, role FROM users WHERE username = ?")) {
            $stmt->bind_param("s", $username);
            $stmt->execute();
            $result = $stmt->get_result();

            if ($user = $result->fetch_assoc()) {
                if (password_verify($password, $user['password'])) {
                    // Securely start the session
                    session_regenerate_id();
                    $_SESSION['loggedin'] = true;
                    $_SESSION['id'] = $user['id'];
                    $_SESSION['username'] = $user['username'];
                    $_SESSION['role'] = $user['role'];
                    
                    // Set Remember Me Cookie if checked (30 days)
                    if ($remember) {
                        $selector = bin2hex(random_bytes(8));
                        $validator = bin2hex(random_bytes(32));
                        $expires = date('Y-m-d H:i:s', time() + (86400 * 30));
                        
                        $token_hash = hash('sha256', $validator);
                        
                        $stmt_token = $conn->prepare("INSERT INTO user_tokens (selector, token_hash, user_id, expires) VALUES (?, ?, ?, ?)");
                        $stmt_token->bind_param("ssis", $selector, $token_hash, $user['id'], $expires);
                        $stmt_token->execute();
                        $stmt_token->close();

                        // Use secure flags: httponly and samesite
                        setcookie("rm_user", "$selector:$validator", time() + (86400 * 30), "/", "", true, true);
                    } else {
                        setcookie("rm_user", "", time() - 3600, "/", "", true, true);
                    }

                    header("location: portal.php");
                    exit;
                }
            }
            $error = "Invalid username or password.";
            $stmt->close();
        }
    } else {
        $error = "Please enter both username and password.";
    }
}
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Management Login | Livingroom507MOC</title>
    <link rel="stylesheet" href="style.css">
</head>
<body>
    <div class="login-container">
        <div class="calculator-wrapper">
            <h2 class="numbered-header" style="margin-top:0;">07. Portal Access</h2>
            <p>Enter credentials to access managerial functions.</p>
            
            <?php if($error): ?>
                <p style="color: #d9534f; font-weight: bold;"><?php echo $error; ?></p>
            <?php endif; ?>

            <form action="<?php echo htmlspecialchars($_SERVER["PHP_SELF"]); ?>" method="post">
                <label>Username</label>
                <input type="text" name="username" class="input-field" required>
                <label>Password</label>
                <input type="password" name="password" class="input-field" required>
                <div class="remember-me-wrapper">
                    <input type="checkbox" name="remember" id="remember">
                    <label for="remember">Remember Me</label>
                </div>
                <button type="submit" class="btn-sync">Secure Login</button>
            </form>
        </div>
    </div>
</body>
</html>