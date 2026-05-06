<?php
/**
 * Livingroom507MOC - Admin Access Verification
 */
require_once 'auth_check.php';

// Verify that the user role stored in the session is 'Admin'
if (!isset($_SESSION["role"]) || $_SESSION["role"] !== 'Admin') {
    // If not an admin, redirect back to the portal with an unauthorized flag
    header("location: portal.php?error=unauthorized");
    exit;
}
?>