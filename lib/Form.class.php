<?php

/**
 * Create and process html form
 *
 * TODO: Server-side validation (client-side too)
 * TODO: Allow user to set color for form buttons on instantiation (impement via .js?)
 */
class Form {
  private $_arrangements = array(), // positioning of radio/checkbox groups (horizontal or vertical)
          $_controls = array(), // form controls
          $_labels = array(), // form control labels
          $_msg, // message shown to user upon successful form submission
          $_values = array(); // form control values entered by user

  /**
   * Add a radio/checkbox group
   *
   * @param $group {Array}
   *   [
   *     arrangement {String} 'horizontal' or 'vertical'
   *     controls {Array} - Form control instances as an indexed array
   *     label {String}
   *   ]
   */
  public function addGroup ($group) {
    $controls = $group['controls'];

    // Check that all controls in group have the same 'name' attribute; set $key to that value
    $prevKey = '';
    foreach ($controls as $control) {
      $key = $control->name;
      if ($prevKey && $key !== $prevKey) {
         print '<p class="error">ERROR: the <em>name</em> attribute must be the same for all input els in a group</p>';
      }
      $prevKey = $key;
    }

    $arrangement = 'horizontal'; // default value
    if (array_key_exists('arrangement', $group)) {
      $arrangement = $group['arrangement'];
    }

    $label = $control->name; // default to control's 'name' attr, but use 'label' if available
    if (array_key_exists('label', $group)) {
      $label = $group['label'];
    }

    $this->_arrangements[$key] = $arrangement;
    $this->_controls[$key] = $controls;
    $this->_labels[$key] = $label;
  }

  /**
   * Add a single form control (input, select, textarea) instance
   *
   * @param $control {Object}
   *     Form control instance
   */
  public function addItem ($control) {
    $key = $control->name;

    $label = $control->name; // default to control's 'name' attr, but use 'label' if available
    if ($control->label) {
      $label = $control->label;
    }

    $this->_controls[$key] = $control;
    $this->_labels[$key] = $label;
  }

  /**
   * Get html for form
   *
   * @return $html {String}
   */
  public function getFormHtml () {
    $html = '<section class="form">';
    $html .= sprintf('<form action="%s" method="POST">', $_SERVER['REQUEST_URI']);

    $count = 0;
    foreach ($this->_controls as $key => $control) {
      if (is_array($control)) { // radio/checkbox group
        $controls = $control; // group of controls as array
        $html .= sprintf('<fieldset>
          <legend>%s</legend>
          <div class="group %s">',
          $this->_labels[$key],
          $this->_arrangements[$key]
        );
        foreach ($controls as $control) {
          $html .= $control->getHtml(++ $count);
        }
        $html .= '</div>
          </fieldset>';
      } else { // single control
        $html .= $control->getHtml(++ $count);
      }
    }

    $html .= '<input name="submit" type="submit" class="btn btn-primary" value="Submit" />';
    $html .= '</form>';
    $html .= '</section>';

    return $html;
  }

  /**
   * Get html for results summary (values entered by user)
   *
   * @return $html {String}
   */
  public function getResultsHtml () {
    $html = '<section class="results">';

    if ($this->_msg) {
      $html .= '<p class="success">' . $this->_msg . '</p>';
    }

    $html .= '<dl>';
    foreach ($this->_values as $key => $value) {
      $html .= '<dt>' . ucfirst($this->_labels[$key]) . '</dt>';
      $html .= '<dd>' . htmlentities(stripslashes($value)) . '</dd>';
    }
    $html .= '</dl>';
    $html .= '</section>';

    return $html;
  }

  /**
   * Create an array containing form control values entered by user, then insert into database
   *
   * @param $Database {Object}
   *    Database instance
   * @param $table {String}
   *    Table name
   */
  public function process ($Database, $table) {
    foreach ($this->_controls as $key => $control) {
      if (is_array($control)) { // radio/checkbox group, get value from first control
        $value = $control[0]->getValue();
      } else {
        $value = $control->getValue();
      }
      $this->_values[$key] = $value;
    }

    $Database->insertRecord($this->_values, $table);
  }

  /**
   * Set message shown to user upon successful form submission
   *
   * @param $msg {String}
   */
  public function setSuccessMsg ($msg) {
    $this->_msg = $msg;
  }
}
