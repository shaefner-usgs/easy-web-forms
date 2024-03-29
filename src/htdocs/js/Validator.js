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

      _controls,
      _form,

      _addButton,
      _addListeners,
      _configListeners,
      _getParent,
      _getState,
      _handleSubmit,
      _removeListeners,
      _setFocus,
      _showError,
      _validateAll;


  _this = {};

  _initialize = function (options) {
    var button;

    _controls = {
      els: [],
      events: []
    };
    _form = options.form;

    button = _form.querySelector('button[type="submit"]');

    button.addEventListener('click', e => {
      e.preventDefault();
      _handleSubmit(button);
    });

    _configListeners();
  };

  /**
   * Submit button is not set in $_POST when submitted via js; add a hidden
   * 'faux' button to set it.
   */
  _addButton = function () {
    var fauxButton = document.createElement('input');

    fauxButton.setAttribute('name', 'submitbutton');
    fauxButton.setAttribute('type', 'hidden');
    fauxButton.setAttribute('value', 'Submit');

    _form.appendChild(fauxButton);
  };

  /**
   * Add event listener(s) to validate a form control while the user is
   * interacting with the control.
   *
   * @param el {Element}
   *     Form control
   * @param events {Array}
   *     Events to listen for
   */
  _addListeners = function (el, events) {
    _controls.els.push(el);
    _controls.events.push(events);

    events.forEach(event => {
      el.addEventListener(event, _this.validate);
    });
  };

  /**
   * Configure event listeners for each type of form control.
   *
   * Note: the blur event on inputs and textareas captures autocompleted fields.
   */
  _configListeners = function () {
    var inputs,
        selects,
        textareas;

    inputs = _form.querySelectorAll('input:not([type="hidden"])');
    selects = _form.querySelectorAll('select');
    textareas = _form.querySelectorAll('textarea');

    inputs.forEach(input => {
      var events,
          type;

      events = ['blur', 'input'];
      type = input.getAttribute('type');

      if (input.hasAttribute('maxlength') ||
          input.hasAttribute('minlength') ||
          input.hasAttribute('pattern') ||
          input.hasAttribute('required')
      ) {
        if (type === 'checkbox' || type === 'file' || type === 'radio') {
          events = ['change'];
        }

        _addListeners(input, events);
      }
    });

    selects.forEach(select => {
      if (select.hasAttribute('required')) {
        _addListeners(select, ['blur', 'change']);
      }
    });

    textareas.forEach(textarea => {
      if (textarea.hasAttribute('maxlength') ||
          textarea.hasAttribute('minlength') ||
          textarea.hasAttribute('pattern') ||
          textarea.hasAttribute('required')
      ) {
        _addListeners(textarea, ['blur', 'input']);
      }
    });
  };

  /**
   * Get the parent container for a given control.
   *
   * @param el {Element}
   *
   * @return parent {Element}
   */
  _getParent = function (el) {
    var parent = el.closest('.control');

    if (parent.classList.contains('checkbox') || parent.classList.contains('radio')) {
      parent = parent.closest('fieldset');
    }

    return parent;
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

        controls.forEach(control => {
          if (control.checked) {
            state = 'valid';
          }
        });
      } else {
        if (Array.from(controls).some(control => !control.checked)) {
          state = 'invalid';
        }
      }
    } else { // everything but radio/checkbox inputs
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
   *
   * @param button {Element}
   */
  _handleSubmit = function (button) {
    var div,
        error,
        isValid,
        loader;

    div = document.querySelector('div.form');
    error = div.querySelector('p.error');
    loader = _form.querySelector('.loader');

    if (button.classList.contains('disabled')) {
      return;
    }

    button.classList.add('disabled');
    loader.classList.remove('hide');

    _validateAll();

    isValid = !_form.querySelector('.invalid');

    if (isValid) {
      if (error) {
        div.removeChild(error); // clean up any pre-existing error message
      }

      _addButton();
      setTimeout(() => {
        _form.submit();
      }, 250);
    } else {
      _setFocus();
      _showError(error, div);

      div.scrollIntoView();
      button.classList.remove('disabled');
      loader.classList.add('hide');
    }
  };

  /**
   * Remove event listeners from the form controls.
   */
  _removeListeners = function () {
    _controls.els.forEach((el, i) => {
      _controls.events[i].forEach(event => {
        el.removeEventListener(event, _this.validate);
      });
    });

    // Reset tracked controls
    _controls = {
      els: [],
      events: []
    };
  };

  /**
   * Set focus to first invalid control.
   */
  _setFocus = function () {
    var control,
        parent;

    parent = _form.querySelector('.invalid'); // first invalid control
    control = parent.querySelector('input, select, textarea');

    control.focus();
  };

  /**
   * Show an error message if the form contains validation errors.
   *
   * @param error {Element}
   * @param div {Element}
   */
  _showError = function (error, div) {
    if (!error) {
      error = document.createElement('p');

      error.classList.add('error');
      error.innerHTML = 'Please fix the following errors and submit the form again.';

      div.insertBefore(error, _form);
    }
  };

  /**
   * Validate all form controls.
   */
  _validateAll = function () {
    var controls = _form.querySelectorAll('input:not([type="hidden"]), select, textarea');

    controls.forEach(control => {
      if (control.hasAttribute('pattern') || control.hasAttribute('required')) {
        _this.validate(control);
      }
    });
  };

  // ----------------------------------------------------------
  // Public methods
  // ----------------------------------------------------------

  /**
   * Validate user input on a given form control.
   *
   * @param e {Mixed <Event|Element>}
   */
  _this.validate = function (e) {
    var calendars,
        el,
        parent,
        state;

    calendars = document.querySelectorAll('.flatpickr-calendar');
    el = e.target || e;
    parent = _getParent(el);
    state = _getState(el);

    // Set validation state on parent node and also datepicker widget(s)
    if (el.getAttribute('data-type') === 'datetime') {
      // Don't set state to invalid while user is interacting with datepicker
      if (state === 'valid' || !parent.classList.contains('open')) {
        parent.classList.remove('invalid', 'valid');
        parent.classList.add(state);

        calendars.forEach(calendar => {
          calendar.classList.remove('invalid', 'valid');
          calendar.classList.add(state);
        });
      }
    } else {
      parent.classList.remove('invalid', 'valid');
      parent.classList.add(state);
    }
  };

  /**
   * Update the controls tracked by the Validator. It is necessary to call this
   * global method if the required controls change after initialization.
   */
  window.updateValidator = function () {
    _removeListeners();
    _configListeners();
  };


  _initialize(options);
  options = null;
  return _this;
};


module.exports = Validator;
