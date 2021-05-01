/* global flatpickr */
'use strict';


var AppUtil = require('AppUtil');


/**
 * Set up Flatpickr, a 3rd-party datetime picker.
 *
 * @param options {Object}
 *   {
 *     form: {Element},
 *     validator: {Object}
 *   }
 */
var Flatpickr = function (options) {
  var _initialize,

      _form,
      _validator,

      _addHiddenInput,
      _addListeners,
      _configField,
      _getOptions,
      _initFields,
      _setOptions;


  _initialize = function (options) {
    _form = options.form;
    _validator = options.validator;

    _initFields();
  };

  /**
   * Store Flatpickr's altInput value (human-readable date) in a hidden field
   *   for display in results summary.
   *
   * @param altInput {Element}
   * @param i {Integer}
   */
  _addHiddenInput = function (altInput, i) {
    var hiddenInput = altInput.cloneNode(false);

    hiddenInput.id = 'altInput' + i;
    hiddenInput.name = 'altInput' + i;
    hiddenInput.type = 'hidden';
    hiddenInput.removeAttribute('tabindex');

    altInput.parentNode.appendChild(hiddenInput);
  };

  /**
   * Add event listeners to validate Flatpickr altInput fields, which display a
   *   human-readable date in a separate field while returning a different value
   *   to the server in the original field.
   *
   * @param altInput {Element}
   *     Flatpickr altInput
   * @param input {Element}
   *     original <input>
   */
  _addListeners = function (altInput, input) {
    ['blur', 'input'].forEach(function(evt) {
      altInput.addEventListener(evt, function() {
        _validator.validate(input);
      });
    });
  };

  /**
   * Configure Flatpickr field.
   *
   * @param fp {Object}
   *     Flatpickr instance
   * @param i {Integer}
   */
  _configField = function (fp, i) {
    var altInput,
        description,
        input,
        label,
        options,
        placeholder;

    input = fp.input;
    altInput = input.nextElementSibling;
    description = input.previousElementSibling;
    label = altInput.nextElementSibling;
    options = fp.config;
    placeholder = 'Select a date';

    if (options.noCalendar) {
      placeholder = 'Select a time';
    }

    description.innerText = ''; // explanatory text is superfluous if .js enabled
    input.setAttribute('placeholder', placeholder);

    if (options.altInput) { // Flatpickr's altInput field
      // Set placeholder and re-assign label text to altInput
      altInput.setAttribute('id', 'flatpickr' + i);
      altInput.setAttribute('placeholder', placeholder);
      label.setAttribute('for', 'flatpickr' + i);

      _addHiddenInput(altInput, i);
      _addListeners(altInput, input);
    }

    _setOptions(fp, i);
  };

  /**
   * Get Flatpickr options which are embedded inline in HTML.
   *
   * @param i {Integer}
   *
   * @return options {Object}
   */
  _getOptions = function (i) {
    var options;

    // Execute wrapper function which returns options
    options = window['initFlatpickr' + i]();

    return options;
  };

  /**
   * Initialize Flatpickr fields.
   */
  _initFields = function () {
    var callback,
        fp,
        inputs,
        options;

    inputs = _form.querySelectorAll('input[data-type="datetime"]');

    if (inputs.length > 0) {
      callback = function () { // initialize Flatpickr after lib is loaded
        inputs.forEach(function(input, index) {
          options = _getOptions(index);
          fp = flatpickr(input, options);

          _configField(fp, index);
        });
      };

      AppUtil.addCssFile('https://cdn.jsdelivr.net/npm/flatpickr/dist/flatpickr.min.css');
      AppUtil.addJsFile('https://cdn.jsdelivr.net/npm/flatpickr', callback);
    }
  };

  /**
   * Set additional options (hooks) for a Flatpickr instance.
   *
   * @param fp {Object}
   *     Flatpickr instance
   * @param i {Integer}
   */
  _setOptions = function (fp, i) {
    var altInput,
        calendars,
        div,
        hiddenInput,
        input;

    input = fp.input;
    div = input.closest('.control');
    altInput = div.querySelector('#flatpickr' + i);
    calendars = document.querySelectorAll('.flatpickr-calendar');
    hiddenInput = div.querySelector('#altInput' + i);

    fp.config.onChange.push(
      function() {
        // Flatpickr briefly sets altInput value to current time (bug?); add slight delay
        window.setTimeout(function() {
          if (hiddenInput && altInput) {
            hiddenInput.value = altInput.value;
          }
        }, 100);
      }
    );

    fp.config.onClose.push(
      function() {
        div.classList.remove('open');
        _validator.validate(input);
      }
    );

    fp.config.onOpen.push(
      function() {
        div.classList.add('open');

        // Set initial validation state on datepicker widget when opened
        calendars.forEach(function(calendar) {
          calendar.classList.remove('invalid', 'valid');
          if (div.classList.contains('invalid')) {
            calendar.classList.add('invalid');
          }
        });
      }
    );
  };


  _initialize(options);
  options = null;
};


module.exports = Flatpickr;
