<?php

include_once __DIR__ . '/../dep/Autop.php';

/**
 * Create an <input>.
 *
 * @param $params {Array}
 *     html input attributes; supported properties are:
 *
 *       accept {String}
 *       checked {Boolean}
 *       disabled {Boolean}
 *       id {String} - REQUIRED for radio/checkbox inputs
 *       inputmode {String}
 *       max {Integer}
 *       maxlength {Integer}
 *       min {Integer}
 *       minlength {Integer}
 *       name {String} - REQUIRED for all inputs; for radio/checkbox inputs, use the same 'name' for all inputs in group
 *       pattern {RegExp}
 *       placeholder {String}
 *       readonly {Boolean}
 *       required {Boolean}
 *       type {String} default is 'text'
 *       value {String} - REQUIRED for radio/checkbox inputs
 *
 *     other (custom) properties:
 *
 *       class {String} - CSS class attached to parent <div>
 *       description {String} - text displayed below (or next to a radio/checkbox) a form control
 *       explanation {String} - text displayed above a form control
 *       fpOpts {Array} - options for Flatpickr datetime lib
 *       label {String} - <label> element for control
 *       message {String} - text displayed when a form control is invalid
 *       path {String} - full path to file upload directory on server
 */
class Input {
  private $_defaults = [
      'accept' => 'image/png, image/jpeg',
      'checked' => false,
      'class' => '',
      'description' => '',
      'disabled' => false,
      'explanation' => '',
      'fpOpts' => [],
      'id' => '',
      'inputmode' => '',
      'label' => '',
      'max' => NULL,
      'maxlength' => NULL,
      'message' => 'Please provide a valid {{label}}',
      'min' => NULL,
      'minlength' => NULL,
      'name' => '',
      'path' => '',
      'pattern' => '',
      'placeholder' => '',
      'readonly' => false,
      'required' => false,
      'type' => 'text',
      'value' => ''
    ],
    $_fpIndex,
    $_instantiatedValue,
    $_isCheckboxOrRadio = false,
    $_jsonOptions = [],
    $_jsonPlaceholders = [],
    $_jsonValues = [],
    $_submittedValue;

  private static $_count = 0;

  public $isValid = true;

  public function __construct (Array $params=[]) {
    $this->_setDefaults($params);
    $options = array_merge($this->_defaults, $params);

    foreach ($options as $key => $value) {
      if ($key === 'name' && $options['type'] === 'checkbox') {
        $value = preg_replace('/(\w+)\[\]$/', '$1', $value); // strip '[]'
      } else if ($key === 'path') {
        $value = rtrim($value, '/'); // strip trailing slash
      }

      // Only set props that are defined in $_defaults
      if (array_key_exists($key, $this->_defaults)) {
        $this->$key = $value;
      }
    }

    $this->_checkParams($params);
    $this->_setValue();
  }

  /**
   * Check for missing required params; set id, label params if not already set.
   *
   * @param $params {Array}
   */
  private function _checkParams ($params) {
    if (!$this->name) {
      print '<p class="error">ERROR: the <em>name</em> attribute is <strong>required</strong> for all input elements.</p>';
    }

    if ($this->type === 'checkbox' || $this->type === 'radio') {
      $this->_isCheckboxOrRadio = true;

      if (!$this->id) {
        printf ('<p class="error">ERROR: the <em>id</em> attribute is <strong>required</strong> for all radio/checkbox inputs (%s).</p>',
          $this->name
        );
      }
      if (!$this->value) {
        printf ('<p class="error">ERROR: the <em>value</em> attribute is <strong>required</strong> for all radio/checkbox inputs (%s).</p>',
          $this->name
        );
      }
    }

    // Alert user to set description/explanation/message when adding radio/checkbox group to form
    if ($this->_isCheckboxOrRadio) {
      if (
        isSet($params['description']) ||
        isSet($params['explanation']) ||
        isSet($params['message'])
      ) {
        printf ('<p class="error">ERROR: the <em>description</em>, <em>explanation</em> and <em>message</em> properties must be set when adding a radio/checkbox group (%s), using Form&rsquo;s addGroup() method.',
          $this->name
        );
      }
    }

    // Set id and label if not set during instantiation
    if (!$this->id) {
      $this->id = $this->name;
    }
    if (!$this->label) {
      $this->label = ucfirst($this->name);

      if ($this->_isCheckboxOrRadio) {
        $this->label = ucfirst($this->value);
      }
    }
  }

