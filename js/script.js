document.addEventListener('DOMContentLoaded', function() {
  Validator({
    el: document.querySelector('form')
  });
});


var Validator = function (options) {
  var _this,
      _intialize,

      _el,
      _inputs,
      _selects,
      _textareas,

      _addEventHandlers,
      _getControls,
      _validate;

  _this = {};

  _initialize = function (options) {
    _el = options.el;

    _getControls();
    _addEventHandlers();
  };

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
      if (select.hasAttribute('pattern') || select.hasAttribute('required')) {
        select.addEventListener('change', function() {
          _validate(select);
        });
      }
    });

    _textareas.forEach(function(textarea) {
      if (textarea.hasAttribute('pattern') || textarea.hasAttribute('required')) {
        textarea.addEventListener('input', function() {
          _validate(textarea);
        });
      }
    });
  };

  _getControls = function () {
    _inputs = _el.querySelectorAll('input:not([type="submit"])');
    _selects = _el.querySelectorAll('select');
    _textareas = _el.querySelectorAll('textarea');
  };

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

    if (type === 'checkbox') { // checkboxes
      name = el.getAttribute('name');
      controls = _el.querySelectorAll('input[name="' + name + '"]');
      state = 'invalid';

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

    parent = el.closest('.control');
    if (parent.classList.contains('checkbox') || parent.classList.contains('radio')) {
      parent = parent.closest('fieldset');
    }
    parent.classList.remove('invalid', 'valid');
    parent.classList.add(state);
  }

  _initialize(options);
  options = null;
  return _this;
};
