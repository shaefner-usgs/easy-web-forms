'use strict';


(function () {

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
     * Store altInput value in hidden field for display in results summary
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
     * Additional configuration necessary for flatpickr fields
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
    }

    /**
     * Get flatpickr options which are embedded inline within HTML
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
     * Set up 3rd-party Flatpickr datetime picker
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
        }

        Util.addCssFile('https://cdn.jsdelivr.net/npm/flatpickr/dist/flatpickr.min.css');
        Util.addJsFile('https://cdn.jsdelivr.net/npm/flatpickr', callback);
      }
    };

    /**
     * Set addtional options (hooks) for every flatpickr instance
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

      fp.set('onChange', function() {
        altInput = div.querySelector('#flatpickr' + i);
        hiddenInput = div.querySelector('#altInput' + i);

        // Flatpickr briefly sets altInput value to current time (bug?) - add slight delay
        window.setTimeout(function() {
          hiddenInput.value = altInput.value;
        }, 100);
      });

      fp.set('onClose', function () {
        div.classList.remove('open');
        _validator.validate(input); // be certain control is validated
      });

      fp.set('onOpen', function () {
        div.classList.add('open');
        // Set intial validition state on datepicker widget when opened
        calendars = document.querySelectorAll('.flatpickr-calendar');
        calendars.forEach(function(calendar) {
          calendar.classList.remove('invalid', 'valid');
          if (div.classList.contains('invalid')) {
            calendar.classList.add('invalid');
          }
        });
      });
    }

    _initialize(options);
    options = null;
    return _this;
  }


  var MapQuestPlaceSearch = function (options) {
    var _this,
        _initialize,

        _form,

        _initAddressFields,
        _setHiddenFields;

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
        callback = function () { // initialize PlaceSearch after script is loaded
          inputs.forEach(function(input, index) {
            index ++; // zero-based index, but we want to start at 1

            addressField = placeSearch({
              key: MAPQUESTKEY,
              container: input,
              useDeviceLocation: false
            });
            addressField.on('change', function(e) { // set hidden fields to returned values
              _setHiddenFields(e, index);
            });
            addressField.on('clear', function(e) { // clear hidden fields
              _setHiddenFields(e, index);
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
     * Store constituent values from PlaceSearch API in hidden form fields
     *
     * @param e {Event}
     * @param i {Integer}
     */
    _setHiddenFields = function (e, i) {
      var el,
          fields,
          name,
          value;

      fields = [
        'city',
        'countryCode',
        'latlng',
        'postalCode',
        'state',
        'street'
      ];

      fields.forEach(function(field) {
        name = field;
        if (i > 1) {
          name += i;
        }

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

        el = _form.querySelector('input[name="' + name + '"]');
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
    var options;

    options = {
      form: document.querySelector('section.form form')
    };

    Util.addPolyfills();

    options.validator = Validator(options);
    MapQuestPlaceSearch(options);
    Flatpickr(options);
  });

})();
