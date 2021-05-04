<?php

/**
 * PHP Sanitize filter settings by type
 *
 * @return {Array}
 */
function getFilters () {
  return [
    'email' => [
      'filter' => FILTER_SANITIZE_EMAIL
    ],
    'int' => [
      'filter' => FILTER_VALIDATE_INT
    ],
    'number' => [
      'filter' => FILTER_VALIDATE_FLOAT,
      'flags' => FILTER_FLAG_ALLOW_THOUSAND
    ],
    'raw' => [
      'filter' => FILTER_UNSAFE_RAW,
      'flags' => FILTER_FLAG_STRIP_BACKTICK
    ],
    'striptags' => [
      'filter' => FILTER_SANITIZE_STRING,
      'flags' => FILTER_FLAG_STRIP_BACKTICK
    ],
    'url' => [
      'filter' => FILTER_SANITIZE_URL
    ]
  ];
}

/**
 * Get a request parameter value from $_GET or $_POST results.
 *
 *   NOTE: flattens selected checkbox values into a comma-separated list
 *
 * @param $name {String}
 *     The parameter name
 * @param $type {String} default is 'raw'
 *     Optional type of sanitizing filter to apply
 * @param $default {?} default is NULL
 *     Optional default value if the given parameter value does not exist
 *
 * @return $value {String}
 */
function safeParam ($name, $type='raw', $default=NULL) {
  $filters = getFilters();
  $options = $filters[$type];
  $filter = $options['filter'];
  $value = NULL;

  if (!array_key_exists($type, $filters)) {
    $type = 'raw';
  }

  if (isSet($_POST[$name]) && $_POST[$name] !== '') {
    if (is_array($_POST[$name])) { // handle checkboxes
      $value = filter_var(implode(', ', $_POST[$name]), $filter, $options);
    } else {
      $value = filter_input(INPUT_POST, $name, $filter, $options);
    }
  } else if (isSet($_GET[$name]) && $_GET[$name] !== '') {
    $value = filter_input(INPUT_GET, $name, $filter, $options);
  } else {
    $value = $default;
  }

  // Always strip non-allowed HTML tags (regardless of filter type)
  $value = strip_tags($value, '<a><br><dd><dl><dt><li><ol><p><sub><sup><table><td><th><tr><ul>');

  return $value;
}

/**
 * Recursive (deep) array merge
 *   similar to PHP's array_merge (and unlike array_merge_recursive),
 *   matching keys' values in the second array overwrite those in the first array
 *
 * Parameters are passed by reference, though only for performance reasons.
 * They're not altered by this function.
 *
 * From: https://gist.github.com/josephj/5028375
 *
 * @param $array1 {Array}
 * @param $array2 {Array}
 *
 * @return $merged {Array}
 */
function array_merge_recursive_distinct(array &$array1, array &$array2) {
  $merged = $array1;

  foreach ($array2 as $key => &$value) {
    if (is_array($value) && isset($merged[$key]) && is_array($merged[$key])) {
      $merged[$key] = array_merge_recursive_distinct($merged[$key], $value);
    } else {
      $merged[$key] = $value;
    }
  }

  return $merged;
}
