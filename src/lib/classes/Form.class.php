<?php

include_once __DIR__ . '/../dep/Autop.php';

/**
 * Create and process HTML form.
 *
 * @param $params {Array}
 *
 *     adminEmail {String} - Email address(es) for form submission notifications
 *     emailSubject {String} - Subject of form submission notifications
 *     meta {Array} - Extra fields to include in MySQL database with each submission
 *     mode {String} - SQL mode: 'insert' (default) or 'update'
 *     record {Array} - SQL field name (key) and value of record to update
 *     submitButtonText {String} - Submit button text
 *     successMsg {String} - Message shown upon successful form submission
 *     table {String} - Name of MySQL table to insert records into
 */
class Form {
  private $_countAddressFields = 0,
    $_countTabIndex = 0, // used for tabindex attrs
    $_defaults = [
      'adminEmail' => '',
      'emailSubject' => 'Form submitted',
      'meta' => [
        'browser' => false,
        'datetime' => false,
        'ip' => false
      ],
      'mode' => 'insert',
      'record' => [],
      'submitButtonText' => 'Submit',
      'successMsg' => 'Thank you for your input.',
      'table' => ''
    ],
    $_isValid = false, // gets set to true if form passes validation
    $_items = [], // form controls/groups and their associated props
    $_results = ''; // summary of user input

  public function __construct (Array $params=[]) {
    $options = array_merge_recursive_distinct($this->_defaults, $params);

    foreach ($options as $key => $value) {
      // Only set props that are defined in $_defaults
      if (array_key_exists($key, $this->_defaults)) {
        $this->$key = $value;
      }
    }
  }

  /**
   * Add hidden input fields for storing constituent values of an address.
   *   (javascript populates these values from MapQuest's PlaceSearch.js json)
   */
  private function _addHiddenFields () {
    $fieldNames = [
      'city',
      'countryCode',
      'latlng',
      'postalCode',
      'state',
      'street'
    ];
    $suffix = '';

    // Append count to field names if more than 1 address field on page
    $this->_countAddressFields ++;
    if ($this->_countAddressFields > 1) {
      $suffix = $this->_countAddressFields;
    }

    foreach ($fieldNames as $fieldName) {
      $name = $fieldName . $suffix;
      $input = new Input([
        'name' => $name,
        'type' => 'hidden',
        'value' => ''
      ]);

      $this->addControl($input);
    }
  }

  /**
   * Add metadata field(s) to user input for Database record.
   *
   * @param $userData {Array}
   *     User input on web form
   *
   * @return {Array}
   */
  private function _addMetaData ($userData) {
    $metaData = [];

    if ($this->meta['browser']) {
      $metaData['browser'] = $_SERVER['HTTP_USER_AGENT'];
    }
    if ($this->meta['datetime']) {
      $metaData['datetime'] = date('Y-m-d H:i:s');
    }
    if ($this->meta['ip']) {
      $metaData['ip'] = $_SERVER['REMOTE_ADDR'];
    }

    return array_merge($metaData, $userData);
  }

  /**
   * Check that all controls in group have matching values for 'name' & 'required'.
   *
   * @param $controls {Array}
   */
  private function _checkParams ($controls) {
    $prevName = '';
    $prevRequired = '';

    foreach ($controls as $control) {
      if ($prevName && $control->name !== $prevName) {
         print '<p class="error">ERROR: the <em>name</em> attribute must be the same for all inputs in a group.</p>';
      }
      if ($prevRequired && $control->required !== $prevRequired) {
        printf ('<p class="error">ERROR: the <em>required</em> attribute must be the same for all inputs in a group (%s).</p>',
          $control->name
        );
      }

      $prevName = $control->name;
      $prevRequired = $control->required;
    }
  }

  /**
   * Get HTML for a group of controls (radio/checkbox group).
   *
   * @param $group {Array}
   *
   * @return $html {String}
   */
  private function _getControlGroupHtml ($group) {
    $controls = $group['controls'];
    $cssClasses = [];

    // Only need to check 1st control in each group
    if (!$controls[0]->isValid) {
      $cssClasses[] = 'invalid';
    }
    if ($controls[0]->required) {
      $cssClasses[] = 'required';
    }

    $html = sprintf('<fieldset class="%s">
      <legend>%s</legend>
      <div class="group %s">',
        implode(' ', $cssClasses), // attach classes to parent for radio/checkbox
        $group['label'],
        $group['arrangement']
    );

    foreach ($controls as $control) {
      $html .= $control->getHtml(++ $this->_countTabIndex);
    }

    $html .= '</div>';
    $html .= sprintf('<p class="description" data-message="%s">%s</p>',
      $group['message'],
      $group['description']
    );
    $html .= '</fieldset>';

    return $html;
  }

