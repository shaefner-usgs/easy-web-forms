'use strict';


/**
 * Set up client-side form validation.
 *
 * @param options {Object}
 *   {
 *     form: {Element}
 *   }
 *
 * @return _this {Object}
 *   {
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

      _addEvents,
      _addListeners,
      _getControls,
      _getState,
      _handleSubmit,
      _validateAll;


  _this = {};

  _initialize = function (options) {
    _form = options.form;

    _getControls();
    _addListeners();
  };

  /**
   * Add validate events to a form control.
   *
   * @param el {Element}
   *     Form control
   * @param types {Array}
   *     Event types to listen for
   */
  _addEvents = function (el, types) {
    types.forEach(function(type) {
      el.addEventListener(type, function() {
        _this.validate(el);
      });
    });
  };

  /**
   * Add event listeners to form controls.
   */
  _addListeners = function () {
    var type,
        types;

    _inputs.forEach(function(input) {
      type = input.getAttribute('type');

      if (input.hasAttribute('maxlength') ||
          input.hasAttribute('minlength') ||
          input.hasAttribute('pattern') ||
          input.hasAttribute('required')
      ) {
        if (type === 'checkbox' || type === 'radio') {
          types = ['change']; // input event is buggy for radio/checkbox
        } else if (type === 'file') {
          types = ['change'];
        } else {
          types = ['blur', 'input']; // blur: captures autocompleted fields
        }

        _addEvents(input, types);
      }
    });

    _selects.forEach(function(select) {
      if (select.hasAttribute('required')) {
        _addEvents(select, ['blur', 'change']);
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
        _addEvents(textarea, ['blur', 'input']);
      }
    });
  };

  /**
   * Get a NodeList of form controls by type.
   */
  _getControls = function () {
    _allControls = _form.querySelectorAll('input:not([type="hidden"]), select, textarea');

    _inputs = _form.querySelectorAll('input:not([type="hidden"])');
    _selects = _form.querySelectorAll('select');
    _textareas = _form.querySelectorAll('textarea');
    _submitButton = _form.querySelector('button[type="submit"]');
  };

  /**
   * Get the validation state of a form control.
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
        scope,
        state,
        type,
        value;

    state = 'valid'; // default state
    type = el.getAttribute('type');
    value = el.value;

    if (type === 'checkbox' || type === 'radio') {
      name = el.getAttribute('name');
      controls = _form.querySelectorAll('input[name="' + name + '"]');
      scope = 'some'; // whether just some or all checkboxes need to be checked

      if (el.closest('.group').classList.contains('all')) {
        scope = 'all';
      }

      if (scope === 'some') {
        state = 'invalid'; // flip default

        controls.forEach(function(control) {
          if (control.checked) {
            state = 'valid';
          }
        });
      } else {
        if (Array.from(controls).some(control => !control.checked)) {
          state = 'invalid';
        }
      }
    } else { // everything else (besides checkbox/radio inputs)
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
   * Show validation errors or submit form depending on validation state.
   */
  _handleSubmit = function () {
    var div,
        errorMsg,
        fauxButton,
        isValid,
        loader;

    div = document.querySelector('div.form');
    errorMsg = div.querySelector('p.error');
    loader = _form.querySelector('.loader');

    if (_submitButton.classList.contains('disabled')) {
      return;
    }

    _submitButton.classList.add('disabled');
    loader.classList.remove('hide');

    _validateAll();

    isValid = !_form.querySelector('.invalid');

    if (isValid) {
      if (errorMsg) {
        div.removeChild(errorMsg); // clean up any pre-existing error message
      }

      // Submit button is not set in $_POST when submitted via js; set it here
      fauxButton = document.createElement('input');
      fauxButton.setAttribute('name', 'submitbutton');
      fauxButton.setAttribute('type', 'hidden');
      fauxButton.setAttribute('value', 'Submit');

      _form.appendChild(fauxButton);

      window.setTimeout(function() {
        _form.submit();
      }, 250);
    } else { // stop form submission and alert user
      if (!errorMsg) {
        errorMsg = document.createElement('p');

        errorMsg.classList.add('error');
        errorMsg.innerHTML = 'Please fix the following errors and submit the form again.';

        div.insertBefore(errorMsg, _form);
      }

      div.scrollIntoView();
      _submitButton.classList.remove('disabled');
      loader.classList.add('hide');
    }
  };

  /**
   * Validate all form controls.
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
   * Validate user input on a given form control.
   *
   * @param el {Element}
   */
  _this.validate = function (el) {
    var calendars,
        parent,
        state;

    parent = el.closest('.control');
    state = _getState(el);

    if (parent.classList.contains('checkbox') || parent.classList.contains('radio')) {
      parent = parent.closest('fieldset');
    }

    // Set validation state on parent node and any datepicker widget(s)
    if (el.getAttribute('data-type') === 'datetime') {
      // Don't change state to invalid while user is interacting with datepicker widget
      if (state === 'valid' || !parent.classList.contains('open')) {
        calendars = document.querySelectorAll('.flatpickr-calendar');

        parent.classList.remove('invalid', 'valid');
        parent.classList.add(state);

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
