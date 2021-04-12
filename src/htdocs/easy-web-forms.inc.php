<?php

header('Content-Type: text/html; charset=utf-8');
header("Cache-Control: no-store, no-cache, must-revalidate, max-age=0");
header("Cache-Control: post-check=0, pre-check=0", false);
header("Pragma: no-cache");

// Config
include_once __DIR__ . '/../conf/config.inc.php';

// Classes
include_once __DIR__ . '/lib/Database.class.php';
include_once __DIR__ . '/lib/Form.class.php';
include_once __DIR__ . '/lib/Input.class.php';
include_once __DIR__ . '/lib/Select.class.php';
include_once __DIR__ . '/lib/Textarea.class.php';

// Functions
include_once __DIR__ . '/lib/functions.inc.php';
