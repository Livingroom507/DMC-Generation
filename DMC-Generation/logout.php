<?php
session_start();

if (isset($_COOKIE['rm_user'])) {
    require_once 'db_connect.php';

    // Extract the selector to identify the specific token in the database
    $parts = explode(':', $_COOKIE['rm_user']);
    if (count($parts) === 2) {
        $selector = $parts[0];
        $stmt = $conn->prepare("DELETE FROM user_tokens WHERE selector = ?");
        $stmt->bind_param("s", $selector);
        $stmt->execute();
        $stmt->close();
    }

    // Clear the cookie from the browser by setting an expiration date in the past
    // Ensure attributes (path, secure, httponly) match how the cookie was created
    setcookie("rm_user", "", time() - 3600, "/", "", true, true);
}

$_SESSION = array();
session_destroy();
header("location: login.php");
exit;
?>