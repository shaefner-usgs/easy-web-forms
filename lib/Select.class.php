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
 *       required {Boolean}
 *
 *     other properties:
 *
 *       class {String}
 *       isValid {Boolean}
 *       label {String}
 *       options {Array} - REQUIRED
 *       selected {String}
 */
class Select {
  private $_data = array(),
          $_defaults = array(
            'class' => '',
            'disabled' => false,
            'id' => '',
            'isValid' => true,
            'label' => '',
            'name' => '',
            'options' => '',
            'required' => false,
            'type' => 'select',
            'selected' => ''
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
   * Get optional html attributes for control
   *
   * @param $tabindex {Integer}
   *
   * @return $attrs {String}
   */
  private function _getAttrs ($tabindex) {
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

    return $attrs;
  }

  /**
   * Get relevant css classes for control
   *
   * @return $cssClasses {Array}
   */
  private function _getCssClasses () {
    $cssClasses = array('control', $this->_data['type']);
    if ($this->_data['class']) {
      array_push($cssClasses, $this->_data['class']);
    }
    if (!$this->_data['isValid']) {
      array_push($cssClasses, 'error');
    }

    return $cssClasses;
  }

  /**
   * Get HTML for element
   *
   * @param $tabindex {Integer}
   *
   * @return $html {String}
   */
  public function getHtml ($tabindex=NULL) {
    $attrs = $this->_getAttrs($tabindex);
    $cssClasses = $this->_getCssClasses();

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

    $label = sprintf('<label for="%s">%s</label>',
      $id,
      $labelText
    );

    $options = '';
    foreach ($this->_data['options'] as $key => $value) {
      // Set selected option: data entered by user overrides if validation fails
      $selected = '';
      if (isSet($_POST[$this->_data['name']])) {
        if ($key === $this->getValue()) {
          $selected = 'selected="selected"';
        }
      } else if ($key === $this->_data['selected']) {
        $selected = 'selected="selected"';
      }

      $options .= sprintf('<option value="%s"%s>%s</option>',
        $key,
        $selected,
        $value
      );
    }

    $select = sprintf('<select class="custom-select" id="%s" name="%s"%s>%s</select>',
      $id,
      $this->_data['name'],
      $attrs,
      $options
    );

    $html = sprintf('<div class="%s">%s%s</div>',
      implode(' ', $cssClasses),
      $select,
      $label
    );

    return $html;
  }

  /**
   * Get form control's value submitted by user
   *
   * @return {String}
   */
  public function getValue () {
    return safeParam($this->_data['name']);
  }
}
