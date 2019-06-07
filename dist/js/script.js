'use strict';


var Flatpickr = function (options) {
  var _this,
      _initialize,

      _form,

      _initFlatpickrFields;

  _this = {};

  _initialize = function (options) {
    _form = options.form;

    if (_form) {
      _initFlatpickrFields();
    }
  };

  /**
   * Set up 3rd-party Flatpickr datetime picker
   */
  _initFlatpickrFields = function () {
    var callback,
        inputs,
        options;

    inputs = _form.querySelectorAll('input[data-type="datetime"]');

    if (inputs.length > 0) {
      callback = function () { // initializes flatpickr after script is added
        inputs.forEach(function(input, index) {
          options = flatpickrOptions[index];
          flatpickr(input, options);
        });
      }

      Util.addCssFile('https://cdn.jsdelivr.net/npm/flatpickr/dist/flatpickr.min.css');
      Util.addJsFile('https://cdn.jsdelivr.net/npm/flatpickr', callback);
    }
  };

  _initialize(options);
  options = null;
  return _this;
}


var MapQuestPlaceSearch = function (options) {
  var _this,
      _initialize,

      _form,

      _initAddressFields,
      _setAddressFields;

  _this = {};

  _initialize = function (options) {
    _form = options.form;

    if (_form) {
      _initAddressFields(); // Address autocomplete
    }
  };

  /**
   * Set up MapQuest PlaceSearch.js for autocomplete Address fields
   */
  _initAddressFields = function () {
    var addressField,
        callback,
        coords,
        hasAddressFields,
        inputs;

    inputs = _form.querySelectorAll('input[data-type="address"]');

    if (inputs.length > 0) { // add library's css and js to DOM; set up listeners
      callback = function () { // initializes PlaceSearch after script is added
        inputs.forEach(function(input, index) {
          addressField = placeSearch({
            key: MAPQUESTKEY,
            container: input,
            useDeviceLocation: false
          });
          addressField.on('change', function(e) { // set hidden fields to returned values
            _setAddressFields(e, index);
          });
          addressField.on('clear', function(e) { // clear hidden fields
            _setAddressFields(e, index);
          });

          // Add 'required' class to parent for CSS to flag required field in UI
          if (input.hasAttribute('required')) {
            input.closest('.mq-place-search').classList.add('required');
          }
        });
      };

      Util.addCssFile('https://api.mqcdn.com/sdk/place-search-js/v1.0.0/place-search.css');
      Util.addJsFile('https://api.mqcdn.com/sdk/place-search-js/v1.0.0/place-search.js', callback);
    }
  };

  /**
   * Store constituent address values from PlaceSearch-enhanced Address field in hidden form fields
   *
   * @param e {Event}
   * @param index {Integer}
   */
  _setAddressFields = function (e, index) {
    var hiddenFields,
        el,
        suffix,
        value;

    hiddenFields = [
      'city',
      'countryCode',
      'latlng',
      'postalCode',
      'state',
      'street'
    ];

    index ++; // zero-based index, but we want to start at 1
    suffix = '';
    if (index > 1) {
      suffix = index;
    }

    hiddenFields.forEach(function(field) {
      el = _form.querySelector('input[name="' + field + suffix + '"]');

      value = '';
      if (e) { // e is empty if user is clearing out previous value
        if (field === 'latlng' && e.result.latlng) { // flatten coord. pair
          value = e.result.latlng.lat + ', ' + e.result.latlng.lng
        } else if (field === 'street') { // using custom name for field that differs from library
          value = e.result.name || '';
        } else {
          value = e.result[field] || '';
        }
      }

      el.value = value;
    });
  }

  _initialize(options);
  options = null;
  return _this;
}


