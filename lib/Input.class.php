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
 *       inputmode {String}
 *       max {Integer}
 *       maxLength {Integer}
 *       min {Integer}
 *       name {String} - REQUIRED for all inputs; for radio/checkbox inputs, use the same 'name' for all inputs in group
 *       pattern {RegExp}
 *       placeholder {String}
 *       readonly {Boolean}
 *       required {Boolean}
 *       type {String} default is 'text'
 *       value {String} - REQUIRED for all radio/checkbox inputs
 *
 *     other properties:
 *
 *       class {String}
 *       description {String} - explanatory text displayed next to form control
 *       label {String}
 *       message {String} - instructions displayed for invalid form control
 */
class Input {
  private $_defaults = array(
      'checked' => false,
      'class' => '',
      'description' => '',
      'disabled' => false,
      'id' => '',
      'inputmode' => '',
      'label' => '',
      'max' => '',
      'maxLength' => '',
      'message' => 'Please provide a valid {{label}}',
      'min' => '',
      'name' => '',
      'pattern' => '',
      'placeholder' => '',
      'readonly' => false,
      'required' => false,
      'type' => 'text',
      'value' => ''
    ),
    $_instantiatedValue,
    $_isCheckboxOrRadio = false,
    $_submittedValue;

  public $isValid = true;

  public function __construct (Array $params=array()) {
    if (isSet($params['type']) && $params['type'] === 'email') {
      $this->_defaults['pattern'] = '[^@]+@[^@]+\.[^@]+';
    }
    if (isSet($params['type']) && $params['type'] === 'url') {
      $this->_defaults['pattern'] = '^(https?|ftp)://[^\s/$.?#].[^\s]*$';
    }
    // Merge defaults with user-supplied params and set as class properties
    $options = array_merge($this->_defaults, $params);

    foreach ($options as $key => $value) {
      // Strip off '[]' from name values; added programmatically to checkbox inputs
      if ($key === 'name' && preg_match('/\[\]$/', $value)) {
        $value = preg_replace('/(\w+)\[\]$/', '$1', $value);
      }
      // Only set props that are defined in $_defaults
      if (array_key_exists($key, $this->_defaults)) {
        $this->$key = $value;
      }
    }
    $this->_checkParams();

    // Cache instantiated/submitted values and set value prop depending on state
    $this->_instantiatedValue = $this->value;
    if (isSet($_POST['submitbutton'])) {
      $this->_submittedValue = safeParam($this->name);
      $this->value = $this->_submittedValue; // set to user-supplied value
    }
  }

  /**
   * Check for missing required params; also set default message depending on type
   */
  private function _checkParams () {
    if (!$this->name) {
      print '<p class="error">ERROR: the <em>name</em> attribute is <strong>required</strong> for all input elements</p>';
    }
    if ($this->type === 'checkbox' || $this->type === 'radio') {
      $this->_isCheckboxOrRadio = true;
      if (!$this->id) {
        printf ('<p class="error">ERROR: the <em>id</em> attribute is <strong>required</strong> for all radio/checkbox inputs (%s)</p>',
          $this->name
        );
      }
      if (!$this->value) {
        printf ('<p class="error">ERROR: the <em>value</em> attribute is <strong>required</strong> for all radio/checkbox inputs (%s)</p>',
          $this->name
        );
      }
    }
    if ($this->type === 'checkbox' && $this->message === $this->_defaults['message']) {
      $this->message = 'Please select one or more options';
    }
    if ($this->type === 'radio' && $this->message === $this->_defaults['message']) {
      $this->message = 'Please select an option';
    }
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

    if ($this->disabled) {
      $attrs .= ' disabled="disabled"';
    }
    if ($this->inputmode) {
      $attrs .= sprintf(' inputmode="%s"', $this->inputmode);
    }
    if ($this->pattern) {
      $attrs .= sprintf(' pattern="%s"', $this->pattern);
    }
    if ($this->placeholder) {
      $attrs .= sprintf(' placeholder="%s"', $this->placeholder);
    }
    if ($this->required) {
      $attrs .= ' required="required"';
    }
    if ($this->readonly) {
      $attrs .= ' readonly="readonly"';
    }
    if ($tabindex) {
      $attrs .= sprintf(' tabindex="%d"', $tabindex);
    }

    if ($this->type === 'number') {
      $attrs .= sprintf(' max="%s" min="%s"',
        $this->max,
        $this->min
      );
    }
    if ($this->type === 'text' && $this->maxLength) {
      $attrs .= sprintf(' maxLength="%s"', $this->maxLength);
    }

    if ($this->_isCheckboxOrRadio) {
      if ($this->_isChecked()) {
        $attrs .= ' checked="checked"';
      }
    }

    return $attrs;
  }

  /**
   * Get relevant css classes for control
   *
   * @return $cssClasses {Array}
   */
  private function _getCssClasses () {
    $cssClasses = array('control', $this->type);
    if ($this->class) {
      array_push($cssClasses, $this->class);
    }
    // Add classes for pretty checkbox library
    if ($this->_isCheckboxOrRadio) {
      array_push($cssClasses, 'pretty', 'p-default', 'p-pulse');
      if ($this->type === 'radio') {
        array_push($cssClasses, 'p-round');
      }
    }
    // Invalid radio / checkbox controls handled in Form class (class attached to parent)
    if (!$this->isValid && !$this->_isCheckboxOrRadio) {
      array_push($cssClasses, 'invalid');
    }

    return $cssClasses;
  }

  /**
   * Assess if radio / checkbox should be checked
   *
   * @return $checked {Boolean}
   */
  private function _isChecked () {
    $checked = false;

    if (isSet($_POST['submitbutton'])) {
      if ($this->type === 'checkbox') {
        $submittedValues = preg_split('/,\s*/', $this->_submittedValue);
        foreach ($submittedValues as $value) {
          if ($value === $this->_instantiatedValue) {
            $checked = true;
          }
        }
      } else if ($this->type === 'radio') {
        if ($this->_submittedValue === $this->_instantiatedValue) {
          $checked = true;
        }
      }
    } else if ($this->checked) { // set to initial state
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
    $attrs = $this->_getAttrs($tabindex);
    $cssClasses = $this->_getCssClasses();

    if ($this->id) {
      $id = $this->id;
    } else {
      $id = $this->name;
    }

    if ($this->label) {
      $labelText = $this->label;
    } else {
      if ($this->_isCheckboxOrRadio) {
        $labelText = $this->value;
      } else {
        $labelText = $this->name;
      }
    }

    $label = sprintf('<label for="%s">%s</label>',
      $id,
      $labelText
    );

    $name = $this->name;
    if ($this->type === 'checkbox') {
      $name .= '[]'; // set name to type array for checkbox values
    }

    $description = '';
    $value = $this->value; // instantiated or user-supplied value depending on form state
    if ($this->_isCheckboxOrRadio) {
      // Wrap label in div elem for pretty checkbox library
      $label = sprintf('<div class="state p-primary-o">%s</div>', $label);
      $value = $this->_instantiatedValue; // always use instantiated value
    } else {
      $description = sprintf('<p class="description" data-message="%s">%s</p>',
        preg_replace('/{{label}}/', strtoupper($labelText), $this->message),
        $this->description
      );
    }

    $input = sprintf('<input id="%s" name="%s" type="%s" value="%s"%s />',
      $id,
      $name,
      $this->type,
      $value,
      $attrs
    );

    $html = sprintf('<div class="%s">%s%s%s</div>',
      implode(' ', $cssClasses),
      $description,
      $input,
      $label
    );

    return $html;
  }
}
