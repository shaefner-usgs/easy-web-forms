<?php

// Timezone
date_default_timezone_set('America/Los_Angeles');

// Database table for form submission results
$dbTable = 'test';

// Option 1: Inline database connector

/*
$host = '';
$dbName = '';
$username = '';
$password = '';

try {
  $db = new PDO("mysql:host=$host;dbName=$dbName;charset=utf8", $username, $password);
  $db->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
} catch(PDOException $e) {
  echo 'ERROR: ' . $e->getMessage();
}
*/

// Option 2: External database connector (sets $db)
include_once $_SERVER['DOCUMENT_ROOT'] . '/conf/dbConnect.inc.php';

?>