var Validator = function (options) {
  var _this,
      _initialize,

      _allControls,
      _form,
      _inputs,
      _selects,
      _submitButton,
      _textareas,

      _addEventHandlers,
      _getControls,
      _handleSubmit,
      _validate,
      _validateAll;

  _this = {};

  _initialize = function (options) {
    _form = options.form;

    if (_form) {
      _getControls();
      _addEventHandlers();
    }
  };

  /**
   * Add event listeners to form controls for validating user input
   */
  _addEventHandlers = function () {
    var type;

    _inputs.forEach(function(input) {
      type = input.getAttribute('type');

      if (input.hasAttribute('maxlength') ||
          input.hasAttribute('minlength') ||
          input.hasAttribute('pattern') ||
          input.hasAttribute('required')
      ) {
        if (type === 'checkbox' || type === 'radio') {
          input.addEventListener('change', function() { // input event buggy for radio/checkbox
            _validate(input);
          });
        } else {
          ['blur', 'input'].forEach(function(evt) { // blur: capture autocompleted fields
            input.addEventListener(evt, function() {
              _validate(input);
            });
          });
        }
      }
    });

    _selects.forEach(function(select) {
      if (select.hasAttribute('required')) {
        ['blur', 'change'].forEach(function(evt) { // blur: consistent with input
          select.addEventListener(evt, function() {
            _validate(select);
          });
        })
      }
    });

    _submitButton.addEventListener('click', function(e) {
      e.preventDefault();
      _handleSubmit();
    });

    _textareas.forEach(function(textarea) {
      if (textarea.hasAttribute('maxlength') ||
          textarea.hasAttribute('minlength') ||
          textarea.hasAttribute('pattern') ||
          textarea.hasAttribute('required')
      ) {
        ['blur', 'input'].forEach(function(evt) { // blur: consistent with input
          textarea.addEventListener(evt, function() {
            _validate(textarea);
          });
        });
      }
    });
  };

  /**
   * Get a NodeList of form controls by type
   */
  _getControls = function () {
    _allControls = _form.querySelectorAll('input:not([type="submit"]), select, textarea');

    _inputs = _form.querySelectorAll('input:not([type="submit"])');
    _selects = _form.querySelectorAll('select');
    _textareas = _form.querySelectorAll('textarea');
    _submitButton = _form.querySelector('input[type="submit"]');
  };

  /**
   * Show validation errors or submit form depending on validation state
   */
  _handleSubmit = function () {
    var errorMsg,
        isFormInvalid,
        section,
        submitButton;

    errorMsg = document.querySelector('.form p.error');
    section = document.querySelector('section.form');

    _validateAll();

    isFormInvalid = _form.querySelector('.invalid');
    if (isFormInvalid) { // stop form submission and alert user
      if (!errorMsg) {
        errorMsg = document.createElement('p');
        errorMsg.classList.add('error');
        errorMsg.innerHTML = 'Please fix the following errors and submit the form again.';

        section.insertBefore(errorMsg, _form);
      }
      section.scrollIntoView();
    } else {
      // Remove error message if it exists
      if (errorMsg) {
        section.removeChild(errorMsg);
      }

      // Submit button is not set when form is submitted via js; set it here
      submitButton = document.createElement('input');
      submitButton.setAttribute('name', 'submitbutton');
      submitButton.setAttribute('type', 'hidden');
      submitButton.setAttribute('value', 'Submit');

      _form.appendChild(submitButton);
      _form.submit();
    }
  };

  /**
   * Validate user input on a given element
   *
   * @param el {Element}
   */
  _validate = function (el) {
    var controls,
        maxLength,
        minLength,
        name,
        parent,
        pattern,
        state,
        type,
        value;

    state = 'valid'; // default state; set to invalid if validation fails
    type = el.getAttribute('type');
    value = el.value;

    // Get validation state
    if (type === 'checkbox' || type === 'radio') { // checkboxes and radios
      name = el.getAttribute('name');
      controls = _form.querySelectorAll('input[name="' + name + '"]');
      state = 'invalid'; // flip default

      controls.forEach(function(control) {
        if (control.checked) {
          state = 'valid';
        }
      });
    } else { // everything else
      if (el.hasAttribute('minlength') || el.hasAttribute('maxlength')) {
        maxLength = parseInt(el.getAttribute('maxLength'), 10);
        minLength = parseInt(el.getAttribute('minLength'), 10);

        if (el.value.length < minLength || el.value.length > maxLength) {
          state = 'invalid';
        }
      }
      if (el.hasAttribute('pattern')) {
        pattern = new RegExp(el.getAttribute('pattern'));
        if (!pattern.test(value) && value !== '') {
          state = 'invalid';
        }
      }
      if (el.hasAttribute('required') && value === '') {
        state = 'invalid';
      }
    }

    // Set validation state on parent node
    parent = el.closest('.control');
    if (parent.classList.contains('checkbox') || parent.classList.contains('radio')) {
      parent = parent.closest('fieldset');
    }
    parent.classList.remove('invalid', 'valid');
    parent.classList.add(state);
  };

  /**
   * Validate all form controls (useful when user submits the form)
   */
  _validateAll = function () {
    _allControls.forEach(function(el) {
      if (el.hasAttribute('pattern') || el.hasAttribute('required')) {
        _validate(el);
      }
    });
  };

  _initialize(options);
  options = null;
  return _this;
};


/* Utility functions and initialization code follow
----------------------------------------------------------------------------- */

var Util = {};

/**
 * Add a new CSS file to the DOM
 *
 * @param file {String}
 */
Util.addCssFile = function (file) {
  var css;

  css = document.createElement('link');
  css.href = file;
  css.rel = 'stylesheet';
  css.type = 'text/css';

  document.head.appendChild(css);
};

/**
* Add a new JS file to the DOM
*
* @param file {String}
* @param callback {Function}
*/
Util.addJsFile = function (file, cb) {
  var js;

  js = document.createElement('script');
  js.onload = cb;
  js.src = file;

  document.head.appendChild(js);
};

/**
 * Add Polyfills for Element.closest()
 */
Util.addPolyfills = function () {
  if (!Element.prototype.matches) {
    Element.prototype.matches = Element.prototype.msMatchesSelector ||
      Element.prototype.webkitMatchesSelector;
  }

  if (!Element.prototype.closest) {
    Element.prototype.closest = function(s) {
      var el = this;
      if (!document.documentElement.contains(el)) {
        return null;
      }
      do {
        if (el.matches(s)) {
          return el;
        }
        el = el.parentElement || el.parentNode;
      } while (el !== null && el.nodeType === 1);
      return null;
    };
  }
};

// Initialize
document.addEventListener('DOMContentLoaded', function() {
  var form = document.querySelector('section.form form');

  Util.addPolyfills();

  Flatpickr({
    form: form
  });
  MapQuestPlaceSearch({
    form: form
  });
  Validator({
    form: form
  });
});
