/* global flatpickr, flatpickrOptions */
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
 *
 * @return _this {Object}
 */
var Flatpickr = function (options) {
  var _this,
      _initialize,

      _form,
      _validator,

      _addHiddenAltInput,
      _configFlatpickrField,
      _getOptions,
      _initFlatpickrFields,
      _setOptions;


  _this = {};

  _initialize = function (options) {
    _form = options.form;
    _validator = options.validator;

    if (_form) {
      _initFlatpickrFields();
    }
  };

  /**
   * Store altInput value in hidden field for display in results summary.
   *
   * @param altInput {Element}
   * @param i {Integer}
   */
  _addHiddenAltInput = function (altInput, i) {
    var hiddenInput;

    hiddenInput = altInput.cloneNode(false);
    hiddenInput.id = 'altInput' + i;
    hiddenInput.name = 'altInput' + i;
    hiddenInput.type = 'hidden';

    altInput.parentNode.appendChild(hiddenInput);
  };

  /**
   * Additional configuration necessary for flatpickr fields.
   *
   * @param fp {Object}
   *     flatpickr instance
   * @param i {Integer}
   */
  _configFlatpickrField = function (fp, i) {
    var altInput,
        description,
        input,
        label,
        options,
        placeholder;

    input = fp.input;
    options = fp.config;

    // Remove format descriptor which isn't necessary with js enabled
    description = input.previousElementSibling;
    description.innerText = '';

    placeholder = 'Select a date';
    if (options.noCalendar) {
      placeholder = 'Select a time';
    }
    input.setAttribute('placeholder', placeholder);

    if (options.altInput) { // flatpickr altInput (readable date) field
      // Set placeholder and re-assign label text for alt input
      altInput = input.nextElementSibling;
      altInput.setAttribute('id', 'flatpickr' + i);
      altInput.setAttribute('placeholder', placeholder);

      label = altInput.nextElementSibling;
      label.setAttribute('for', 'flatpickr' + i);

      // Store altInput value for displaying in summary results
      _addHiddenAltInput(altInput, i);

      // Set up validation for alt input
      _validator.initAltInput(input, altInput);
    }

    // Extra options added to all flatpickr instances
    _setOptions(fp, i);
  };

  /**
   * Get flatpickr options which are embedded inline within HTML.
   *
   * @param i {Integer}
   *
   * @return options {Object}
   */
  _getOptions = function (i) {
    var options,
        setOptions;

    // First, execute wrapper function to set options now that lib is loaded
    setOptions = 'initFlatpickrOptions' + i;
    window[setOptions]();

    options = flatpickrOptions[i]; // options embedded in HTML as global obj

    return options;
  };

  /**
   * Initialize Flatpickr.
   */
  _initFlatpickrFields = function () {
    var callback,
        fp,
        inputs,
        options;

    inputs = _form.querySelectorAll('input[data-type="datetime"]');

    if (inputs.length > 0) {
      callback = function () { // initialize flatpickr after script is loaded
        inputs.forEach(function(input, index) {
          // Create flatpickr instance and set additional options
          options = _getOptions(index); // user-set flatpickr options
          fp = flatpickr(input, options);
          _configFlatpickrField(fp, index); // additional configuration
        });
      };

      AppUtil.addCssFile('https://cdn.jsdelivr.net/npm/flatpickr/dist/flatpickr.min.css');
      AppUtil.addJsFile('https://cdn.jsdelivr.net/npm/flatpickr', callback);
    }
  };

  /**
   * Set additional options (hooks) for every flatpickr instance.
   *
   * @param fp {Object}
   *     flatpickr instance
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

    fp.config.onChange.push(
      function() {
        altInput = div.querySelector('#flatpickr' + i);
        hiddenInput = div.querySelector('#altInput' + i);

        // Flatpickr briefly sets altInput value to current time (bug?) - add slight delay
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
        _validator.validate(input); // be certain control is validated
      }
    );

    fp.config.onOpen.push(
      function() {
        div.classList.add('open');
        // Set initial validation state on datepicker widget when opened
        calendars = document.querySelectorAll('.flatpickr-calendar');
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
  return _this;
};


module.exports = Flatpickr;