  /**
   * Get HTML for form.
   *
   * @return $html {String}
   */
  private function _getFormHtml () {
    $contentType = 'application/x-www-form-urlencoded';
    $controlsHtml = '';
    $hasRequiredFields = false;
    $html = '<div class="form">';

    if ($this->isPosting() && !$this->_isValid) {
      $html .= '<p class="error">Please fix the following errors and submit the form again.</p>';
    }

    foreach ($this->_items as $key => $item) {
      $controls = $item['controls'];
      $control = $controls[0]; // single control or 1st control in group

      if (count($controls) > 1) { // radio/checkbox group
        $controlsHtml .= $this->_getControlGroupHtml($item);
      } else {
        if ($control->type === 'hidden') {
          $controlsHtml .= $control->getHtml(); // no tabindex needed
        } else {
          $controlsHtml .= $control->getHtml(++ $this->_countTabIndex);

          if ($control->type === 'file') {
            $contentType = 'multipart/form-data';
          }
        }
      }

      if ($control->required) {
        $hasRequiredFields = true;
      }
    }

    $html .= sprintf('<form action="%s" accept-charset="utf-8" method="POST" enctype="%s" novalidate="novalidate">',
      $_SERVER['REQUEST_URI'],
      $contentType
    );
    $html .= $controlsHtml;
    $html .= sprintf('<button id="submitbutton" name="submitbutton" type="submit" class="btn" tabindex="%d">
        <span class="loader hide"><span></span><span></span><span></span><span></span></span>
        %s
      </button>',
      ++ $this->_countTabIndex,
      $this->submitButtonText
    );
    $html .= '</form>';

    if ($hasRequiredFields) {
      $html .= '<p class="required"><span>*</span> = required field</p>';
    }

    $html .= '</div>';

    // Set MapQuest API key as global JS var if set in config file
    if ($GLOBALS['mapQuestApiKey']) {
      $html .= sprintf("<script>var MAPQUESTKEY = '%s';</script>",
        $GLOBALS['mapQuestApiKey']
      );
    }

    return $html;
  }

  /**
   * Get HTML for results summary after form submitted.
   *
   * @return $html {String}
   */
  private function _getResultsHtml () {
    $html = sprintf('<div class="results">
        <p class="success">%s</p>
        %s
      </div>',
      $this->successMsg,
      $this->_results
    );

    return $html;
  }

  /**
   * Process form on submit - create an array (for MySQL) and HTML summary of
   *   values entered by user. Also handle uploaded files.
   */
  private function _process () {
    $countDateTimeFields = 0;
    $sqlValues = [];

    $this->_results = '<dl>';

    foreach ($this->_items as $key => $item) {
      $controls = $item['controls'];
      $control = $controls[0]; // single control or 1st control in group
      $displayValue = '';
      $sqlValue = '';

      if ($control->type === 'file') {
        $name = $_FILES[$key]['name'];

        if ($name && $control->path) { // move uploaded file if path was provided
          $displayValue = basename($name);
          $newName = sprintf('%s/%s.%s',
            $control->path,
            time(), // use timestamp for filename to ensure it's unique
            pathinfo($name)['extension']
          );
          $sqlValue = basename($newName);

          move_uploaded_file($_FILES[$key]['tmp_name'], $newName);
        }
      } else if (count($controls) > 1) { // radio/checkbox group
        $sqlValue = $control->value; // get value from 1st control in group
        $values = [];

        foreach ($controls as $ctrl) {
          if ($ctrl->isChecked()) {
            $values[] = $ctrl->label;
          }
        }

        $displayValue = implode(', ', $values);
      } else { // single (non-file) input, select, or textarea control
        $sqlValue = $control->value;

        if ($control->type === 'datetime') {
          $countDateTimeFields ++;
          $displayValue = $control->value;

          // Set display value to altInput value if configured
          if (isSet($_POST['altInput' . $countDateTimeFields])) {
            $displayValue = $_POST['altInput' . $countDateTimeFields];
          }
        } else if ($control->type === 'select') {
          $displayValue = $control->options[$control->value];
        } else {
          $displayValue = $control->value;
        }
      }

      if ($sqlValue) {
        $sqlValues[$key] = $sqlValue;
      }
      if ($control->type !== 'hidden') { // don't include hidden fields in results summary
        $value = htmlspecialchars(stripslashes($displayValue));

        if ($control->type === 'textarea') {
          $value = \Xmeltrut\Autop\Autop::format($value); // preserve formatting
        }

        $this->_results .= '<dt>' . ucfirst($item['label']) . '</dt>';
        $this->_results .= sprintf('<dd id="%s">%s</dd>', $key, $value);
      }
    }

    $this->_results .= '</dl>';

    $this->_validate();

    if ($this->_isValid) {
      $this->_updateDb($sqlValues);
      $this->_sendEmail();
    }
  }

