'use strict';


/**
 * Set up client-side validation.
 *
 * @param options {Object}
 *   {
 *     form: {Element}
 *   }
 *
 * @return _this {Object}
 *   {
 *     initAltInput: {Function},
 *     validate: {Function}
 *   }
 */
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
      _getState,
      _handleSubmit,
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
            _this.validate(input);
          });
        } else {
          ['blur', 'input'].forEach(function(evt) { // blur: capture autocompleted fields
            input.addEventListener(evt, function() {
              _this.validate(input);
            });
          });
        }
      }
    });

    _selects.forEach(function(select) {
      if (select.hasAttribute('required')) {
        ['blur', 'change'].forEach(function(evt) { // blur: consistent with input
          select.addEventListener(evt, function() {
            _this.validate(select);
          });
        });
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
            _this.validate(textarea);
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

    _inputs = _form.querySelectorAll('input:not([type="hidden"]):not([type="submit"])');
    _selects = _form.querySelectorAll('select');
    _textareas = _form.querySelectorAll('textarea');
    _submitButton = _form.querySelector('input[type="submit"]');
  };

  /**
   * Get validation state of element
   *
   * @param el {Element}
   *
   * @return state {String}
   */
  _getState = function (el) {
    var controls,
        maxLength,
        minLength,
        name,
        pattern,
        state,
        type,
        value;

    state = 'valid'; // default state; set to invalid if validation fails
    type = el.getAttribute('type');
    value = el.value;

    if (type === 'checkbox' || type === 'radio') { // checkbox/radio input
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

    return state;
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
   * Validate all form controls (useful when user submits the form)
   */
  _validateAll = function () {
    _allControls.forEach(function(el) {
      if (el.hasAttribute('pattern') || el.hasAttribute('required')) {
        _this.validate(el);
      }
    });
  };

  // ----------------------------------------------------------
  // Public methods
  // ----------------------------------------------------------

  /**
   * Set up validation for flatpickr altInput fields, which display a human-
   *   readable date in a separate field while returning a different value
   *   to the server in the original field
   *
   * @param input {Element}
   *     original <input> element
   * @param altInput {Element}
   *     new <input> element
   */
  _this.initAltInput = function (input, altInput) {
    ['blur', 'input'].forEach(function(evt) {
      altInput.addEventListener(evt, function() {
        _this.validate(input);
      });
    });
  };

  /**
   * Validate user input on a given element
   *
   * @param el {Element}
   */
  _this.validate = function (el) {
    var calendars,
        parent,
        state;

    parent = el.closest('.control');
    if (parent.classList.contains('checkbox') || parent.classList.contains('radio')) {
      parent = parent.closest('fieldset');
    }
    state = _getState(el);

    // Set validation state on parent node and any datepicker widget(s)
    if (el.getAttribute('data-type') === 'datetime') {
      // Don't change state to invalid while user is interacting with datepickr widget
      if (state === 'valid' || !parent.classList.contains('open')) {
        parent.classList.remove('invalid', 'valid');
        parent.classList.add(state);

        calendars = document.querySelectorAll('.flatpickr-calendar');
        calendars.forEach(function(calendar) {
          calendar.classList.remove('invalid', 'valid');
          calendar.classList.add(state);
        });
      }
    } else {
      parent.classList.remove('invalid', 'valid');
      parent.classList.add(state);
    }
  };


  _initialize(options);
  options = null;
  return _this;
};


module.exports = Validator;
