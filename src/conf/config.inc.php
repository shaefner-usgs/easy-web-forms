<?php

// Timezone
date_default_timezone_set('America/Los_Angeles');

// Database table for form submission results; you can also provide the table during Form instantiation
$dbTable = '';

// MapQuest key for PlaceSearch.js address field autocomplete (required for address type <input>s)
$mapQuestApiKey = '';

// Option 1: Inline database connector

$host = '';
$dbname = '';
$username = '';
$password = '';

try {
  $db = new PDO("mysql:host=$host;dbname=$dbname;charset=utf8", $username, $password);
  $db->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
} catch(PDOException $e) {
  print '<p class="error">ERROR: ' . $e->getMessage() . '</p>';
}

// Option 2: External database connector (needs to set $db)
// include 'dbConnect.inc.php';
