<?php

/**
 * Create HTML <textarea>
 *
 * @param $params {Array}
 *     html textarea attributes; supported properties are:
 *
 *       cols {Integer}
 *       disabled {Boolean}
 *       id {String}
 *       maxLength {Integer}
 *       name {String} - REQUIRED
 *       placeholder {String}
 *       required {Boolean}
 *       rows {Integer}
 *
 *     other properties:
 *
 *       class {String}
 *       isValid {Boolean}
 *       label {String}
 *       value {String}
 */
class Textarea {
  private $_data = array(),
          $_defaults = array(
            'class' => '',
            'cols' => 60,
            'disabled' => false,
            'id' => '',
            'isValid' => true,
            'label' => '',
            'maxLength' => '',
            'name' => '',
            'placeholder' => '',
            'required' => false,
            'rows' => 4,
            'type' => 'textarea',
            'value' => ''
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
      print '<p class="error">ERROR: the <em>name</em> attribute is <strong>required</strong> for all textarea elements</p>';
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
    $value = $this->getValue();

    if ($this->_data['disabled']) {
      $attrs .= ' disabled="disabled"';
    }
    if ($this->_data['placeholder']) {
      $attrs .= sprintf(' placeholder="%s"', $this->_data['placeholder']);
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

    $textarea = sprintf('<textarea id="%s" name="%s" cols="%s" maxLength="%s" rows="%s"%s>%s</textarea>',
      $id,
      $this->_data['name'],
      $this->_data['cols'],
      $this->_data['maxLength'],
      $this->_data['rows'],
      $attrs,
      $value
    );

    $label = sprintf('<label for="%s">%s</label>',
      $id,
      $labelText
    );

    // Add relevant css classes
    $cssClasses = array('control', $this->_data['type']);
    if ($this->_data['class']) {
      array_push($cssClasses, $this->_data['class']);
    }
    if (!$this->_data['isValid']) {
      array_push($cssClasses, 'error');
    }

    $html = sprintf('<div class="%s">%s%s</div>',
      implode(' ', $cssClasses),
      $textarea,
      $label
    );

    return $html;
  }

  /**
   * Get form control's value
   *
   * @return {String}
   */
  public function getValue () {
    if (isSet($_POST['submit'])) {
      $value = safeParam($this->_data['name']); // value submitted by user
    } else {
      $value = $this->_data['value']; // instantiated value
    }

    return $value;
  }
}
