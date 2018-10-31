document.addEventListener('DOMContentLoaded', function() {
  Validator({
    el: document.querySelector('form')
  });
});


var Validator = function (options) {
  var _this,
      _intialize,

      _allControls,
      _el,
      _inputs,
      _isFormValid,
      _selects,
      _submitButtion,
      _textareas,

      _addEventHandlers,
      _getControls,
      _handleSubmit,
      _validate,
      _validateAll;

  _this = {};

  _initialize = function (options) {
    _el = options.el;
    _isFormValid = true; // default value; set by _validate()

    _getControls();
    _addEventHandlers();
  };

  /**
   * Add event listeners to form controls for validating user input
   */
  _addEventHandlers = function () {
    var el,
        i,
        type;

    _inputs.forEach(function(input) {
      type = input.getAttribute('type');

      if (input.hasAttribute('pattern') || input.hasAttribute('required')) {
        if (type === 'checkbox' || type === 'radio') {
          input.addEventListener('change', function() { // input event buggy for radio/checkbox
            _validate(input);
          });
        } else {
          input.addEventListener('input', function() {
            _validate(input);
          });
        }
      }
    });

    _selects.forEach(function(select) {
      if (select.hasAttribute('required')) {
        select.addEventListener('change', function() {
          _validate(select);
        });
      }
    });

    _submitButtion.addEventListener('click', function(e) {
      e.preventDefault();
      _handleSubmit();
    });

    _textareas.forEach(function(textarea) {
      if (textarea.hasAttribute('pattern') || textarea.hasAttribute('required')) {
        textarea.addEventListener('input', function() {
          _validate(textarea);
        });
      }
    });
  };

  /**
   * Get a NodeList of form controls by type
   */
  _getControls = function () {
    _allControls = _el.querySelectorAll('input:not([type="submit"]), select, textarea');
    _inputs = _el.querySelectorAll('input:not([type="submit"])');
    _selects = _el.querySelectorAll('select');
    _textareas = _el.querySelectorAll('textarea');

    _submitButtion = _el.querySelector('input[type="submit"]');
  };

  /**
   * Show validation errors or submit form depending on validation state
   */
  _handleSubmit = function () {
    var errorMsg,
        form,
        section,
        submitButton;

    form = _el;

    _validateAll();

    if (_isFormValid) {
      // Submit button is not set when form is submitted via js; set it here
      submitButton = document.createElement('input');
      submitButton.setAttribute('name', 'submitbutton');
      submitButton.setAttribute('type', 'hidden');
      submitButton.setAttribute('value', 'Submit');
      form.appendChild(submitButton);

      form.submit();
    } else { // stop form submission and alert user
      errorMsg = document.querySelector('.form p.error');
      section = document.querySelector('section.form');

      if (!errorMsg) {
        errorMsg = document.createElement('p');
        errorMsg.classList.add('error');
        errorMsg.innerHTML = 'Please fix the following errors and submit the form again.';

        section.insertBefore(errorMsg, form);
      }

      _isFormValid = true; // reset to default
    }
  }

  /**
   * Validate user input on a given element
   *
   * @param el {Element}
   */
  _validate = function (el) {
    var name,
        parent,
        pattern,
        required,
        state,
        type,
        value;

    state = 'valid'; // default state; set to invalid if validation fails
    type = el.getAttribute('type');
    value = el.value;

    // Get validation state
    if (type === 'checkbox' || type === 'radio') { // checkboxes and radios
      name = el.getAttribute('name');
      controls = _el.querySelectorAll('input[name="' + name + '"]');
      state = 'invalid'; // flip default

      controls.forEach(function(control) {
        if (control.checked) {
          state = 'valid';
        }
      });
    } else { // everything else
      if (el.hasAttribute('pattern')) {
        pattern = new RegExp(el.getAttribute('pattern'));
        if (!pattern.test(value)) {
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

    // Flag form state as invalid
    if (state === 'invalid') {
      _isFormValid = false;
    }
  }

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
