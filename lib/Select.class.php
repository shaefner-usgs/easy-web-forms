<?php

/**
 * Create HTML <select>
 *
 * @param $params {Array}
 *     html select attributes; supported properties are:
 *
 *       disabled {Boolean}
 *       id {String}
 *       name {String} - REQUIRED
 *       options {Array} - REQUIRED
 *       required {Boolean}
 *
 *     other supported properties:
 *
 *       class {String}
 *       label {String}
 */
class Select {
  private $_data = array(),
          $_defaults = array(
            'class' => '',
            'disabled' => '',
            'id' => '',
            'label' => '',
            'name' => '',
            'options' => '',
            'required' => '',
            'type' => 'select'
          );

  public function __construct ($params=NULL) {
    // Set default values
    foreach ($this->_defaults as $key => $value) {
      $this->__set($key, $value);
    }

    // Set instantiated values
    if (is_array($params)) {
      foreach ($params as $key => $value) {
        $this->__set($key, $value);
      }
    }

    // Check for missing req'd params
    if (!$this->_data['name']) {
      print '<p class="error">ERROR: the <em>name</em> attribute is <strong>required</strong> for all select elements</p>';
    }

    if (!$this->_data['options'] || !is_array($this->_data['options'])) {
      print '<p class="error">ERROR: <em>options</em> (array) is <strong>required</strong> for all select elements</p>';
    }
  }

  public function __get ($key) {
    if (isset($this->_data[$key])) {
      return $this->_data[$key];
    }
  }

  public function __set ($key, $value) {
    $this->_data[$key] = $value;
  }

  /**
   * Get HTML for element
   *
   * @param $tabindex {Integer}
   *
   * @return $html {String}
   */
  public function getHtml ($tabindex=NULL) {
    $attrs = '';

    if ($this->_data['disabled']) {
      $attrs .= ' disabled="disabled"';
    }
    if ($this->_data['required']) {
      $attrs .= ' required="required"';
    }
    if ($tabindex) {
      $attrs .= sprintf(' tabindex="%d"', $tabindex);
    }

    if ($this->_data['id']) {
      $id = $this->_data['id'];
    } else {
      $id = $this->_data['name'];
    }

    if ($this->_data['label']) {
      $labelText = $this->_data['label'];
    } else {
      $labelText = $this->_data['name'];
    }

    $options = '';
    foreach ($this->_data['options'] as $key => $option) {
      $options .= sprintf('<option value="%s">%s</option>',
        $key,
        $option
      );
    }

    $select = sprintf('<select id="%s" name="%s"%s>%s</select>',
      $id,
      $this->_data['name'],
      $attrs,
      $options
    );

    $label = sprintf('<label for="%s">%s</label>',
      $id,
      $labelText
    );

    // Add relevant css classes
    $cssClasses = array('field', $this->_data['type']);
    if ($this->_data['class']) {
      array_push($cssClasses, $this->_data['class']);
    }

    $html = sprintf('<div class="%s">%s%s</div>',
      implode(' ', $cssClasses),
      $select,
      $label
    );

    return $html;
  }

  /**
   * Get form field's value submitted by user
   *
   * @return {String}
   */
  public function getValue () {
    return safeParam($this->_data['name']);
  }
}
