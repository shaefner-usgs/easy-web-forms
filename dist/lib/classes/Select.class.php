<?php

include_once __DIR__ . '/../dep/Autop.php';

/**
 * Create a <select>.
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
 *       class {String} - CSS class attached to parent <div>
 *       description {String} - text displayed below a form control
 *       explanation {String} - text displayed above a form control
 *       label {String} - <label> element for control
 *       message {String} - text displayed when a form control is invalid
 *       options {Array} - REQUIRED
 *       selected {String} - option selected by default
 */
class Select {
  private $_defaults = [
    'class' => '',
    'description' => '',
    'disabled' => false,
    'explanation' => '',
    'id' => '',
    'label' => '',
    'message' => 'Please select an option from the menu',
    'name' => '',
    'options' => [],
    'required' => false,
    'selected' => ''
  ];

  public $isValid = true,
    $type = 'select',
    $value;

  public function __construct (Array $params=[]) {
    $options = array_merge($this->_defaults, $params);

    foreach ($options as $key => $value) {
      // Only set props that are defined in $_defaults
      if (array_key_exists($key, $this->_defaults)) {
        $this->$key = $value;
      }
    }

    $this->_checkParams();

    // Set value prop to user-supplied value when form is submitted
    if (isSet($_POST['submitbutton'])) {
      $this->value = safeParam($this->name);
    }
  }

  /**
   * Check for missing required params; set id, label params if not already set.
   */
  private function _checkParams () {
    if (!$this->name) {
      print '<p class="error">ERROR: the <em>name</em> attribute is ' .
        '<strong>required</strong> for all select elements.</p>';
    }
    if (count($this->options) < 1 || !is_array($this->options)) {
      print '<p class="error">ERROR: <em>options</em> (array) is ' .
        '<strong>required</strong> for all select elements.</p>';
    }

    // Set id and label if not set during instantiation
    if (!$this->id) {
      $this->id = $this->name;
    }
    if (!$this->label) {
      $this->label = ucfirst($this->name);
    }
  }

  /**
   * Get optional HTML attributes for control.
   *
   * @param $tabindex {Integer}
   *
   * @return $attrs {Array}
   */
  private function _getAttrs ($tabindex) {
    $attrs = [];

    if ($tabindex) {
      $attrs[] = sprintf('tabindex="%d"', $tabindex);
    }
    if ($this->disabled) {
      $attrs[] = 'disabled="disabled"';
    }
    if ($this->required) {
      $attrs[] = 'required="required"';
    }

    return $attrs;
  }

  /**
   * Get relevant CSS classes for control's parent <div>.
   *
   * @return $cssClasses {Array}
   */
  private function _getCssClasses () {
    $cssClasses = ['control', $this->type];

    if ($this->class) {
      $cssClasses[] = $this->class;
    }
    if (!$this->isValid) {
      $cssClasses[] = 'invalid';
    }

    return $cssClasses;
  }

  /**
   * Get the HTML for a menu option.
   *
   * @param key {String}
   * @param value {String}
   *
   * @return {String}
   */
  private function _getOption ($key, $value) {
    $attrs = [];

    // Set additional options for 'placeholder' option
    if ($this->required && !$key) { // default 'empty' option
      array_push($attrs, 'disabled="disabled"', 'hidden="hidden"');
    }

    // Set selected option if applicable
    if (isSet($_POST[$this->name])) { // user-selected option
      if ($key === $this->value) {
        $attrs[] = 'selected="selected"';
      }
    } else if ($key === $this->selected) { // default selected option
      $attrs[] = 'selected="selected"';
    }

    return sprintf('<option value="%s"%s>%s</option>',
      $key,
      implode(' ', $attrs),
      $value
    );
  }

  /**
   * Get the HTML for the menu's options.
   *
   * @return $options {String}
   */
  private function _getOptions () {
    $options = '';

    foreach ($this->options as $key => $value) {
      if (is_array($value)) { // nested group
        $options .= sprintf('<optgroup label="%s">', $key);

        foreach ($value as $key2 => $value2) {
          $options .= $this->_getOption($key2, $value2);
        }

        $options .= '</optgroup>';
      } else {
        $options .= $this->_getOption($key, $value);
      }
    }

    return $options;
  }

  /**
   * Get HTML for element.
   *
   * @param $tabindex {Integer} default is NULL
   *
   * @return $html {String}
   */
  public function getHtml ($tabindex=NULL) {
    $attrs = $this->_getAttrs($tabindex);
    $cssClasses = $this->_getCssClasses();
    $description = sprintf('<p class="description" data-message="%s">%s</p>',
      $this->message,
      $this->description
    );
    $explanation = '';
    $label = sprintf('<label for="%s">%s</label>',
      $this->id,
      $this->label
    );
    $options = $this->_getOptions();

    if ($this->explanation) {
      $explanation = \Xmeltrut\Autop\Autop::format($this->explanation);
      $explanation = str_replace('<p>', '<p class="explanation">', $explanation);
    }

    $select = sprintf('<select id="%s" name="%s"%s>%s</select>',
      $this->id,
      $this->name,
      implode(' ', $attrs),
      $options
    );

    $html = sprintf('<div class="%s">%s%s%s%s</div>',
      implode(' ', $cssClasses),
      $description,
      $select,
      $explanation,
      $label
    );

    return $html;
  }
}
