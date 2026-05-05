<?php
$host = "localhost";
$db_user = "your_db_username";
$db_pass = "your_db_password";
$db_name = "livingroom507_db";

$conn = new mysqli($host, $db_user, $db_pass, $db_name);

if ($conn->connect_error) {
    error_log("Connection failed: " . $conn->connect_error);
    die("A connection error occurred. Please try again later.");
}
?>