  /**
   * Send a notification email to admin when a user submits the form.
   */
  private function _sendEmail () {
    if ($this->adminEmail) {
      $headers = [
        'Content-Type: text/html; charset=utf-8',
        'From: webmaster@' . $_SERVER['SERVER_NAME'],
        'MIME-Version: 1.0'
      ];
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

  /**
   * Insert/update record in db.
   *
   * @param $sqlValues {Array}
   */
  private function _updateDb ($sqlValues) {
    $Database = new Database($GLOBALS['db']);
    $params = $this->_addMetaData($sqlValues);
    $table = $GLOBALS['dbTable'];

    if ($this->table) {
      $table = $this->table; // override table set in config
    }

    if ($this->mode === 'update') {
      $Database->updateRecord($params, $table, $this->record);
    } else {
      $Database->insertRecord($params, $table);
    }
  }

  /*
   * Server-side validation.
   *
   * Check each form control and set its boolean isValid prop. If any control is
   *   invalid, set Form's _isValid prop to false.
   */
  private function _validate () {
    $this->_isValid = true;

    foreach ($this->_items as $key => $item) {
      $control = $item['controls'][0]; // single control or 1st control in group
      $value = $control->value;
      $length = strlen($value);
      $maxLength = null;
      $minLength = null;
      $pattern = '';

      if ($control->type === 'file') {
        $value = $_FILES[$key]['name'];
      } else if ($control->type !== 'select') {
        $maxLength = intval($control->maxlength);
        $minLength = intval($control->minlength);
      }

      if (isSet($control->pattern)) {
        $pattern = preg_replace('@/@', '\/', $control->pattern); // escape '/' chars
      }
      if (
        ($control->required && !$value) ||
        ($minLength && $length < $minLength) ||
        ($maxLength && $length > $maxLength) ||
        ($pattern && !preg_match("/$pattern/", $value) && $value)
      ) {
        $control->isValid = false; // control
        $this->_isValid = false; // form
      }
    }
  }

  /**
   * Add a single form control (input, select, textarea) instance to Form.
   *
   * @param $control {Object}
   *     Form control instance
   */
  public function addControl ($control) {
    $key = $control->name;

    $this->_items[$key] = [
      'controls' => [$control], // expects a single-item array
      'label' => $control->label
    ];

    if ($control->type === 'address') {
      $this->_addHiddenFields();
    }
  }

  /**
   * Add a radio/checkbox group instance to Form.
   *
   * @param $group {Array}
   *     [
   *       arrangement {String} - 'inline' or 'stacked'
   *       controls {Array} - Form control instances as an indexed array
   *       description {String} - explanatory text displayed next to group
   *       label {String} - <legend> for <fieldset> group
   *       message {String} - instructions displayed for invalid group
   *     ]
   */
  public function addGroup ($group) {
    $arrangement = 'inline'; // default value
    $controls = $group['controls'];
    $description = '';
    $key = $controls[0]->name; // get shared 'name' attr from 1st control
    $label = ucfirst($controls[0]->name); // default to 'name' attr
    $message = '';

    $this->_checkParams($controls);

    if (array_key_exists('arrangement', $group)) {
      $arrangement = $group['arrangement'];
    }
    if (array_key_exists('description', $group)) {
      $description = $group['description'];
    }
    if (array_key_exists('label', $group)) {
      $label = $group['label'];
    }
    if (array_key_exists('message', $group)) {
      $message = $group['message'];
    }

    $this->_items[$key] = [
      'arrangement' => $arrangement,
      'controls' => $controls,
      'description' => $description,
      'label' => $label,
      'message' => $message
    ];
  }

  /**
   * Determine if form is being submitted or not.
   *
   * @return $posting {Boolean}
   */
  public function isPosting () {
    $posting = false;

    if (isSet($_POST['submitbutton'])) {
      $posting = true;
    }

    return $posting;
  }

  /**
   * Determine if form passed server-side validation or not (expose private
   *   _isValid prop).
   *
   * @return {Boolean}
   */
  public function isValid () {
    return $this->_isValid;
  }

  /**
   * Render form or results depending on current state.
   */
  public function render () {
    if ($this->isPosting()) { // user submitting form
      $this->_process();

      if ($this->_isValid) {
        print $this->_getResultsHtml();
      } else {
        print $this->_getFormHtml();
      }
    } else {
      print $this->_getFormHtml();
    }
  }
}
