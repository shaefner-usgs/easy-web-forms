<?php

/**
 * Create and process HTML form
 *
 * @param $params {Array}
 *
 *     adminEmail {String} - Where to send results of successful form submission
 *     emailSubject {String} - Subject of email results
 *     successMsg {String} - Message shown upon successful form submission
 */
class Form {
  private $_defaults = array(
      'adminEmail' => '',
      'emailSubject' => 'Form submitted',
      'successMsg' => 'Thank you for your input.'
    ),
    $_isValid = true, // Boolean value (set to false if form doesn't validate)
    $_items = array(), // form controls/groups and associated props
    $_results = ''; // Summary of user input

  public function __construct (Array $params=array()) {
    // Merge defaults with user-supplied params and set as class properties
    $options = array_merge($this->_defaults, $params);

    foreach ($options as $key => $value) {
      if (array_key_exists($key, $this->_defaults)) {
        $this->$key = $value;
      }
    }
  }

  /**
   * Check that all controls in group have matching values for 'name' & 'required'
   */
  private function _checkParams ($controls) {
    $prevKey = '';
    $prevRequired = '';
    foreach ($controls as $control) {
      $key = $control->name;
      $required = $control->required;
      if ($prevKey !== '' && $key !== $prevKey) {
         print '<p class="error">ERROR: the <em>name</em> attribute must be the same for all inputs in a group</p>';
      }
      if ($prevRequired !== '' && $required !== $prevRequired) {
        printf ('<p class="error">ERROR: the <em>required</em> attribute must be the same for all inputs in a group (%s)</p>',
          $control->name
        );
      }
      $prevKey = $key;
      $prevRequired = $required;
    }
  }

  /**
   * Send email to admin when user successfully submits form
   */
  private function _sendEmail () {
    if ($this->adminEmail) {
      $headers = array(
        'Content-type: text/html; charset=iso-8859-1',
        'From: webmaster@' . $_SERVER['SERVER_NAME'],
        'MIME-Version: 1.0'
      );
      $placeholders = '/\{\{([^}]+)\}\}/';
      $subject = $this->emailSubject;

      // Replace any placeholders in subject with submitted values
      preg_match_all($placeholders, $subject, $matches, PREG_SET_ORDER);
      foreach ($matches as $match) {
        $pattern = '/' . $match[0] . '/';
        $replacement = $_POST[$match[1]];
        $subject = preg_replace($pattern, $replacement, $subject);
      }

      mail($this->adminEmail, $subject, $this->_results, implode("\r\n", $headers));
    }
  }

  /*
   * Server-side validation
   *   isValid props all default to true (for form and each control)
   */
  private function _validate () {
    foreach ($this->_items as $key => $item) {
      $control = $item['control'];
      if (is_array($control)) { // radio/checkbox group: use first control to validate group
        $control = $control[0];
      }
      $pattern = '';
      if (isSet($control->pattern)) {
        $pattern = preg_replace('@/@', '\/', $control->pattern);
      }

      if (($control->required && !$control->value) ||
        (isSet($pattern) && !preg_match("/$pattern/", $control->value) && $control->value)
      ) {
        $this->_isValid = false; // form (set to false if any conrol is invalid)
        $control->isValid = false; // this control
      }
    }
  }

  /**
   * Add a single form control (input, select, textarea) instance
   *
   * @param $control {Object}
   *     Form control instance
   */
  public function addControl ($control) {
    $key = $control->name;

    $label = $control->name; // default to control's 'name' attr, but use 'label' if available
    if ($control->label) {
      $label = $control->label;
    }

    $this->_items[$key] = array(
      'control' => $control,
      'label' => $label
    );
  }