  /**
   * php's json_encode with support for javascript expressions passed as strings
   * for configuring Flatpickr options.
   *
   * @param $opts {Array}
   *
   * @return $json {String}
   */
  private function _encode ($opts) {
    $this->_jsonOptions = $opts;

    foreach ($this->_jsonOptions as $key => $value) {
      $this->_replaceExpressions($key, $value);
    }

    $json = json_encode($this->_jsonOptions, JSON_FORCE_OBJECT);
    $json = str_replace($this->_jsonPlaceholders, $this->_jsonValues, $json);

    return $json;
  }

  /**
   * Get optional HTML attributes for control.
   *
   * @param $tabindex {Integer}
   *
   * @return $attrs {String}
   */
  private function _getAttrs ($tabindex) {
    $attrs = '';

    if ($tabindex) {
      $attrs .= sprintf(' tabindex="%d"', $tabindex);
    }

    if ($this->_isCheckboxOrRadio) {
      if ($this->isChecked()) {
        $attrs .= ' checked="checked"';
      }
    }

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
    if ($this->readonly) {
      $attrs .= ' readonly="readonly"';
    }
    if ($this->required) {
      $attrs .= ' required="required"';
    }

    if ($this->type === 'address') {
      $attrs .= ' data-type="address"';
    } else if ($this->type === 'datetime') {
      $attrs .= ' data-type="datetime"';
    } else if ($this->type === 'file') {
      $attrs .= sprintf(' accept="%s"', $this->accept);
    } else if ($this->type === 'number') {
      $attrs .= sprintf(' max="%d" min="%d"',
        $this->max,
        $this->min
      );
    } else if ($this->type === 'text') {
      if ($this->maxlength) {
        $attrs .= sprintf(' maxlength="%d"', $this->maxlength);
      }
      if ($this->minlength) {
        $attrs .= sprintf(' minlength="%d"', $this->minlength);
      }
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
    if ($this->_isCheckboxOrRadio) { // add classes for pretty checkbox library
      array_push($cssClasses, 'pretty', 'p-default', 'p-pulse');

      if ($this->type === 'radio') {
        $cssClasses[] = 'p-round';
      }
    }

    // Note: invalid radio/checkbox controls are handled in Form class
    if (!$this->isValid && !$this->_isCheckboxOrRadio) {
      $cssClasses[] = 'invalid';
    }

    return $cssClasses;
  }

  /**
   * Replace javascript expressions with a placeholder, and store placeholder
   * keys & original values for later substitution after using json_encode().
   *
   * @param $key {String}
   * @param $value {Mixed}
   */
  private function _replaceExpressions ($key, $value) {
    $jsonValue = $value;
    $patterns = [
      '/new\s+Date\([^)]*\)/s', // dates
      '/function\s*\(.*\)\s*\{.*\}/s', // functions
      '/document\.querySelector\s*\(.*\)/' // elements
    ];

    // Flatten arrays into a string ($value) and array literal ($jsonValue)
    if (is_array($value)) {
      $value = implode(',', $value);
      $jsonValue = "[$value]";
    }

    foreach ($patterns as $pattern) {
      if (preg_match($pattern, $value)) {
        $placeholder = '{{' . $key . '}}';

        $this->_jsonOptions[$key] = $placeholder;
        $this->_jsonPlaceholders[] = '"' . $placeholder . '"';
        $this->_jsonValues[] = $jsonValue;
      }
    }
  }

  /**
   * Set defaults that depend on type.
   *
   * @param $params {Array}
   */
  private function _setDefaults ($params) {
    if (isSet($params['type'])) {
      $enableTime = isSet($params['fpOpts']['enableTime']) &&
        $params['fpOpts']['enableTime'];
      $noCalendar = isSet($params['fpOpts']['noCalendar']) &&
        $params['fpOpts']['noCalendar'];
      $type = $params['type'];

      if ($type === 'checkbox') {
        $this->_defaults['message'] = 'Please select one or more options';
      } else if ($type === 'datetime') {
        $this->_defaults['pattern'] = '^\d{4}-\d{2}-\d{2}$';
        $this->_defaults['description'] = 'Please use this format: yyyy-mm-dd';

        if ($enableTime) {
          $this->_defaults['pattern'] = '^\d{4}-\d{2}-\d{2} \d{2}:\d{2}$';
          $this->_defaults['description'] = 'Please use this format: yyyy-mm-dd hh:mm (using 00-23 for hour)';

          if ($noCalendar) {
            $this->_defaults['pattern'] = '^\d{2}:\d{2}$';
            $this->_defaults['description'] = 'Please use this format: hh:mm (using 00-23 for hour)';
          }
        }
      } else if ($type === 'email') {
        $this->_defaults['pattern'] = '[^@]+@[^@]+\.[^@]+';
      } else if ($type === 'file') {
        $this->_defaults['description'] = '.jpg or .png';
        $this->_defaults['message'] = 'Please choose a file';
      } else if ($type === 'number') {
        $this->_defaults['pattern'] = '^[0-9.-]+$';
      } else if ($type === 'radio') {
        $this->_defaults['message'] = 'Please select an option';
      } else if ($type === 'url') {
        $this->_defaults['description'] = 'Include &ldquo;http://&rdquo; or &ldquo;https://&rdquo;';
        $this->_defaults['pattern'] = '^(https?|ftp)://[^\s/$.?#].[^\s]*$';
      }
    }
  }

  /**
   * Cache instantiated/submitted values and set value prop depending on state.
   */
  private function _setValue () {
    $pattern = '/^' . $this->name . '\d{5}$/';
    $this->_instantiatedValue = $this->value;

    if (isSet($_POST['submitbutton'])) {
      if ($this->type === 'address') {
        // 'Fish' for submitted address input (random string appended to name)
        foreach($_POST as $key => $value) {
          if (preg_match($pattern, $key)) { // found match
            $this->_submittedValue = safeParam($key);
          }
        }
      } else {
        $this->_submittedValue = safeParam($this->name, $this->type);
      }

      $this->value = $this->_submittedValue; // set to user-supplied value when posting
    }
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
    $description = $this->description;
    $explanation = '';
    $input = '';
    $label = sprintf('<label for="%s">%s</label>',
      $this->id,
      $this->label
    );
    $lengthMsg = Form::getLengthMsg($this->minlength, $this->maxlength);
    $message = preg_replace('/{{(label|name)}}/', strtoupper($this->label), $this->message);
    $name = $this->name;
    $randomNumber = sprintf('%05d', mt_rand(1, 99999));
    $type = $this->type;

    // If no custom description was set, default to showing min/max-length requirements
    if (!$description && $lengthMsg) {
      $description = $lengthMsg;
    }

    if ($this->explanation) {
      $explanation = \Xmeltrut\Autop\Autop::format($this->explanation);
      $explanation = str_replace('<p>', '<p class="explanation">', $explanation);
    }

    // If no custom message was set, append min/max-length requirements
    if ($this->message === $this->_defaults['message'] && $lengthMsg) {
      $message .= " ($lengthMsg)";
    }

    if ($type === 'checkbox') {
      $name .= '[]'; // set name value to type Array for checkbox values
    } else if ($type === 'address') {
      $name .= $randomNumber; // disable browser's autocomplete
      $type = 'search'; // set type attr to 'search' for MapQuest PlaceSearch.js
    } else if ($type === 'datetime') {
      $type = 'text'; // set type attr to text for Flatpickr
    }

    if ($this->_isCheckboxOrRadio) {
      $info = ''; // message / description set via Form's addGroup() method
      // Wrap label in div elem for pretty checkbox library
      $label = sprintf('<div class="state p-primary-o">%s</div>', $label);
      $value = $this->_instantiatedValue; // always use instantiated value
    } else {
      $info = sprintf('<p class="description" data-message="%s">%s</p>',
        $message,
        $description
      );
      $value = $this->value; // instantiated or user-supplied value depending on state
    }

    if ($this->type === 'file') { // add 'X' button to allow removing chosen file
      $input .= '<button type="button" aria-label="clear" class="hide reset-file">
          <svg width="15" height="16" xmlns="http://www.w3.org/2000/svg">
            <g transform="translate(-1)" fill="#D1D1D1" fill-rule="evenodd">
              <rect transform="scale(-1 1) rotate(45 0 -12.992)" x="7.09" y="-1.333" width="3.2" height="18.642" rx="1.6"></rect>
              <rect transform="rotate(-135 8.69 8.012)" x="7.09" y="-1.309" width="3.2" height="18.642" rx="1.6"></rect>
            </g>
          </svg>
        </button>';
    }

    $input .= sprintf('<input id="%s" name="%s" type="%s" value="%s"%s />',
      $this->id,
      $name,
      $type,
      $value,
      $attrs
    );

    if ($this->type === 'hidden') {
      $html = $input; // only include input tag for hidden fields
    } else {
      $html = sprintf('<div class="%s">%s%s%s%s</div>',
        implode(' ', $cssClasses),
        $info,
        $input,
        $explanation,
        $label
      );

      // set inline .js var with Flatpickr options
      if ($this->type === 'datetime') {
        $this->_fpIndex =  ++ self::$_count;

        $html .= sprintf('<script>
            function initFlatpickr%d() {
              return %s;
            }
          </script>',
          $this->_fpIndex,
          $this->_encode($this->fpOpts)
        );
      }
    }

    return $html;
  }

  /**
   * Assess if radio/checkbox is/should be checked.
   *
   * @return $checked {Boolean}
   */
  public function isChecked () {
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
    } else if ($this->checked) {
      $checked = true; // set to initial state
    }

    return $checked;
  }
}
