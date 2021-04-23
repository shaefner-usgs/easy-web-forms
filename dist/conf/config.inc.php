<?php

// Timezone
date_default_timezone_set('America/Los_Angeles');

// Database table for form submission results; you can also provide the table during Form instantiation
$dbTable = 'orders';

// MapQuest key for PlaceSearch.js address field autocomplete (required for address type <input>s)
$mapQuestApiKey = 'Fmjtd|luur2h0bn1,2g=o5-9wbnhy';

// Option 1: Inline database connector

$host = 'localhost';
$dbname = 'web';
$username = 'root';
$password = 'rootroot';

try {
  $db = new PDO("mysql:host=$host;dbname=$dbname;charset=utf8", $username, $password);
  $db->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
} catch(PDOException $e) {
  print '<p class="error">ERROR: ' . $e->getMessage() . '</p>';
}

// Option 2: External database connector (needs to set $db)
// include 'dbConnect.inc.php';
