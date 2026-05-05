<?php
/**
 * Livingroom507MOC - Authentication Helper
 */
session_start();

if (!isset($_SESSION["loggedin"]) || $_SESSION["loggedin"] !== true) {
    // Check for Remember Me cookie
    if (isset($_COOKIE['rm_user'])) {
        require_once 'db_connect.php';
        
        $parts = explode(':', $_COOKIE['rm_user']);
        if (count($parts) === 2) {
            list($selector, $validator) = $parts;
            
            $sql = "SELECT t.token_hash, t.user_id, u.username, u.role, u.region 
                    FROM user_tokens t 
                    JOIN users u ON t.user_id = u.id 
                    WHERE t.selector = ? AND t.expires > NOW() LIMIT 1";

            if ($stmt = $conn->prepare($sql)) {
                $stmt->bind_param("s", $selector);
            $stmt->execute();
            $result = $stmt->get_result();
            
                if ($row = $result->fetch_assoc()) {
                    if (hash_equals($row['token_hash'], hash('sha256', $validator))) {
                $_SESSION['loggedin'] = true;
                        $_SESSION['id'] = $row['user_id'];
                        $_SESSION['username'] = $row['username'];
                        $_SESSION['role'] = $row['role'];
                        $_SESSION['region'] = $row['region'];
                    }
                }
            } else {
                header("location: login.php");
                exit;
            }
            $stmt->close();
        }
    } else {
        header("location: login.php");
        exit;
    }
}
?>