<?php

/**
 * Create HTML <input>
 *
 * @param $params {Array}
 *     html input attributes; supported properties are:
 *
 *       checked {Boolean}
 *       disabled {Boolean}
 *       id {String} - REQUIRED for all radio/checkbox inputs
 *       max {Integer}
 *       maxLength {Integer}
 *       min {Integer}
 *       name {String} - REQUIRED for all inputs; for radio/checkbox inputs, use the same 'name' for all inputs in group
 *       pattern {RegExp}
 *       placeholder {String}
 *       required {Boolean}
 *       type {String} default is 'text'
 *       value {String} - REQUIRED for all radio/checkbox inputs
 *
 *     other properties:
 *
 *       class {String}
 *       isValid {Boolean}
 *       label {String}
 */
class Input {
  private $_data = array(),
          $_defaults = array(
            'checked' => false,
            'class' => '',
            'disabled' => false,
            'id' => '',
            'isValid' => true,
            'label' => '',
            'max' => '',
            'maxLength' => '',
            'min' => '',
            'name' => '',
            'pattern' => '',
            'placeholder' => '',
            'required' => false,
            'type' => 'text',
            'value' => ''
          ),
          $_isCheckboxOrRadio;

  public function __construct ($params=NULL) {
    // Set default values
    foreach ($this->_defaults as $key => $value) {
      $this->__set($key, $value);
    }

    // Set instantiated values
    if (is_array($params)) {
      foreach ($params as $key => $value) {
        // Strip off '[]' from name values; added programmatically to checkbox inputs
        if ($key === 'name' && preg_match('/\[\]$/', $value)) {
          $value = preg_replace('/(\w+)\[\]$/', '$1', $value);
        }
        $this->__set($key, $value);
      }
    }

    // Flag to test whether input is a radio/checkbox
    $this->_isCheckboxOrRadio = false;
    if ($this->_data['type'] === 'radio' || $this->_data['type'] === 'checkbox') {
      $this->_isCheckboxOrRadio = true;
    }

    // Check for missing req'd params
    if (!$this->_data['name']) {
      print '<p class="error">ERROR: the <em>name</em> attribute is <strong>required</strong> for all input elements</p>';
    }
    if ($this->_isCheckboxOrRadio) {
      if (!$this->_data['id']) {
        printf ('<p class="error">ERROR: the <em>id</em> attribute is <strong>required</strong> for all radio/checkbox inputs (%s)</p>',
          $this->_data['name']
        );
      }
      if (!$this->_data['value']) {
        printf ('<p class="error">ERROR: the <em>value</em> attribute is <strong>required</strong> for all radio/checkbox inputs (%s)</p>',
          $this->_data['name']
        );
      }
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
   * Assess if radio / checkbox should be checked
   *
   * @return $checked {Boolean}
   */
  private function _isChecked () {
    $checked = false;
    $instantiatedValue = $this->_data['value'];

    if (isSet($_POST['submit'])) {
      $submittedValue = $this->getValue(); // value(s) submitted by user
      if ($this->_data['type'] === 'checkbox') {
        $submittedValues = preg_split('/,\s*/', $submittedValue);
        foreach ($submittedValues as $thisValue) {
          if ($thisValue === $instantiatedValue) {
            $checked = true;
          }
        }
      } else if ($submittedValue === $instantiatedValue) { // radio
        $checked = true;
      }
    } else if ($this->_data['checked']) { // set to initial state
      $checked = true;
    }

    return $checked;
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
    $value = $this->getValue(); // use instantiated or user-entered value depending on form state

    if ($this->_data['disabled']) {
      $attrs .= ' disabled="disabled"';
    }
    if ($this->_data['pattern']) {
      $attrs .= sprintf(' pattern="%s"', $this->_data['pattern']);
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

    if ($this->_data['type'] === 'number') {
      $attrs .= sprintf(' max="%s" min="%s"',
        $this->_data['max'],
        $this->_data['min']
      );
    }
    if ($this->_data['type'] === 'text') {
      $attrs .= sprintf(' maxLength="%s"', $this->_data['maxLength']);
    }

    if ($this->_isCheckboxOrRadio) {
      $value = $this->_data['value']; // must explicitly use instantiated value
      if ($this->_isChecked()) {
        $attrs .= ' checked="checked"';
      }
    }

    if ($this->_data['id']) {
      $id = $this->_data['id'];
    } else {
      $id = $this->_data['name'];
    }

    if ($this->_data['label']) {
      $labelText = $this->_data['label'];
    } else {
      if ($this->_isCheckboxOrRadio) {
        $labelText = $this->_data['value'];
      } else {
        $labelText = $this->_data['name'];
      }
    }

    $name = $this->_data['name'];
    if ($this->_data['type'] === 'checkbox') {
      $name .= '[]'; // set name to array in HTML for checkbox values
    }

    $input = sprintf('<input id="%s" name="%s" type="%s" value="%s"%s />',
      $id,
      $name,
      $this->_data['type'],
      $value,
      $attrs
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
    if ($this->_isCheckboxOrRadio) {
      array_push($cssClasses, 'pretty', 'p-default', 'p-pulse');
      if ($this->_data['type'] === 'radio') {
        array_push($cssClasses, 'p-round');
      }

      // Wrap label in div elem for pretty checkbox library
      $label = sprintf('<div class="state p-primary-o">%s</div>', $label);
    }
    // Add 'error' class for fields that don't validate
    //   radio / checkbox controls handled in Form class ('error' attached to parent)
    if (!$this->_data['isValid'] && !$this->_isCheckboxOrRadio) {
      array_push($cssClasses, 'error');
    }

    $html = sprintf('<div class="%s">%s%s</div>',
      implode(' ', $cssClasses),
      $input,
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
