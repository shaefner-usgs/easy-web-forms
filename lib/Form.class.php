<?php

/**
 * Create and process html form
 *
 * TODO: Server-side validation (client-side too)
 * TODO: Allow user to set color for form buttons on instantiation (impement via .js?)
 */
class Form {
  private $_items = array(),
          $_labels = array(),
          $_layouts = array(),
          $_msg,
          $_values = array();

  /**
   * Add a radio/checkbox group
   *
   * @param $group {Array}
   *   [
   *     fields {Array} - Form field instances as an indexed array
   *     label {String}
   *   ]
   */
  public function addGroup ($group) {
    $alignment = 'horizontal'; // default value
    $fields = $group['fields'];

    // Check that all fields in group have the same 'name' attribute; set $key to that value
    $prevKey = '';
    foreach ($fields as $field) {
      $key = $field->name;
      if ($key !== $prevKey && $prevKey !== '') {
         print '<p class="error">ERROR: the <em>name</em> attribute must be the same for all inputs in a group</p>';
      }
      $prevKey = $key;
    }
    $label = $key; // default to name attr.

    if (array_key_exists('alignment', $group)) {
      $alignment = $group['alignment'];
    }
    if (array_key_exists('label', $group)) {
      $label = $group['label'];
    }

    $this->_items[$key] = $fields;
    $this->_labels[$key] = $label;
    $this->_layouts[$key] = $alignment;
  }

  /**
   * Add a single form field (input, select, textarea) instance
   *
   * @param $field {Object}
   *     Form field instance
   */
  public function addItem ($field) {
    $key = $field->name;

    $label = $field->name; // default to field's 'name' attr, but use 'label' if available
    if ($field->label) {
      $label = $field->label;
    }

    $this->_items[$key] = $field;
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
    foreach ($this->_items as $key => $items) {
      if (is_array($items)) { // radio/checkbox group
        $html .= sprintf('<fieldset>
          <legend>%s</legend>
          <div class="group %s">',
          $this->_labels[$key],
          $this->_layouts[$key]
        );
        foreach ($items as $item) {
          $html .= $item->getHtml(++ $count);
        }
        $html .= '</div>
          </fieldset>';
      } else { // single field
        $item = $items; // only 1 item (not an array)
        $html .= $item->getHtml(++ $count);
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
   * Create an array containing form field values entered by user, then insert into database
   *
   * @param $Database {Object}
   *    Database instance
   * @param $table {String}
   *    Table name
   */
  public function process ($Database, $table) {
    foreach ($this->_items as $key => $item) {
      if (is_array($item)) { // radio/checkbox group, get value from first item
        $value = $item[0]->getValue();
      } else {
        $value = $item->getValue();
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