  /**
   * Add a radio/checkbox group
   *
   * @param $group {Array}
   *     [
   *       arrangement {String} - 'inline' or 'stacked'
   *       controls {Array} - Form control instances as an indexed array
   *       description {String} - explanatory text displayed next to form control
   *       label {String} - input label
   *       message {String} - instructions displayed for invalid form control
   *     ]
   */
  public function addGroup ($group) {
    $controls = $group['controls'];
    $key = $controls[0]->name; // get shared 'name' attr from first control

    $this->_checkParams($controls);

    $arrangement = 'inline'; // default value
    if (array_key_exists('arrangement', $group)) {
      $arrangement = $group['arrangement'];
    }

     $description = '';
     if (array_key_exists('description', $group)) {
       $description = $group['description'];
     }

    $label = ucfirst($controls[0]->name); // default to 'name' attr
    if (array_key_exists('label', $group)) {
      $label = $group['label'];
    }

    $message = $controls[0]->message;
    if (array_key_exists('message', $group)) {
      $message = $group['message'];
    }

    $this->_items[$key] = array(
      'arrangement' => $arrangement,
      'control' => $controls, // array
      'description' => $description,
      'label' => $label,
      'message' => $message
    );
  }

  /**
   * Get html for form
   *
   * @return $html {String}
   */
  public function getFormHtml () {
    $count = 0; // used for tabindex attrs
    $hasRequiredFields = false;

    $html = '<section class="form">';
    if (isSet($_POST['submitbutton']) && !$this->_isValid) {
      $html .= '<p class="error">Please fix the following errors and submit the form again.</p>';
    }
    $html .= sprintf('<form action="%s" method="POST" novalidate="novalidate">',
      $_SERVER['REQUEST_URI']
    );

    foreach ($this->_items as $key => $item) {
      $control = $item['control'];
      if (is_array($control)) { // radio/checkbox group
        $controls = $control; // group of control(s) as array
        // attach invalid/req'd classes to parent for radio / checkbox controls
        $cssClasses = array();
        if (!$controls[0]->isValid) {
          array_push($cssClasses, 'invalid');
        }
        if ($controls[0]->required) {
          array_push($cssClasses, 'required');
          $hasRequiredFields = true;
        }

        $html .= sprintf('<fieldset class="%s">
          <legend>%s</legend>
          <div class="group %s">',
            implode(' ', $cssClasses),
            $item['label'],
            $item['arrangement']
        );
        foreach ($controls as $ctrl) {
          $html .= $ctrl->getHtml(++ $count);
        }
        $html .= '</div>';
        $html .= sprintf('<p class="description" data-message="%s">%s</p>',
          $item['message'],
          $item['description']
        );
        $html .= '</fieldset>';
      } else { // single control
        $html .= $control->getHtml(++ $count);
        if ($control->required) {
          $hasRequiredFields = true;
        }
      }
    }

    $html .= sprintf('<input id="submitbutton" name="submitbutton" type="submit" class="btn btn-primary" tabindex="%d" value="Submit" />',
      ++ $count
    );
    $html .= '</form>';
    if ($hasRequiredFields) {
      $html .= '<p class="required"><span>*</span> = required field</p>';
    }
    $html .= '</section>';

    return $html;
  }

  /**
   * Get html for results summary returned to user after successful form submission
   *   if form does not validate, send back form instead
   *
   * @return $html {String}
   */
  public function getResultsHtml () {
    if ($this->_isValid) {
      $html = sprintf('<section class="results">
          <p class="success">%s</p>
          %s
        </section>',
        $this->successMsg,
        $this->_results
      );
    } else { // validation failed; send back form
      $html = $this->getFormHtml();
    }

    return $html;
  }

  /**
   * Create an array and html description list containing values entered by user
   *   If validation passes, insert record into database and email results to admin
   *
   * @param $Database {Object}
   *     Database instance
   * @param $table {String}
   *     Table name
   */
  public function process ($Database, $table) {
    $values = array();
    $this->_results = '<dl>';

    foreach ($this->_items as $key => $item) {
      $control = $item['control'];
      if (is_array($control)) { // radio/checkbox group, use first control
        $control = $control[0];
      }
      $values[$key] = $control->value;
      $this->_results .= '<dt>' . ucfirst($item['label']) . '</dt>';
      $this->_results .= '<dd>' . htmlentities(stripslashes($control->value)) . '</dd>';
    }
    $this->_results .= '</dl>';

    // Validate and insert/email record if valid
    $this->_validate();
    if ($this->_isValid) {
      //$Database->insertRecord($values, $table);
      $this->_sendEmail();
    }
  }
}
