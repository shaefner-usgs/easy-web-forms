/* browserified: 04-21-2021 12:34:34 */

(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
'use strict';

var AppUtil = {};
/**
 * Add a CSS file to the DOM
 *
 * @param file {String}
 */

AppUtil.addCssFile = function (file) {
  var css;
  css = document.createElement('link');
  css.href = file;
  css.rel = 'stylesheet';
  css.type = 'text/css';
  document.head.appendChild(css);
};
/**
* Add a JS file to the DOM
*
* @param file {String}
* @param callback {Function}
*/


AppUtil.addJsFile = function (file, cb) {
  var js;
  js = document.createElement('script');
  js.onload = cb;
  js.src = file;
  document.head.appendChild(js);
};
/**
 * Add Polyfill for Element.closest()
 */


AppUtil.addPolyfills = function () {
  if (!Element.prototype.matches) {
    // used in El.closest polyfill
    Element.prototype.matches = Element.prototype.msMatchesSelector || Element.prototype.webkitMatchesSelector;
  }

  if (!Element.prototype.closest) {
    Element.prototype.closest = function (s) {
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

module.exports = AppUtil;

},{}],2:[function(require,module,exports){
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


var Flatpickr = function Flatpickr(options) {
  var _this, _initialize, _form, _validator, _addHiddenAltInput, _configField, _getOptions, _initFields, _setOptions;

  _this = {};

  _initialize = function _initialize(options) {
    _form = options.form;
    _validator = options.validator;

    _initFields();
  };
  /**
   * Store altInput value in hidden field for display in results summary.
   *
   * @param altInput {Element}
   * @param i {Integer}
   */


  _addHiddenAltInput = function _addHiddenAltInput(altInput, i) {
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


  _configField = function _configField(fp, i) {
    var altInput, description, input, label, options, placeholder;
    input = fp.input;
    options = fp.config; // Remove format descriptor which isn't necessary with js enabled

    description = input.previousElementSibling;
    description.innerText = '';
    placeholder = 'Select a date';

    if (options.noCalendar) {
      placeholder = 'Select a time';
    }

    input.setAttribute('placeholder', placeholder);

    if (options.altInput) {
      // flatpickr altInput (readable date) field
      // Set placeholder and re-assign label text for alt input
      altInput = input.nextElementSibling;
      altInput.setAttribute('id', 'flatpickr' + i);
      altInput.setAttribute('placeholder', placeholder);
      label = altInput.nextElementSibling;
      label.setAttribute('for', 'flatpickr' + i); // Store altInput value for displaying in summary results

      _addHiddenAltInput(altInput, i); // Set up validation for alt input


      _validator.initAltInput(input, altInput);
    } // Extra options added to all flatpickr instances


    _setOptions(fp, i);
  };
  /**
   * Get flatpickr options which are embedded inline within HTML.
   *
   * @param i {Integer}
   *
   * @return options {Object}
   */


  _getOptions = function _getOptions(i) {
    var options, setOptions; // First, execute wrapper function to set options now that lib is loaded

    setOptions = 'initFlatpickrOptions' + i;
    window[setOptions]();
    options = flatpickrOptions[i]; // options embedded in HTML as global obj

    return options;
  };
  /**
   * Initialize Flatpickr.
   */


  _initFields = function _initFields() {
    var callback, fp, inputs, options;
    inputs = _form.querySelectorAll('input[data-type="datetime"]');

    if (inputs.length > 0) {
      callback = function callback() {
        // initialize flatpickr after script is loaded
        inputs.forEach(function (input, index) {
          // Create flatpickr instance and set additional options
          options = _getOptions(index); // user-set flatpickr options

          fp = flatpickr(input, options);

          _configField(fp, index); // additional configuration

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


  _setOptions = function _setOptions(fp, i) {
    var altInput, calendars, div, hiddenInput, input;
    input = fp.input;
    div = input.closest('.control');
    fp.config.onChange.push(function () {
      altInput = div.querySelector('#flatpickr' + i);
      hiddenInput = div.querySelector('#altInput' + i); // Flatpickr briefly sets altInput value to current time (bug?) - add slight delay

      window.setTimeout(function () {
        if (hiddenInput && altInput) {
          hiddenInput.value = altInput.value;
        }
      }, 100);
    });
    fp.config.onClose.push(function () {
      div.classList.remove('open');

      _validator.validate(input); // be certain control is validated

    });
    fp.config.onOpen.push(function () {
      div.classList.add('open'); // Set initial validation state on datepicker widget when opened

      calendars = document.querySelectorAll('.flatpickr-calendar');
      calendars.forEach(function (calendar) {
        calendar.classList.remove('invalid', 'valid');

        if (div.classList.contains('invalid')) {
          calendar.classList.add('invalid');
        }
      });
    });
  };

  _initialize(options);

  options = null;
  return _this;
};

module.exports = Flatpickr;

},{"AppUtil":1}],3:[function(require,module,exports){
'use strict';
/**
 * Display items associated with a specific 'field' inline even though they are
 *   rendered after the form/results in div.form-meta. The item to be moved
 *   must have a css class that matches the 'id' value of the associated field.
 *
 * @param options {Object}
 *   {
 *     form: {Element}
 *   }
 *
 * @return _this {Object}
 */

var FormMeta = function FormMeta(options) {
  var _this, _initialize, _form, _getFields, _getItems, _placeItems;

  _this = {};

  _initialize = function _initialize(options) {
    _form = options.form;

    _placeItems();
  };
  /**
   * Get all 'fields': either the form controls or results list.
   *   Note: radio/checkbox form inputs are not currently supported
   *
   * @return fields {Array}
   */


  _getFields = function _getFields() {
    var controls, field, fields, results;
    fields = [];

    if (_form) {
      controls = document.querySelectorAll('form > .control');
      controls.forEach(function (control) {
        field = control.querySelector('input:not([type=hidden]), select, textarea');
        fields.push(field.id);
      });
    } else {
      // displaying results
      results = document.querySelectorAll('dl > dd');
      results.forEach(function (result) {
        fields.push(result.id);
      });
    }

    return fields;
  };
  /**
   * Get items that need to be moved in DOM.
   *
   * @return items {Array}
   */


  _getItems = function _getItems() {
    var fields, items;
    fields = _getFields();
    items = [];
    fields.forEach(function (id) {
      if (document.querySelector('.form-meta .' + id)) {
        items.push(id);
      }
    });
    return items;
  };
  /**
   * Place items inline next to form control or value in results list.
   */


  _placeItems = function _placeItems() {
    var control, el, item, items;
    items = _getItems();
    items.forEach(function (id) {
      el = document.getElementById(id);
      control = el.closest('.control');
      item = document.querySelector('.form-meta .' + id);

      if (_form) {
        control.insertBefore(item, control.firstChild);
      } else {
        // displaying results
        el.appendChild(item);
      }
    });
  };

  _initialize(options);

  options = null;
  return _this;
};

module.exports = FormMeta;

},{}],4:[function(require,module,exports){
'use strict';
/**
 * Set up file type <input>s to show a preview image inline when a user chooses
 *   an image.
 *
 * @param options {Object}
 *   {
 *     form: {Element}
 *   }
 *
 * @return _this {Object}
 */

var Image = function Image(options) {
  var _this, _initialize, _createImg, _getControl, _removeImg, _showImage;

  _this = {};

  _initialize = function _initialize(options) {
    var inputs = options.form.querySelectorAll('input[type=file]');
    inputs.forEach(function (input) {
      if (/image/.test(input.getAttribute('accept'))) {
        // image file type
        input.onchange = _showImage;
      }
    });
  };
  /**
   * Create a new <img> and add it to the DOM.
   *
   * @param id {String}
   * @param dataUrl {String}
   */


  _createImg = function _createImg(id, dataUrl) {
    var control, img;
    control = _getControl(id);
    img = document.createElement('img');

    img.onload = function () {
      control.insertBefore(img, control.firstChild);
    };

    img.src = dataUrl;
  };
  /**
   * Get the control <div> associated with an <input> id.
   *
   * @param id {String}
   *
   * @return {Element}
   */


  _getControl = function _getControl(id) {
    var el = document.getElementById(id);
    return el.closest('.control');
  };
  /**
   * Remove an existing <img> from DOM.
   *
   * @param id {String}
   */


  _removeImg = function _removeImg(id) {
    var control, img;
    control = _getControl(id);
    img = control.querySelector('img');

    if (img) {
      img.parentNode.removeChild(img);
    }
  };
  /**
   * Display user-selected image inline below file input control.
   *
   * @param e {Event}
   */


  _showImage = function _showImage(e) {
    var input, reader;
    input = e.target;
    reader = new FileReader();

    reader.onload = function () {
      _removeImg(input.id);

      _createImg(input.id, reader.result);
    };

    reader.readAsDataURL(input.files[0]);
  };

  _initialize(options);

  options = null;
  return _this;
};

module.exports = Image;

},{}],5:[function(require,module,exports){
/* global MAPQUESTKEY, placeSearch */
'use strict';

var AppUtil = require('AppUtil');
/**
 * Set up MapQuest PlaceSearch.js, a 3rd-party address autocomplete library.
 *
 * @param options {Object}
 *   {
 *     form: {Element}
 *   }
 *
 * @return _this {Object}
 */


var PlaceSearch = function PlaceSearch(options) {
  var _this, _initialize, _form, _initFields, _setHiddenFields;

  _this = {};

  _initialize = function _initialize(options) {
    _form = options.form;

    _initFields();
  };
  /**
   * Initialize PlaceSearch.
   */


  _initFields = function _initFields() {
    var addressField, callback, inputs;
    inputs = _form.querySelectorAll('input[data-type="address"]');

    if (inputs.length > 0) {
      // add library's css and js to DOM; set up listeners
      callback = function callback() {
        // initialize PlaceSearch after script is loaded
        inputs.forEach(function (input, index) {
          index++; // zero-based index, but we want to start at 1

          addressField = placeSearch({
            key: MAPQUESTKEY,
            container: input,
            useDeviceLocation: false
          });
          addressField.on('change', function (e) {
            // set hidden fields to returned values
            _setHiddenFields(e, index);
          });
          addressField.on('clear', function (e) {
            // clear hidden fields
            _setHiddenFields(e, index);
          }); // Add 'required' class to parent for CSS to flag required field in UI

          if (input.hasAttribute('required')) {
            input.closest('.mq-place-search').classList.add('required');
          }
        });
      };

      AppUtil.addCssFile('https://api.mqcdn.com/sdk/place-search-js/v1.0.0/place-search.css');
      AppUtil.addJsFile('https://api.mqcdn.com/sdk/place-search-js/v1.0.0/place-search.js', callback);
    }
  };
  /**
   * Store constituent values from PlaceSearch API in hidden form fields.
   *
   * @param e {Event}
   * @param i {Integer}
   */


  _setHiddenFields = function _setHiddenFields(e, i) {
    var el, fields, name, value;
    fields = ['city', 'countryCode', 'latlng', 'postalCode', 'state', 'street'];
    fields.forEach(function (field) {
      name = field;

      if (i > 1) {
        name += i;
      }

      value = '';

      if (e) {
        // e is empty if user is clearing out previous value
        if (field === 'latlng' && e.result.latlng) {
          // flatten coord. pair
          value = e.result.latlng.lat + ', ' + e.result.latlng.lng;
        } else if (field === 'street') {
          // using custom name for field that differs from library
          value = e.result.name || '';
        } else {
          value = e.result[field] || '';
        }
      }

      el = _form.querySelector('input[name="' + name + '"]');
      el.value = value;
    });
  };

  _initialize(options);

  options = null;
  return _this;
};

module.exports = PlaceSearch;

},{"AppUtil":1}],6:[function(require,module,exports){
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
 *     initAltInput: {Function},
 *     validate: {Function}
 *   }
 */

var Validator = function Validator(options) {
  var _this, _initialize, _allControls, _form, _inputs, _selects, _submitButton, _textareas, _addEventHandlers, _getControls, _getState, _handleSubmit, _validateAll;

  _this = {};

  _initialize = function _initialize(options) {
    _form = options.form;

    _getControls();

    _addEventHandlers();
  };
  /**
   * Add event listeners to form controls for validating user input.
   */


  _addEventHandlers = function _addEventHandlers() {
    var type;

    _inputs.forEach(function (input) {
      type = input.getAttribute('type');

      if (input.hasAttribute('maxlength') || input.hasAttribute('minlength') || input.hasAttribute('pattern') || input.hasAttribute('required')) {
        if (type === 'checkbox' || type === 'radio') {
          input.addEventListener('change', function () {
            // input event buggy for radio/checkbox
            _this.validate(input);
          });
        } else {
          ['blur', 'input'].forEach(function (evt) {
            // blur: capture autocompleted fields
            input.addEventListener(evt, function () {
              _this.validate(input);
            });
          });
        }
      }
    });

    _selects.forEach(function (select) {
      if (select.hasAttribute('required')) {
        ['blur', 'change'].forEach(function (evt) {
          // blur: consistent with input
          select.addEventListener(evt, function () {
            _this.validate(select);
          });
        });
      }
    });

    _submitButton.addEventListener('click', function (e) {
      e.preventDefault();

      _handleSubmit();
    });

    _textareas.forEach(function (textarea) {
      if (textarea.hasAttribute('maxlength') || textarea.hasAttribute('minlength') || textarea.hasAttribute('pattern') || textarea.hasAttribute('required')) {
        ['blur', 'input'].forEach(function (evt) {
          // blur: consistent with input
          textarea.addEventListener(evt, function () {
            _this.validate(textarea);
          });
        });
      }
    });
  };
  /**
   * Get a NodeList of form controls by type.
   */


  _getControls = function _getControls() {
    _allControls = _form.querySelectorAll('input:not([type="submit"]), select, textarea');
    _inputs = _form.querySelectorAll('input:not([type="hidden"]):not([type="submit"])');
    _selects = _form.querySelectorAll('select');
    _textareas = _form.querySelectorAll('textarea');
    _submitButton = _form.querySelector('input[type="submit"]');
  };
  /**
   * Get validation state of element.
   *
   * @param el {Element}
   *
   * @return state {String}
   */


  _getState = function _getState(el) {
    var controls, maxLength, minLength, name, pattern, state, type, value;
    state = 'valid'; // default state; set to invalid if validation fails

    type = el.getAttribute('type');
    value = el.value;

    if (type === 'checkbox' || type === 'radio') {
      // checkbox/radio input
      name = el.getAttribute('name');
      controls = _form.querySelectorAll('input[name="' + name + '"]');
      state = 'invalid'; // flip default

      controls.forEach(function (control) {
        if (control.checked) {
          state = 'valid';
        }
      });
    } else {
      // everything else
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


  _handleSubmit = function _handleSubmit() {
    var div, errorMsg, isFormInvalid, submitButton;
    div = document.querySelector('div.form');
    errorMsg = document.querySelector('.form p.error');

    _validateAll();

    isFormInvalid = _form.querySelector('.invalid');

    if (isFormInvalid) {
      // stop form submission and alert user
      if (!errorMsg) {
        errorMsg = document.createElement('p');
        errorMsg.classList.add('error');
        errorMsg.innerHTML = 'Please fix the following errors and submit the form again.';
        div.insertBefore(errorMsg, _form);
      }

      div.scrollIntoView();
    } else {
      // Remove error message if it exists
      if (errorMsg) {
        div.removeChild(errorMsg);
      } // Submit button is not set when form is submitted via js; set it here


      submitButton = document.createElement('input');
      submitButton.setAttribute('name', 'submitbutton');
      submitButton.setAttribute('type', 'hidden');
      submitButton.setAttribute('value', 'Submit');

      _form.appendChild(submitButton);

      _form.submit();
    }
  };
  /**
   * Validate all form controls (useful when user submits the form).
   */


  _validateAll = function _validateAll() {
    _allControls.forEach(function (el) {
      if (el.hasAttribute('pattern') || el.hasAttribute('required')) {
        _this.validate(el);
      }
    });
  }; // ----------------------------------------------------------
  // Public methods
  // ----------------------------------------------------------

  /**
   * Set up validation for flatpickr altInput fields, which display a human-
   *   readable date in a separate field while returning a different value
   *   to the server in the original field.
   *
   * @param input {Element}
   *     original <input> element
   * @param altInput {Element}
   *     new <input> element
   */


  _this.initAltInput = function (input, altInput) {
    ['blur', 'input'].forEach(function (evt) {
      altInput.addEventListener(evt, function () {
        _this.validate(input);
      });
    });
  };
  /**
   * Validate user input on a given element.
   *
   * @param el {Element}
   */


  _this.validate = function (el) {
    var calendars, parent, state;
    parent = el.closest('.control');

    if (parent.classList.contains('checkbox') || parent.classList.contains('radio')) {
      parent = parent.closest('fieldset');
    }

    state = _getState(el); // Set validation state on parent node and any datepicker widget(s)

    if (el.getAttribute('data-type') === 'datetime') {
      // Don't change state to invalid while user is interacting with datepicker widget
      if (state === 'valid' || !parent.classList.contains('open')) {
        parent.classList.remove('invalid', 'valid');
        parent.classList.add(state);
        calendars = document.querySelectorAll('.flatpickr-calendar');
        calendars.forEach(function (calendar) {
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

},{}],7:[function(require,module,exports){
'use strict';

var AppUtil = require('AppUtil'),
    Flatpickr = require('Flatpickr'),
    Image = require('Image'),
    FormMeta = require('FormMeta'),
    PlaceSearch = require('PlaceSearch'),
    Validator = require('Validator'); // Initialize


document.addEventListener('DOMContentLoaded', function () {
  var form, options;
  form = document.querySelector('div.form form');
  options = {
    form: form
  };
  AppUtil.addPolyfills();
  FormMeta(options);

  if (form) {
    options.validator = Validator(options);
    Flatpickr(options);
    Image(options);
    PlaceSearch(options);
  }
});

},{"AppUtil":1,"Flatpickr":2,"FormMeta":3,"Image":4,"PlaceSearch":5,"Validator":6}]},{},[7])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJzcmMvaHRkb2NzL2pzL0FwcFV0aWwuanMiLCJzcmMvaHRkb2NzL2pzL0ZsYXRwaWNrci5qcyIsInNyYy9odGRvY3MvanMvRm9ybU1ldGEuanMiLCJzcmMvaHRkb2NzL2pzL0ltYWdlLmpzIiwic3JjL2h0ZG9jcy9qcy9QbGFjZVNlYXJjaC5qcyIsInNyYy9odGRvY3MvanMvVmFsaWRhdG9yLmpzIiwic3JjL2h0ZG9jcy9qcy9pbmRleC5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQ0FBOztBQUdBLElBQUksT0FBTyxHQUFHLEVBQWQ7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUNBLE9BQU8sQ0FBQyxVQUFSLEdBQXFCLFVBQVUsSUFBVixFQUFnQjtBQUNuQyxNQUFJLEdBQUo7QUFFQSxFQUFBLEdBQUcsR0FBRyxRQUFRLENBQUMsYUFBVCxDQUF1QixNQUF2QixDQUFOO0FBQ0EsRUFBQSxHQUFHLENBQUMsSUFBSixHQUFXLElBQVg7QUFDQSxFQUFBLEdBQUcsQ0FBQyxHQUFKLEdBQVUsWUFBVjtBQUNBLEVBQUEsR0FBRyxDQUFDLElBQUosR0FBVyxVQUFYO0FBRUEsRUFBQSxRQUFRLENBQUMsSUFBVCxDQUFjLFdBQWQsQ0FBMEIsR0FBMUI7QUFDRCxDQVREO0FBV0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7QUFDQSxPQUFPLENBQUMsU0FBUixHQUFvQixVQUFVLElBQVYsRUFBZ0IsRUFBaEIsRUFBb0I7QUFDdEMsTUFBSSxFQUFKO0FBRUEsRUFBQSxFQUFFLEdBQUcsUUFBUSxDQUFDLGFBQVQsQ0FBdUIsUUFBdkIsQ0FBTDtBQUNBLEVBQUEsRUFBRSxDQUFDLE1BQUgsR0FBWSxFQUFaO0FBQ0EsRUFBQSxFQUFFLENBQUMsR0FBSCxHQUFTLElBQVQ7QUFFQSxFQUFBLFFBQVEsQ0FBQyxJQUFULENBQWMsV0FBZCxDQUEwQixFQUExQjtBQUNELENBUkQ7QUFVQTtBQUNBO0FBQ0E7OztBQUNBLE9BQU8sQ0FBQyxZQUFSLEdBQXVCLFlBQVk7QUFDakMsTUFBSSxDQUFDLE9BQU8sQ0FBQyxTQUFSLENBQWtCLE9BQXZCLEVBQWdDO0FBQUU7QUFDaEMsSUFBQSxPQUFPLENBQUMsU0FBUixDQUFrQixPQUFsQixHQUE0QixPQUFPLENBQUMsU0FBUixDQUFrQixpQkFBbEIsSUFDMUIsT0FBTyxDQUFDLFNBQVIsQ0FBa0IscUJBRHBCO0FBRUQ7O0FBRUQsTUFBSSxDQUFDLE9BQU8sQ0FBQyxTQUFSLENBQWtCLE9BQXZCLEVBQWdDO0FBQzlCLElBQUEsT0FBTyxDQUFDLFNBQVIsQ0FBa0IsT0FBbEIsR0FBNEIsVUFBUyxDQUFULEVBQVk7QUFDdEMsVUFBSSxFQUFFLEdBQUcsSUFBVDs7QUFDQSxVQUFJLENBQUMsUUFBUSxDQUFDLGVBQVQsQ0FBeUIsUUFBekIsQ0FBa0MsRUFBbEMsQ0FBTCxFQUE0QztBQUMxQyxlQUFPLElBQVA7QUFDRDs7QUFDRCxTQUFHO0FBQ0QsWUFBSSxFQUFFLENBQUMsT0FBSCxDQUFXLENBQVgsQ0FBSixFQUFtQjtBQUNqQixpQkFBTyxFQUFQO0FBQ0Q7O0FBQ0QsUUFBQSxFQUFFLEdBQUcsRUFBRSxDQUFDLGFBQUgsSUFBb0IsRUFBRSxDQUFDLFVBQTVCO0FBQ0QsT0FMRCxRQUtTLEVBQUUsS0FBSyxJQUFQLElBQWUsRUFBRSxDQUFDLFFBQUgsS0FBZ0IsQ0FMeEM7O0FBT0EsYUFBTyxJQUFQO0FBQ0QsS0FiRDtBQWNEO0FBQ0YsQ0F0QkQ7O0FBeUJBLE1BQU0sQ0FBQyxPQUFQLEdBQWlCLE9BQWpCOzs7QUNqRUE7QUFDQTs7QUFHQSxJQUFJLE9BQU8sR0FBRyxPQUFPLENBQUMsU0FBRCxDQUFyQjtBQUdBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7OztBQUNBLElBQUksU0FBUyxHQUFHLFNBQVosU0FBWSxDQUFVLE9BQVYsRUFBbUI7QUFDakMsTUFBSSxLQUFKLEVBQ0ksV0FESixFQUdJLEtBSEosRUFJSSxVQUpKLEVBTUksa0JBTkosRUFPSSxZQVBKLEVBUUksV0FSSixFQVNJLFdBVEosRUFVSSxXQVZKOztBQWFBLEVBQUEsS0FBSyxHQUFHLEVBQVI7O0FBRUEsRUFBQSxXQUFXLEdBQUcscUJBQVUsT0FBVixFQUFtQjtBQUMvQixJQUFBLEtBQUssR0FBRyxPQUFPLENBQUMsSUFBaEI7QUFDQSxJQUFBLFVBQVUsR0FBRyxPQUFPLENBQUMsU0FBckI7O0FBRUEsSUFBQSxXQUFXO0FBQ1osR0FMRDtBQU9BO0FBQ0Y7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7O0FBQ0UsRUFBQSxrQkFBa0IsR0FBRyw0QkFBVSxRQUFWLEVBQW9CLENBQXBCLEVBQXVCO0FBQzFDLFFBQUksV0FBSjtBQUVBLElBQUEsV0FBVyxHQUFHLFFBQVEsQ0FBQyxTQUFULENBQW1CLEtBQW5CLENBQWQ7QUFDQSxJQUFBLFdBQVcsQ0FBQyxFQUFaLEdBQWlCLGFBQWEsQ0FBOUI7QUFDQSxJQUFBLFdBQVcsQ0FBQyxJQUFaLEdBQW1CLGFBQWEsQ0FBaEM7QUFDQSxJQUFBLFdBQVcsQ0FBQyxJQUFaLEdBQW1CLFFBQW5CO0FBRUEsSUFBQSxRQUFRLENBQUMsVUFBVCxDQUFvQixXQUFwQixDQUFnQyxXQUFoQztBQUNELEdBVEQ7QUFXQTtBQUNGO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7O0FBQ0UsRUFBQSxZQUFZLEdBQUcsc0JBQVUsRUFBVixFQUFjLENBQWQsRUFBaUI7QUFDOUIsUUFBSSxRQUFKLEVBQ0ksV0FESixFQUVJLEtBRkosRUFHSSxLQUhKLEVBSUksT0FKSixFQUtJLFdBTEo7QUFPQSxJQUFBLEtBQUssR0FBRyxFQUFFLENBQUMsS0FBWDtBQUNBLElBQUEsT0FBTyxHQUFHLEVBQUUsQ0FBQyxNQUFiLENBVDhCLENBVzlCOztBQUNBLElBQUEsV0FBVyxHQUFHLEtBQUssQ0FBQyxzQkFBcEI7QUFDQSxJQUFBLFdBQVcsQ0FBQyxTQUFaLEdBQXdCLEVBQXhCO0FBRUEsSUFBQSxXQUFXLEdBQUcsZUFBZDs7QUFDQSxRQUFJLE9BQU8sQ0FBQyxVQUFaLEVBQXdCO0FBQ3RCLE1BQUEsV0FBVyxHQUFHLGVBQWQ7QUFDRDs7QUFDRCxJQUFBLEtBQUssQ0FBQyxZQUFOLENBQW1CLGFBQW5CLEVBQWtDLFdBQWxDOztBQUVBLFFBQUksT0FBTyxDQUFDLFFBQVosRUFBc0I7QUFBRTtBQUN0QjtBQUNBLE1BQUEsUUFBUSxHQUFHLEtBQUssQ0FBQyxrQkFBakI7QUFDQSxNQUFBLFFBQVEsQ0FBQyxZQUFULENBQXNCLElBQXRCLEVBQTRCLGNBQWMsQ0FBMUM7QUFDQSxNQUFBLFFBQVEsQ0FBQyxZQUFULENBQXNCLGFBQXRCLEVBQXFDLFdBQXJDO0FBRUEsTUFBQSxLQUFLLEdBQUcsUUFBUSxDQUFDLGtCQUFqQjtBQUNBLE1BQUEsS0FBSyxDQUFDLFlBQU4sQ0FBbUIsS0FBbkIsRUFBMEIsY0FBYyxDQUF4QyxFQVBvQixDQVNwQjs7QUFDQSxNQUFBLGtCQUFrQixDQUFDLFFBQUQsRUFBVyxDQUFYLENBQWxCLENBVm9CLENBWXBCOzs7QUFDQSxNQUFBLFVBQVUsQ0FBQyxZQUFYLENBQXdCLEtBQXhCLEVBQStCLFFBQS9CO0FBQ0QsS0FuQzZCLENBcUM5Qjs7O0FBQ0EsSUFBQSxXQUFXLENBQUMsRUFBRCxFQUFLLENBQUwsQ0FBWDtBQUNELEdBdkNEO0FBeUNBO0FBQ0Y7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7QUFDRSxFQUFBLFdBQVcsR0FBRyxxQkFBVSxDQUFWLEVBQWE7QUFDekIsUUFBSSxPQUFKLEVBQ0ksVUFESixDQUR5QixDQUl6Qjs7QUFDQSxJQUFBLFVBQVUsR0FBRyx5QkFBeUIsQ0FBdEM7QUFDQSxJQUFBLE1BQU0sQ0FBQyxVQUFELENBQU47QUFFQSxJQUFBLE9BQU8sR0FBRyxnQkFBZ0IsQ0FBQyxDQUFELENBQTFCLENBUnlCLENBUU07O0FBRS9CLFdBQU8sT0FBUDtBQUNELEdBWEQ7QUFhQTtBQUNGO0FBQ0E7OztBQUNFLEVBQUEsV0FBVyxHQUFHLHVCQUFZO0FBQ3hCLFFBQUksUUFBSixFQUNJLEVBREosRUFFSSxNQUZKLEVBR0ksT0FISjtBQUtBLElBQUEsTUFBTSxHQUFHLEtBQUssQ0FBQyxnQkFBTixDQUF1Qiw2QkFBdkIsQ0FBVDs7QUFFQSxRQUFJLE1BQU0sQ0FBQyxNQUFQLEdBQWdCLENBQXBCLEVBQXVCO0FBQ3JCLE1BQUEsUUFBUSxHQUFHLG9CQUFZO0FBQUU7QUFDdkIsUUFBQSxNQUFNLENBQUMsT0FBUCxDQUFlLFVBQVMsS0FBVCxFQUFnQixLQUFoQixFQUF1QjtBQUNwQztBQUNBLFVBQUEsT0FBTyxHQUFHLFdBQVcsQ0FBQyxLQUFELENBQXJCLENBRm9DLENBRU47O0FBQzlCLFVBQUEsRUFBRSxHQUFHLFNBQVMsQ0FBQyxLQUFELEVBQVEsT0FBUixDQUFkOztBQUNBLFVBQUEsWUFBWSxDQUFDLEVBQUQsRUFBSyxLQUFMLENBQVosQ0FKb0MsQ0FJWDs7QUFDMUIsU0FMRDtBQU1ELE9BUEQ7O0FBU0EsTUFBQSxPQUFPLENBQUMsVUFBUixDQUFtQiwrREFBbkI7QUFDQSxNQUFBLE9BQU8sQ0FBQyxTQUFSLENBQWtCLHdDQUFsQixFQUE0RCxRQUE1RDtBQUNEO0FBQ0YsR0FyQkQ7QUF1QkE7QUFDRjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7OztBQUNFLEVBQUEsV0FBVyxHQUFHLHFCQUFVLEVBQVYsRUFBYyxDQUFkLEVBQWlCO0FBQzdCLFFBQUksUUFBSixFQUNJLFNBREosRUFFSSxHQUZKLEVBR0ksV0FISixFQUlJLEtBSko7QUFNQSxJQUFBLEtBQUssR0FBRyxFQUFFLENBQUMsS0FBWDtBQUNBLElBQUEsR0FBRyxHQUFHLEtBQUssQ0FBQyxPQUFOLENBQWMsVUFBZCxDQUFOO0FBRUEsSUFBQSxFQUFFLENBQUMsTUFBSCxDQUFVLFFBQVYsQ0FBbUIsSUFBbkIsQ0FDRSxZQUFXO0FBQ1QsTUFBQSxRQUFRLEdBQUcsR0FBRyxDQUFDLGFBQUosQ0FBa0IsZUFBZSxDQUFqQyxDQUFYO0FBQ0EsTUFBQSxXQUFXLEdBQUcsR0FBRyxDQUFDLGFBQUosQ0FBa0IsY0FBYyxDQUFoQyxDQUFkLENBRlMsQ0FJVDs7QUFDQSxNQUFBLE1BQU0sQ0FBQyxVQUFQLENBQWtCLFlBQVc7QUFDM0IsWUFBSSxXQUFXLElBQUksUUFBbkIsRUFBNkI7QUFDM0IsVUFBQSxXQUFXLENBQUMsS0FBWixHQUFvQixRQUFRLENBQUMsS0FBN0I7QUFDRDtBQUNGLE9BSkQsRUFJRyxHQUpIO0FBS0QsS0FYSDtBQWNBLElBQUEsRUFBRSxDQUFDLE1BQUgsQ0FBVSxPQUFWLENBQWtCLElBQWxCLENBQ0UsWUFBVztBQUNULE1BQUEsR0FBRyxDQUFDLFNBQUosQ0FBYyxNQUFkLENBQXFCLE1BQXJCOztBQUNBLE1BQUEsVUFBVSxDQUFDLFFBQVgsQ0FBb0IsS0FBcEIsRUFGUyxDQUVtQjs7QUFDN0IsS0FKSDtBQU9BLElBQUEsRUFBRSxDQUFDLE1BQUgsQ0FBVSxNQUFWLENBQWlCLElBQWpCLENBQ0UsWUFBVztBQUNULE1BQUEsR0FBRyxDQUFDLFNBQUosQ0FBYyxHQUFkLENBQWtCLE1BQWxCLEVBRFMsQ0FFVDs7QUFDQSxNQUFBLFNBQVMsR0FBRyxRQUFRLENBQUMsZ0JBQVQsQ0FBMEIscUJBQTFCLENBQVo7QUFDQSxNQUFBLFNBQVMsQ0FBQyxPQUFWLENBQWtCLFVBQVMsUUFBVCxFQUFtQjtBQUNuQyxRQUFBLFFBQVEsQ0FBQyxTQUFULENBQW1CLE1BQW5CLENBQTBCLFNBQTFCLEVBQXFDLE9BQXJDOztBQUNBLFlBQUksR0FBRyxDQUFDLFNBQUosQ0FBYyxRQUFkLENBQXVCLFNBQXZCLENBQUosRUFBdUM7QUFDckMsVUFBQSxRQUFRLENBQUMsU0FBVCxDQUFtQixHQUFuQixDQUF1QixTQUF2QjtBQUNEO0FBQ0YsT0FMRDtBQU1ELEtBWEg7QUFhRCxHQTVDRDs7QUErQ0EsRUFBQSxXQUFXLENBQUMsT0FBRCxDQUFYOztBQUNBLEVBQUEsT0FBTyxHQUFHLElBQVY7QUFDQSxTQUFPLEtBQVA7QUFDRCxDQS9MRDs7QUFrTUEsTUFBTSxDQUFDLE9BQVAsR0FBaUIsU0FBakI7OztBQ3BOQTtBQUdBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFDQSxJQUFJLFFBQVEsR0FBRyxTQUFYLFFBQVcsQ0FBUyxPQUFULEVBQWtCO0FBQy9CLE1BQUksS0FBSixFQUNJLFdBREosRUFHSSxLQUhKLEVBS0ksVUFMSixFQU1JLFNBTkosRUFPSSxXQVBKOztBQVVBLEVBQUEsS0FBSyxHQUFHLEVBQVI7O0FBRUEsRUFBQSxXQUFXLEdBQUcscUJBQVUsT0FBVixFQUFtQjtBQUMvQixJQUFBLEtBQUssR0FBRyxPQUFPLENBQUMsSUFBaEI7O0FBRUEsSUFBQSxXQUFXO0FBQ1osR0FKRDtBQU1BO0FBQ0Y7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7O0FBQ0UsRUFBQSxVQUFVLEdBQUcsc0JBQVc7QUFDdEIsUUFBSSxRQUFKLEVBQ0ksS0FESixFQUVJLE1BRkosRUFHSSxPQUhKO0FBS0EsSUFBQSxNQUFNLEdBQUcsRUFBVDs7QUFFQSxRQUFJLEtBQUosRUFBVztBQUNULE1BQUEsUUFBUSxHQUFHLFFBQVEsQ0FBQyxnQkFBVCxDQUEwQixpQkFBMUIsQ0FBWDtBQUVBLE1BQUEsUUFBUSxDQUFDLE9BQVQsQ0FBaUIsVUFBUyxPQUFULEVBQWtCO0FBQ2pDLFFBQUEsS0FBSyxHQUFHLE9BQU8sQ0FBQyxhQUFSLENBQXNCLDRDQUF0QixDQUFSO0FBQ0EsUUFBQSxNQUFNLENBQUMsSUFBUCxDQUFZLEtBQUssQ0FBQyxFQUFsQjtBQUNELE9BSEQ7QUFJRCxLQVBELE1BT087QUFBRTtBQUNQLE1BQUEsT0FBTyxHQUFHLFFBQVEsQ0FBQyxnQkFBVCxDQUEwQixTQUExQixDQUFWO0FBRUEsTUFBQSxPQUFPLENBQUMsT0FBUixDQUFnQixVQUFTLE1BQVQsRUFBaUI7QUFDL0IsUUFBQSxNQUFNLENBQUMsSUFBUCxDQUFZLE1BQU0sQ0FBQyxFQUFuQjtBQUNELE9BRkQ7QUFHRDs7QUFFRCxXQUFPLE1BQVA7QUFDRCxHQXhCRDtBQTBCQTtBQUNGO0FBQ0E7QUFDQTtBQUNBOzs7QUFDRSxFQUFBLFNBQVMsR0FBRyxxQkFBWTtBQUN0QixRQUFJLE1BQUosRUFDSSxLQURKO0FBR0EsSUFBQSxNQUFNLEdBQUcsVUFBVSxFQUFuQjtBQUNBLElBQUEsS0FBSyxHQUFHLEVBQVI7QUFFQSxJQUFBLE1BQU0sQ0FBQyxPQUFQLENBQWUsVUFBUyxFQUFULEVBQWE7QUFDMUIsVUFBSSxRQUFRLENBQUMsYUFBVCxDQUF1QixpQkFBaUIsRUFBeEMsQ0FBSixFQUFpRDtBQUMvQyxRQUFBLEtBQUssQ0FBQyxJQUFOLENBQVcsRUFBWDtBQUNEO0FBQ0YsS0FKRDtBQU1BLFdBQU8sS0FBUDtBQUNELEdBZEQ7QUFnQkE7QUFDRjtBQUNBOzs7QUFDRSxFQUFBLFdBQVcsR0FBRyx1QkFBVztBQUN2QixRQUFJLE9BQUosRUFDSSxFQURKLEVBRUksSUFGSixFQUdJLEtBSEo7QUFLQSxJQUFBLEtBQUssR0FBRyxTQUFTLEVBQWpCO0FBRUEsSUFBQSxLQUFLLENBQUMsT0FBTixDQUFjLFVBQVMsRUFBVCxFQUFhO0FBQ3pCLE1BQUEsRUFBRSxHQUFHLFFBQVEsQ0FBQyxjQUFULENBQXdCLEVBQXhCLENBQUw7QUFDQSxNQUFBLE9BQU8sR0FBRyxFQUFFLENBQUMsT0FBSCxDQUFXLFVBQVgsQ0FBVjtBQUNBLE1BQUEsSUFBSSxHQUFHLFFBQVEsQ0FBQyxhQUFULENBQXVCLGlCQUFpQixFQUF4QyxDQUFQOztBQUVBLFVBQUksS0FBSixFQUFXO0FBQ1QsUUFBQSxPQUFPLENBQUMsWUFBUixDQUFxQixJQUFyQixFQUEyQixPQUFPLENBQUMsVUFBbkM7QUFDRCxPQUZELE1BRU87QUFBRTtBQUNQLFFBQUEsRUFBRSxDQUFDLFdBQUgsQ0FBZSxJQUFmO0FBQ0Q7QUFDRixLQVZEO0FBV0QsR0FuQkQ7O0FBc0JBLEVBQUEsV0FBVyxDQUFDLE9BQUQsQ0FBWDs7QUFDQSxFQUFBLE9BQU8sR0FBRyxJQUFWO0FBQ0EsU0FBTyxLQUFQO0FBQ0QsQ0FwR0Q7O0FBdUdBLE1BQU0sQ0FBQyxPQUFQLEdBQWlCLFFBQWpCOzs7QUN0SEE7QUFHQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUNBLElBQUksS0FBSyxHQUFHLFNBQVIsS0FBUSxDQUFVLE9BQVYsRUFBbUI7QUFDN0IsTUFBSSxLQUFKLEVBQ0ksV0FESixFQUdJLFVBSEosRUFJSSxXQUpKLEVBS0ksVUFMSixFQU1JLFVBTko7O0FBU0EsRUFBQSxLQUFLLEdBQUcsRUFBUjs7QUFFQSxFQUFBLFdBQVcsR0FBRyxxQkFBVSxPQUFWLEVBQW1CO0FBQy9CLFFBQUksTUFBTSxHQUFHLE9BQU8sQ0FBQyxJQUFSLENBQWEsZ0JBQWIsQ0FBOEIsa0JBQTlCLENBQWI7QUFFQSxJQUFBLE1BQU0sQ0FBQyxPQUFQLENBQWUsVUFBUyxLQUFULEVBQWdCO0FBQzdCLFVBQUksUUFBUSxJQUFSLENBQWEsS0FBSyxDQUFDLFlBQU4sQ0FBbUIsUUFBbkIsQ0FBYixDQUFKLEVBQWdEO0FBQUU7QUFDaEQsUUFBQSxLQUFLLENBQUMsUUFBTixHQUFpQixVQUFqQjtBQUNEO0FBQ0YsS0FKRDtBQUtELEdBUkQ7QUFVQTtBQUNGO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7OztBQUNFLEVBQUEsVUFBVSxHQUFHLG9CQUFVLEVBQVYsRUFBYyxPQUFkLEVBQXVCO0FBQ2xDLFFBQUksT0FBSixFQUNJLEdBREo7QUFHQSxJQUFBLE9BQU8sR0FBRyxXQUFXLENBQUMsRUFBRCxDQUFyQjtBQUNBLElBQUEsR0FBRyxHQUFHLFFBQVEsQ0FBQyxhQUFULENBQXVCLEtBQXZCLENBQU47O0FBRUEsSUFBQSxHQUFHLENBQUMsTUFBSixHQUFhLFlBQVc7QUFDdEIsTUFBQSxPQUFPLENBQUMsWUFBUixDQUFxQixHQUFyQixFQUEwQixPQUFPLENBQUMsVUFBbEM7QUFDRCxLQUZEOztBQUdBLElBQUEsR0FBRyxDQUFDLEdBQUosR0FBVSxPQUFWO0FBQ0QsR0FYRDtBQWFBO0FBQ0Y7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7QUFDRSxFQUFBLFdBQVcsR0FBRyxxQkFBVSxFQUFWLEVBQWM7QUFDMUIsUUFBSSxFQUFFLEdBQUcsUUFBUSxDQUFDLGNBQVQsQ0FBd0IsRUFBeEIsQ0FBVDtBQUVBLFdBQU8sRUFBRSxDQUFDLE9BQUgsQ0FBVyxVQUFYLENBQVA7QUFDRCxHQUpEO0FBTUE7QUFDRjtBQUNBO0FBQ0E7QUFDQTs7O0FBQ0UsRUFBQSxVQUFVLEdBQUcsb0JBQVUsRUFBVixFQUFjO0FBQ3pCLFFBQUksT0FBSixFQUNJLEdBREo7QUFHQSxJQUFBLE9BQU8sR0FBRyxXQUFXLENBQUMsRUFBRCxDQUFyQjtBQUNBLElBQUEsR0FBRyxHQUFHLE9BQU8sQ0FBQyxhQUFSLENBQXNCLEtBQXRCLENBQU47O0FBRUEsUUFBSSxHQUFKLEVBQVM7QUFDUCxNQUFBLEdBQUcsQ0FBQyxVQUFKLENBQWUsV0FBZixDQUEyQixHQUEzQjtBQUNEO0FBQ0YsR0FWRDtBQVlBO0FBQ0Y7QUFDQTtBQUNBO0FBQ0E7OztBQUNFLEVBQUEsVUFBVSxHQUFHLG9CQUFVLENBQVYsRUFBYTtBQUN4QixRQUFJLEtBQUosRUFDSSxNQURKO0FBR0EsSUFBQSxLQUFLLEdBQUcsQ0FBQyxDQUFDLE1BQVY7QUFDQSxJQUFBLE1BQU0sR0FBRyxJQUFJLFVBQUosRUFBVDs7QUFFQSxJQUFBLE1BQU0sQ0FBQyxNQUFQLEdBQWdCLFlBQVc7QUFDekIsTUFBQSxVQUFVLENBQUMsS0FBSyxDQUFDLEVBQVAsQ0FBVjs7QUFDQSxNQUFBLFVBQVUsQ0FBQyxLQUFLLENBQUMsRUFBUCxFQUFXLE1BQU0sQ0FBQyxNQUFsQixDQUFWO0FBQ0QsS0FIRDs7QUFLQSxJQUFBLE1BQU0sQ0FBQyxhQUFQLENBQXFCLEtBQUssQ0FBQyxLQUFOLENBQVksQ0FBWixDQUFyQjtBQUNELEdBYkQ7O0FBZ0JBLEVBQUEsV0FBVyxDQUFDLE9BQUQsQ0FBWDs7QUFDQSxFQUFBLE9BQU8sR0FBRyxJQUFWO0FBQ0EsU0FBTyxLQUFQO0FBQ0QsQ0EvRkQ7O0FBa0dBLE1BQU0sQ0FBQyxPQUFQLEdBQWlCLEtBQWpCOzs7QUNoSEE7QUFDQTs7QUFHQSxJQUFJLE9BQU8sR0FBRyxPQUFPLENBQUMsU0FBRCxDQUFyQjtBQUdBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7QUFDQSxJQUFJLFdBQVcsR0FBRyxTQUFkLFdBQWMsQ0FBVSxPQUFWLEVBQW1CO0FBQ25DLE1BQUksS0FBSixFQUNJLFdBREosRUFHSSxLQUhKLEVBS0ksV0FMSixFQU1JLGdCQU5KOztBQVNBLEVBQUEsS0FBSyxHQUFHLEVBQVI7O0FBRUEsRUFBQSxXQUFXLEdBQUcscUJBQVUsT0FBVixFQUFtQjtBQUMvQixJQUFBLEtBQUssR0FBRyxPQUFPLENBQUMsSUFBaEI7O0FBRUEsSUFBQSxXQUFXO0FBQ1osR0FKRDtBQU1BO0FBQ0Y7QUFDQTs7O0FBQ0UsRUFBQSxXQUFXLEdBQUcsdUJBQVk7QUFDeEIsUUFBSSxZQUFKLEVBQ0ksUUFESixFQUVJLE1BRko7QUFJQSxJQUFBLE1BQU0sR0FBRyxLQUFLLENBQUMsZ0JBQU4sQ0FBdUIsNEJBQXZCLENBQVQ7O0FBRUEsUUFBSSxNQUFNLENBQUMsTUFBUCxHQUFnQixDQUFwQixFQUF1QjtBQUFFO0FBQ3ZCLE1BQUEsUUFBUSxHQUFHLG9CQUFZO0FBQUU7QUFDdkIsUUFBQSxNQUFNLENBQUMsT0FBUCxDQUFlLFVBQVMsS0FBVCxFQUFnQixLQUFoQixFQUF1QjtBQUNwQyxVQUFBLEtBQUssR0FEK0IsQ0FDMUI7O0FBRVYsVUFBQSxZQUFZLEdBQUcsV0FBVyxDQUFDO0FBQ3pCLFlBQUEsR0FBRyxFQUFFLFdBRG9CO0FBRXpCLFlBQUEsU0FBUyxFQUFFLEtBRmM7QUFHekIsWUFBQSxpQkFBaUIsRUFBRTtBQUhNLFdBQUQsQ0FBMUI7QUFLQSxVQUFBLFlBQVksQ0FBQyxFQUFiLENBQWdCLFFBQWhCLEVBQTBCLFVBQVMsQ0FBVCxFQUFZO0FBQUU7QUFDdEMsWUFBQSxnQkFBZ0IsQ0FBQyxDQUFELEVBQUksS0FBSixDQUFoQjtBQUNELFdBRkQ7QUFHQSxVQUFBLFlBQVksQ0FBQyxFQUFiLENBQWdCLE9BQWhCLEVBQXlCLFVBQVMsQ0FBVCxFQUFZO0FBQUU7QUFDckMsWUFBQSxnQkFBZ0IsQ0FBQyxDQUFELEVBQUksS0FBSixDQUFoQjtBQUNELFdBRkQsRUFYb0MsQ0FlcEM7O0FBQ0EsY0FBSSxLQUFLLENBQUMsWUFBTixDQUFtQixVQUFuQixDQUFKLEVBQW9DO0FBQ2xDLFlBQUEsS0FBSyxDQUFDLE9BQU4sQ0FBYyxrQkFBZCxFQUFrQyxTQUFsQyxDQUE0QyxHQUE1QyxDQUFnRCxVQUFoRDtBQUNEO0FBQ0YsU0FuQkQ7QUFvQkQsT0FyQkQ7O0FBdUJBLE1BQUEsT0FBTyxDQUFDLFVBQVIsQ0FBbUIsbUVBQW5CO0FBQ0EsTUFBQSxPQUFPLENBQUMsU0FBUixDQUFrQixrRUFBbEIsRUFBc0YsUUFBdEY7QUFDRDtBQUNGLEdBbENEO0FBb0NBO0FBQ0Y7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7O0FBQ0UsRUFBQSxnQkFBZ0IsR0FBRywwQkFBVSxDQUFWLEVBQWEsQ0FBYixFQUFnQjtBQUNqQyxRQUFJLEVBQUosRUFDSSxNQURKLEVBRUksSUFGSixFQUdJLEtBSEo7QUFLQSxJQUFBLE1BQU0sR0FBRyxDQUNQLE1BRE8sRUFFUCxhQUZPLEVBR1AsUUFITyxFQUlQLFlBSk8sRUFLUCxPQUxPLEVBTVAsUUFOTyxDQUFUO0FBU0EsSUFBQSxNQUFNLENBQUMsT0FBUCxDQUFlLFVBQVMsS0FBVCxFQUFnQjtBQUM3QixNQUFBLElBQUksR0FBRyxLQUFQOztBQUNBLFVBQUksQ0FBQyxHQUFHLENBQVIsRUFBVztBQUNULFFBQUEsSUFBSSxJQUFJLENBQVI7QUFDRDs7QUFFRCxNQUFBLEtBQUssR0FBRyxFQUFSOztBQUNBLFVBQUksQ0FBSixFQUFPO0FBQUU7QUFDUCxZQUFJLEtBQUssS0FBSyxRQUFWLElBQXNCLENBQUMsQ0FBQyxNQUFGLENBQVMsTUFBbkMsRUFBMkM7QUFBRTtBQUMzQyxVQUFBLEtBQUssR0FBRyxDQUFDLENBQUMsTUFBRixDQUFTLE1BQVQsQ0FBZ0IsR0FBaEIsR0FBc0IsSUFBdEIsR0FBNkIsQ0FBQyxDQUFDLE1BQUYsQ0FBUyxNQUFULENBQWdCLEdBQXJEO0FBQ0QsU0FGRCxNQUVPLElBQUksS0FBSyxLQUFLLFFBQWQsRUFBd0I7QUFBRTtBQUMvQixVQUFBLEtBQUssR0FBRyxDQUFDLENBQUMsTUFBRixDQUFTLElBQVQsSUFBaUIsRUFBekI7QUFDRCxTQUZNLE1BRUE7QUFDTCxVQUFBLEtBQUssR0FBRyxDQUFDLENBQUMsTUFBRixDQUFTLEtBQVQsS0FBbUIsRUFBM0I7QUFDRDtBQUNGOztBQUVELE1BQUEsRUFBRSxHQUFHLEtBQUssQ0FBQyxhQUFOLENBQW9CLGlCQUFpQixJQUFqQixHQUF3QixJQUE1QyxDQUFMO0FBQ0EsTUFBQSxFQUFFLENBQUMsS0FBSCxHQUFXLEtBQVg7QUFDRCxLQW5CRDtBQW9CRCxHQW5DRDs7QUFzQ0EsRUFBQSxXQUFXLENBQUMsT0FBRCxDQUFYOztBQUNBLEVBQUEsT0FBTyxHQUFHLElBQVY7QUFDQSxTQUFPLEtBQVA7QUFDRCxDQXhHRDs7QUEyR0EsTUFBTSxDQUFDLE9BQVAsR0FBaUIsV0FBakI7OztBQzVIQTtBQUdBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBQ0EsSUFBSSxTQUFTLEdBQUcsU0FBWixTQUFZLENBQVUsT0FBVixFQUFtQjtBQUNqQyxNQUFJLEtBQUosRUFDSSxXQURKLEVBR0ksWUFISixFQUlJLEtBSkosRUFLSSxPQUxKLEVBTUksUUFOSixFQU9JLGFBUEosRUFRSSxVQVJKLEVBVUksaUJBVkosRUFXSSxZQVhKLEVBWUksU0FaSixFQWFJLGFBYkosRUFjSSxZQWRKOztBQWlCQSxFQUFBLEtBQUssR0FBRyxFQUFSOztBQUVBLEVBQUEsV0FBVyxHQUFHLHFCQUFVLE9BQVYsRUFBbUI7QUFDL0IsSUFBQSxLQUFLLEdBQUcsT0FBTyxDQUFDLElBQWhCOztBQUVBLElBQUEsWUFBWTs7QUFDWixJQUFBLGlCQUFpQjtBQUNsQixHQUxEO0FBT0E7QUFDRjtBQUNBOzs7QUFDRSxFQUFBLGlCQUFpQixHQUFHLDZCQUFZO0FBQzlCLFFBQUksSUFBSjs7QUFFQSxJQUFBLE9BQU8sQ0FBQyxPQUFSLENBQWdCLFVBQVMsS0FBVCxFQUFnQjtBQUM5QixNQUFBLElBQUksR0FBRyxLQUFLLENBQUMsWUFBTixDQUFtQixNQUFuQixDQUFQOztBQUVBLFVBQUksS0FBSyxDQUFDLFlBQU4sQ0FBbUIsV0FBbkIsS0FDQSxLQUFLLENBQUMsWUFBTixDQUFtQixXQUFuQixDQURBLElBRUEsS0FBSyxDQUFDLFlBQU4sQ0FBbUIsU0FBbkIsQ0FGQSxJQUdBLEtBQUssQ0FBQyxZQUFOLENBQW1CLFVBQW5CLENBSEosRUFJRTtBQUNBLFlBQUksSUFBSSxLQUFLLFVBQVQsSUFBdUIsSUFBSSxLQUFLLE9BQXBDLEVBQTZDO0FBQzNDLFVBQUEsS0FBSyxDQUFDLGdCQUFOLENBQXVCLFFBQXZCLEVBQWlDLFlBQVc7QUFBRTtBQUM1QyxZQUFBLEtBQUssQ0FBQyxRQUFOLENBQWUsS0FBZjtBQUNELFdBRkQ7QUFHRCxTQUpELE1BSU87QUFDTCxXQUFDLE1BQUQsRUFBUyxPQUFULEVBQWtCLE9BQWxCLENBQTBCLFVBQVMsR0FBVCxFQUFjO0FBQUU7QUFDeEMsWUFBQSxLQUFLLENBQUMsZ0JBQU4sQ0FBdUIsR0FBdkIsRUFBNEIsWUFBVztBQUNyQyxjQUFBLEtBQUssQ0FBQyxRQUFOLENBQWUsS0FBZjtBQUNELGFBRkQ7QUFHRCxXQUpEO0FBS0Q7QUFDRjtBQUNGLEtBcEJEOztBQXNCQSxJQUFBLFFBQVEsQ0FBQyxPQUFULENBQWlCLFVBQVMsTUFBVCxFQUFpQjtBQUNoQyxVQUFJLE1BQU0sQ0FBQyxZQUFQLENBQW9CLFVBQXBCLENBQUosRUFBcUM7QUFDbkMsU0FBQyxNQUFELEVBQVMsUUFBVCxFQUFtQixPQUFuQixDQUEyQixVQUFTLEdBQVQsRUFBYztBQUFFO0FBQ3pDLFVBQUEsTUFBTSxDQUFDLGdCQUFQLENBQXdCLEdBQXhCLEVBQTZCLFlBQVc7QUFDdEMsWUFBQSxLQUFLLENBQUMsUUFBTixDQUFlLE1BQWY7QUFDRCxXQUZEO0FBR0QsU0FKRDtBQUtEO0FBQ0YsS0FSRDs7QUFVQSxJQUFBLGFBQWEsQ0FBQyxnQkFBZCxDQUErQixPQUEvQixFQUF3QyxVQUFTLENBQVQsRUFBWTtBQUNsRCxNQUFBLENBQUMsQ0FBQyxjQUFGOztBQUNBLE1BQUEsYUFBYTtBQUNkLEtBSEQ7O0FBS0EsSUFBQSxVQUFVLENBQUMsT0FBWCxDQUFtQixVQUFTLFFBQVQsRUFBbUI7QUFDcEMsVUFBSSxRQUFRLENBQUMsWUFBVCxDQUFzQixXQUF0QixLQUNBLFFBQVEsQ0FBQyxZQUFULENBQXNCLFdBQXRCLENBREEsSUFFQSxRQUFRLENBQUMsWUFBVCxDQUFzQixTQUF0QixDQUZBLElBR0EsUUFBUSxDQUFDLFlBQVQsQ0FBc0IsVUFBdEIsQ0FISixFQUlFO0FBQ0EsU0FBQyxNQUFELEVBQVMsT0FBVCxFQUFrQixPQUFsQixDQUEwQixVQUFTLEdBQVQsRUFBYztBQUFFO0FBQ3hDLFVBQUEsUUFBUSxDQUFDLGdCQUFULENBQTBCLEdBQTFCLEVBQStCLFlBQVc7QUFDeEMsWUFBQSxLQUFLLENBQUMsUUFBTixDQUFlLFFBQWY7QUFDRCxXQUZEO0FBR0QsU0FKRDtBQUtEO0FBQ0YsS0FaRDtBQWFELEdBckREO0FBdURBO0FBQ0Y7QUFDQTs7O0FBQ0UsRUFBQSxZQUFZLEdBQUcsd0JBQVk7QUFDekIsSUFBQSxZQUFZLEdBQUcsS0FBSyxDQUFDLGdCQUFOLENBQXVCLDhDQUF2QixDQUFmO0FBRUEsSUFBQSxPQUFPLEdBQUcsS0FBSyxDQUFDLGdCQUFOLENBQXVCLGlEQUF2QixDQUFWO0FBQ0EsSUFBQSxRQUFRLEdBQUcsS0FBSyxDQUFDLGdCQUFOLENBQXVCLFFBQXZCLENBQVg7QUFDQSxJQUFBLFVBQVUsR0FBRyxLQUFLLENBQUMsZ0JBQU4sQ0FBdUIsVUFBdkIsQ0FBYjtBQUNBLElBQUEsYUFBYSxHQUFHLEtBQUssQ0FBQyxhQUFOLENBQW9CLHNCQUFwQixDQUFoQjtBQUNELEdBUEQ7QUFTQTtBQUNGO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7O0FBQ0UsRUFBQSxTQUFTLEdBQUcsbUJBQVUsRUFBVixFQUFjO0FBQ3hCLFFBQUksUUFBSixFQUNJLFNBREosRUFFSSxTQUZKLEVBR0ksSUFISixFQUlJLE9BSkosRUFLSSxLQUxKLEVBTUksSUFOSixFQU9JLEtBUEo7QUFTQSxJQUFBLEtBQUssR0FBRyxPQUFSLENBVndCLENBVVA7O0FBQ2pCLElBQUEsSUFBSSxHQUFHLEVBQUUsQ0FBQyxZQUFILENBQWdCLE1BQWhCLENBQVA7QUFDQSxJQUFBLEtBQUssR0FBRyxFQUFFLENBQUMsS0FBWDs7QUFFQSxRQUFJLElBQUksS0FBSyxVQUFULElBQXVCLElBQUksS0FBSyxPQUFwQyxFQUE2QztBQUFFO0FBQzdDLE1BQUEsSUFBSSxHQUFHLEVBQUUsQ0FBQyxZQUFILENBQWdCLE1BQWhCLENBQVA7QUFDQSxNQUFBLFFBQVEsR0FBRyxLQUFLLENBQUMsZ0JBQU4sQ0FBdUIsaUJBQWlCLElBQWpCLEdBQXdCLElBQS9DLENBQVg7QUFDQSxNQUFBLEtBQUssR0FBRyxTQUFSLENBSDJDLENBR3hCOztBQUVuQixNQUFBLFFBQVEsQ0FBQyxPQUFULENBQWlCLFVBQVMsT0FBVCxFQUFrQjtBQUNqQyxZQUFJLE9BQU8sQ0FBQyxPQUFaLEVBQXFCO0FBQ25CLFVBQUEsS0FBSyxHQUFHLE9BQVI7QUFDRDtBQUNGLE9BSkQ7QUFLRCxLQVZELE1BVU87QUFBRTtBQUNQLFVBQUksRUFBRSxDQUFDLFlBQUgsQ0FBZ0IsV0FBaEIsS0FBZ0MsRUFBRSxDQUFDLFlBQUgsQ0FBZ0IsV0FBaEIsQ0FBcEMsRUFBa0U7QUFDaEUsUUFBQSxTQUFTLEdBQUcsUUFBUSxDQUFDLEVBQUUsQ0FBQyxZQUFILENBQWdCLFdBQWhCLENBQUQsRUFBK0IsRUFBL0IsQ0FBcEI7QUFDQSxRQUFBLFNBQVMsR0FBRyxRQUFRLENBQUMsRUFBRSxDQUFDLFlBQUgsQ0FBZ0IsV0FBaEIsQ0FBRCxFQUErQixFQUEvQixDQUFwQjs7QUFFQSxZQUFJLEVBQUUsQ0FBQyxLQUFILENBQVMsTUFBVCxHQUFrQixTQUFsQixJQUErQixFQUFFLENBQUMsS0FBSCxDQUFTLE1BQVQsR0FBa0IsU0FBckQsRUFBZ0U7QUFDOUQsVUFBQSxLQUFLLEdBQUcsU0FBUjtBQUNEO0FBQ0Y7O0FBQ0QsVUFBSSxFQUFFLENBQUMsWUFBSCxDQUFnQixTQUFoQixDQUFKLEVBQWdDO0FBQzlCLFFBQUEsT0FBTyxHQUFHLElBQUksTUFBSixDQUFXLEVBQUUsQ0FBQyxZQUFILENBQWdCLFNBQWhCLENBQVgsQ0FBVjs7QUFDQSxZQUFJLENBQUMsT0FBTyxDQUFDLElBQVIsQ0FBYSxLQUFiLENBQUQsSUFBd0IsS0FBSyxLQUFLLEVBQXRDLEVBQTBDO0FBQ3hDLFVBQUEsS0FBSyxHQUFHLFNBQVI7QUFDRDtBQUNGOztBQUNELFVBQUksRUFBRSxDQUFDLFlBQUgsQ0FBZ0IsVUFBaEIsS0FBK0IsS0FBSyxLQUFLLEVBQTdDLEVBQWlEO0FBQy9DLFFBQUEsS0FBSyxHQUFHLFNBQVI7QUFDRDtBQUNGOztBQUVELFdBQU8sS0FBUDtBQUNELEdBN0NEO0FBK0NBO0FBQ0Y7QUFDQTs7O0FBQ0UsRUFBQSxhQUFhLEdBQUcseUJBQVk7QUFDMUIsUUFBSSxHQUFKLEVBQ0ksUUFESixFQUVJLGFBRkosRUFHSSxZQUhKO0FBS0EsSUFBQSxHQUFHLEdBQUcsUUFBUSxDQUFDLGFBQVQsQ0FBdUIsVUFBdkIsQ0FBTjtBQUNBLElBQUEsUUFBUSxHQUFHLFFBQVEsQ0FBQyxhQUFULENBQXVCLGVBQXZCLENBQVg7O0FBRUEsSUFBQSxZQUFZOztBQUVaLElBQUEsYUFBYSxHQUFHLEtBQUssQ0FBQyxhQUFOLENBQW9CLFVBQXBCLENBQWhCOztBQUNBLFFBQUksYUFBSixFQUFtQjtBQUFFO0FBQ25CLFVBQUksQ0FBQyxRQUFMLEVBQWU7QUFDYixRQUFBLFFBQVEsR0FBRyxRQUFRLENBQUMsYUFBVCxDQUF1QixHQUF2QixDQUFYO0FBQ0EsUUFBQSxRQUFRLENBQUMsU0FBVCxDQUFtQixHQUFuQixDQUF1QixPQUF2QjtBQUNBLFFBQUEsUUFBUSxDQUFDLFNBQVQsR0FBcUIsNERBQXJCO0FBRUEsUUFBQSxHQUFHLENBQUMsWUFBSixDQUFpQixRQUFqQixFQUEyQixLQUEzQjtBQUNEOztBQUNELE1BQUEsR0FBRyxDQUFDLGNBQUo7QUFDRCxLQVRELE1BU087QUFDTDtBQUNBLFVBQUksUUFBSixFQUFjO0FBQ1osUUFBQSxHQUFHLENBQUMsV0FBSixDQUFnQixRQUFoQjtBQUNELE9BSkksQ0FNTDs7O0FBQ0EsTUFBQSxZQUFZLEdBQUcsUUFBUSxDQUFDLGFBQVQsQ0FBdUIsT0FBdkIsQ0FBZjtBQUNBLE1BQUEsWUFBWSxDQUFDLFlBQWIsQ0FBMEIsTUFBMUIsRUFBa0MsY0FBbEM7QUFDQSxNQUFBLFlBQVksQ0FBQyxZQUFiLENBQTBCLE1BQTFCLEVBQWtDLFFBQWxDO0FBQ0EsTUFBQSxZQUFZLENBQUMsWUFBYixDQUEwQixPQUExQixFQUFtQyxRQUFuQzs7QUFFQSxNQUFBLEtBQUssQ0FBQyxXQUFOLENBQWtCLFlBQWxCOztBQUNBLE1BQUEsS0FBSyxDQUFDLE1BQU47QUFDRDtBQUNGLEdBcENEO0FBc0NBO0FBQ0Y7QUFDQTs7O0FBQ0UsRUFBQSxZQUFZLEdBQUcsd0JBQVk7QUFDekIsSUFBQSxZQUFZLENBQUMsT0FBYixDQUFxQixVQUFTLEVBQVQsRUFBYTtBQUNoQyxVQUFJLEVBQUUsQ0FBQyxZQUFILENBQWdCLFNBQWhCLEtBQThCLEVBQUUsQ0FBQyxZQUFILENBQWdCLFVBQWhCLENBQWxDLEVBQStEO0FBQzdELFFBQUEsS0FBSyxDQUFDLFFBQU4sQ0FBZSxFQUFmO0FBQ0Q7QUFDRixLQUpEO0FBS0QsR0FORCxDQW5NaUMsQ0EyTWpDO0FBQ0E7QUFDQTs7QUFFQTtBQUNGO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7O0FBQ0UsRUFBQSxLQUFLLENBQUMsWUFBTixHQUFxQixVQUFVLEtBQVYsRUFBaUIsUUFBakIsRUFBMkI7QUFDOUMsS0FBQyxNQUFELEVBQVMsT0FBVCxFQUFrQixPQUFsQixDQUEwQixVQUFTLEdBQVQsRUFBYztBQUN0QyxNQUFBLFFBQVEsQ0FBQyxnQkFBVCxDQUEwQixHQUExQixFQUErQixZQUFXO0FBQ3hDLFFBQUEsS0FBSyxDQUFDLFFBQU4sQ0FBZSxLQUFmO0FBQ0QsT0FGRDtBQUdELEtBSkQ7QUFLRCxHQU5EO0FBUUE7QUFDRjtBQUNBO0FBQ0E7QUFDQTs7O0FBQ0UsRUFBQSxLQUFLLENBQUMsUUFBTixHQUFpQixVQUFVLEVBQVYsRUFBYztBQUM3QixRQUFJLFNBQUosRUFDSSxNQURKLEVBRUksS0FGSjtBQUlBLElBQUEsTUFBTSxHQUFHLEVBQUUsQ0FBQyxPQUFILENBQVcsVUFBWCxDQUFUOztBQUNBLFFBQUksTUFBTSxDQUFDLFNBQVAsQ0FBaUIsUUFBakIsQ0FBMEIsVUFBMUIsS0FBeUMsTUFBTSxDQUFDLFNBQVAsQ0FBaUIsUUFBakIsQ0FBMEIsT0FBMUIsQ0FBN0MsRUFBaUY7QUFDL0UsTUFBQSxNQUFNLEdBQUcsTUFBTSxDQUFDLE9BQVAsQ0FBZSxVQUFmLENBQVQ7QUFDRDs7QUFDRCxJQUFBLEtBQUssR0FBRyxTQUFTLENBQUMsRUFBRCxDQUFqQixDQVQ2QixDQVc3Qjs7QUFDQSxRQUFJLEVBQUUsQ0FBQyxZQUFILENBQWdCLFdBQWhCLE1BQWlDLFVBQXJDLEVBQWlEO0FBQy9DO0FBQ0EsVUFBSSxLQUFLLEtBQUssT0FBVixJQUFxQixDQUFDLE1BQU0sQ0FBQyxTQUFQLENBQWlCLFFBQWpCLENBQTBCLE1BQTFCLENBQTFCLEVBQTZEO0FBQzNELFFBQUEsTUFBTSxDQUFDLFNBQVAsQ0FBaUIsTUFBakIsQ0FBd0IsU0FBeEIsRUFBbUMsT0FBbkM7QUFDQSxRQUFBLE1BQU0sQ0FBQyxTQUFQLENBQWlCLEdBQWpCLENBQXFCLEtBQXJCO0FBRUEsUUFBQSxTQUFTLEdBQUcsUUFBUSxDQUFDLGdCQUFULENBQTBCLHFCQUExQixDQUFaO0FBQ0EsUUFBQSxTQUFTLENBQUMsT0FBVixDQUFrQixVQUFTLFFBQVQsRUFBbUI7QUFDbkMsVUFBQSxRQUFRLENBQUMsU0FBVCxDQUFtQixNQUFuQixDQUEwQixTQUExQixFQUFxQyxPQUFyQztBQUNBLFVBQUEsUUFBUSxDQUFDLFNBQVQsQ0FBbUIsR0FBbkIsQ0FBdUIsS0FBdkI7QUFDRCxTQUhEO0FBSUQ7QUFDRixLQVpELE1BWU87QUFDTCxNQUFBLE1BQU0sQ0FBQyxTQUFQLENBQWlCLE1BQWpCLENBQXdCLFNBQXhCLEVBQW1DLE9BQW5DO0FBQ0EsTUFBQSxNQUFNLENBQUMsU0FBUCxDQUFpQixHQUFqQixDQUFxQixLQUFyQjtBQUNEO0FBQ0YsR0E1QkQ7O0FBK0JBLEVBQUEsV0FBVyxDQUFDLE9BQUQsQ0FBWDs7QUFDQSxFQUFBLE9BQU8sR0FBRyxJQUFWO0FBQ0EsU0FBTyxLQUFQO0FBQ0QsQ0F4UUQ7O0FBMlFBLE1BQU0sQ0FBQyxPQUFQLEdBQWlCLFNBQWpCOzs7QUM1UkE7O0FBR0EsSUFBSSxPQUFPLEdBQUcsT0FBTyxDQUFDLFNBQUQsQ0FBckI7QUFBQSxJQUNJLFNBQVMsR0FBRyxPQUFPLENBQUMsV0FBRCxDQUR2QjtBQUFBLElBRUksS0FBSyxHQUFHLE9BQU8sQ0FBQyxPQUFELENBRm5CO0FBQUEsSUFHSSxRQUFRLEdBQUcsT0FBTyxDQUFDLFVBQUQsQ0FIdEI7QUFBQSxJQUlJLFdBQVcsR0FBRyxPQUFPLENBQUMsYUFBRCxDQUp6QjtBQUFBLElBS0ksU0FBUyxHQUFHLE9BQU8sQ0FBQyxXQUFELENBTHZCLEMsQ0FRQTs7O0FBQ0EsUUFBUSxDQUFDLGdCQUFULENBQTBCLGtCQUExQixFQUE4QyxZQUFXO0FBQ3ZELE1BQUksSUFBSixFQUNJLE9BREo7QUFHQSxFQUFBLElBQUksR0FBRyxRQUFRLENBQUMsYUFBVCxDQUF1QixlQUF2QixDQUFQO0FBQ0EsRUFBQSxPQUFPLEdBQUc7QUFDUixJQUFBLElBQUksRUFBRTtBQURFLEdBQVY7QUFJQSxFQUFBLE9BQU8sQ0FBQyxZQUFSO0FBRUEsRUFBQSxRQUFRLENBQUMsT0FBRCxDQUFSOztBQUVBLE1BQUksSUFBSixFQUFVO0FBQ1IsSUFBQSxPQUFPLENBQUMsU0FBUixHQUFvQixTQUFTLENBQUMsT0FBRCxDQUE3QjtBQUVBLElBQUEsU0FBUyxDQUFDLE9BQUQsQ0FBVDtBQUNBLElBQUEsS0FBSyxDQUFDLE9BQUQsQ0FBTDtBQUNBLElBQUEsV0FBVyxDQUFDLE9BQUQsQ0FBWDtBQUNEO0FBQ0YsQ0FwQkQiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbigpe2Z1bmN0aW9uIHIoZSxuLHQpe2Z1bmN0aW9uIG8oaSxmKXtpZighbltpXSl7aWYoIWVbaV0pe3ZhciBjPVwiZnVuY3Rpb25cIj09dHlwZW9mIHJlcXVpcmUmJnJlcXVpcmU7aWYoIWYmJmMpcmV0dXJuIGMoaSwhMCk7aWYodSlyZXR1cm4gdShpLCEwKTt2YXIgYT1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK2krXCInXCIpO3Rocm93IGEuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixhfXZhciBwPW5baV09e2V4cG9ydHM6e319O2VbaV1bMF0uY2FsbChwLmV4cG9ydHMsZnVuY3Rpb24ocil7dmFyIG49ZVtpXVsxXVtyXTtyZXR1cm4gbyhufHxyKX0scCxwLmV4cG9ydHMscixlLG4sdCl9cmV0dXJuIG5baV0uZXhwb3J0c31mb3IodmFyIHU9XCJmdW5jdGlvblwiPT10eXBlb2YgcmVxdWlyZSYmcmVxdWlyZSxpPTA7aTx0Lmxlbmd0aDtpKyspbyh0W2ldKTtyZXR1cm4gb31yZXR1cm4gcn0pKCkiLCIndXNlIHN0cmljdCc7XG5cblxudmFyIEFwcFV0aWwgPSB7fTtcblxuLyoqXG4gKiBBZGQgYSBDU1MgZmlsZSB0byB0aGUgRE9NXG4gKlxuICogQHBhcmFtIGZpbGUge1N0cmluZ31cbiAqL1xuQXBwVXRpbC5hZGRDc3NGaWxlID0gZnVuY3Rpb24gKGZpbGUpIHtcbiAgdmFyIGNzcztcblxuICBjc3MgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdsaW5rJyk7XG4gIGNzcy5ocmVmID0gZmlsZTtcbiAgY3NzLnJlbCA9ICdzdHlsZXNoZWV0JztcbiAgY3NzLnR5cGUgPSAndGV4dC9jc3MnO1xuXG4gIGRvY3VtZW50LmhlYWQuYXBwZW5kQ2hpbGQoY3NzKTtcbn07XG5cbi8qKlxuKiBBZGQgYSBKUyBmaWxlIHRvIHRoZSBET01cbipcbiogQHBhcmFtIGZpbGUge1N0cmluZ31cbiogQHBhcmFtIGNhbGxiYWNrIHtGdW5jdGlvbn1cbiovXG5BcHBVdGlsLmFkZEpzRmlsZSA9IGZ1bmN0aW9uIChmaWxlLCBjYikge1xuICB2YXIganM7XG5cbiAganMgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdzY3JpcHQnKTtcbiAganMub25sb2FkID0gY2I7XG4gIGpzLnNyYyA9IGZpbGU7XG5cbiAgZG9jdW1lbnQuaGVhZC5hcHBlbmRDaGlsZChqcyk7XG59O1xuXG4vKipcbiAqIEFkZCBQb2x5ZmlsbCBmb3IgRWxlbWVudC5jbG9zZXN0KClcbiAqL1xuQXBwVXRpbC5hZGRQb2x5ZmlsbHMgPSBmdW5jdGlvbiAoKSB7XG4gIGlmICghRWxlbWVudC5wcm90b3R5cGUubWF0Y2hlcykgeyAvLyB1c2VkIGluIEVsLmNsb3Nlc3QgcG9seWZpbGxcbiAgICBFbGVtZW50LnByb3RvdHlwZS5tYXRjaGVzID0gRWxlbWVudC5wcm90b3R5cGUubXNNYXRjaGVzU2VsZWN0b3IgfHxcbiAgICAgIEVsZW1lbnQucHJvdG90eXBlLndlYmtpdE1hdGNoZXNTZWxlY3RvcjtcbiAgfVxuXG4gIGlmICghRWxlbWVudC5wcm90b3R5cGUuY2xvc2VzdCkge1xuICAgIEVsZW1lbnQucHJvdG90eXBlLmNsb3Nlc3QgPSBmdW5jdGlvbihzKSB7XG4gICAgICB2YXIgZWwgPSB0aGlzO1xuICAgICAgaWYgKCFkb2N1bWVudC5kb2N1bWVudEVsZW1lbnQuY29udGFpbnMoZWwpKSB7XG4gICAgICAgIHJldHVybiBudWxsO1xuICAgICAgfVxuICAgICAgZG8ge1xuICAgICAgICBpZiAoZWwubWF0Y2hlcyhzKSkge1xuICAgICAgICAgIHJldHVybiBlbDtcbiAgICAgICAgfVxuICAgICAgICBlbCA9IGVsLnBhcmVudEVsZW1lbnQgfHwgZWwucGFyZW50Tm9kZTtcbiAgICAgIH0gd2hpbGUgKGVsICE9PSBudWxsICYmIGVsLm5vZGVUeXBlID09PSAxKTtcblxuICAgICAgcmV0dXJuIG51bGw7XG4gICAgfTtcbiAgfVxufTtcblxuXG5tb2R1bGUuZXhwb3J0cyA9IEFwcFV0aWw7XG4iLCIvKiBnbG9iYWwgZmxhdHBpY2tyLCBmbGF0cGlja3JPcHRpb25zICovXG4ndXNlIHN0cmljdCc7XG5cblxudmFyIEFwcFV0aWwgPSByZXF1aXJlKCdBcHBVdGlsJyk7XG5cblxuLyoqXG4gKiBTZXQgdXAgRmxhdHBpY2tyLCBhIDNyZC1wYXJ0eSBkYXRldGltZSBwaWNrZXIuXG4gKlxuICogQHBhcmFtIG9wdGlvbnMge09iamVjdH1cbiAqICAge1xuICogICAgIGZvcm06IHtFbGVtZW50fSxcbiAqICAgICB2YWxpZGF0b3I6IHtPYmplY3R9XG4gKiAgIH1cbiAqXG4gKiBAcmV0dXJuIF90aGlzIHtPYmplY3R9XG4gKi9cbnZhciBGbGF0cGlja3IgPSBmdW5jdGlvbiAob3B0aW9ucykge1xuICB2YXIgX3RoaXMsXG4gICAgICBfaW5pdGlhbGl6ZSxcblxuICAgICAgX2Zvcm0sXG4gICAgICBfdmFsaWRhdG9yLFxuXG4gICAgICBfYWRkSGlkZGVuQWx0SW5wdXQsXG4gICAgICBfY29uZmlnRmllbGQsXG4gICAgICBfZ2V0T3B0aW9ucyxcbiAgICAgIF9pbml0RmllbGRzLFxuICAgICAgX3NldE9wdGlvbnM7XG5cblxuICBfdGhpcyA9IHt9O1xuXG4gIF9pbml0aWFsaXplID0gZnVuY3Rpb24gKG9wdGlvbnMpIHtcbiAgICBfZm9ybSA9IG9wdGlvbnMuZm9ybTtcbiAgICBfdmFsaWRhdG9yID0gb3B0aW9ucy52YWxpZGF0b3I7XG5cbiAgICBfaW5pdEZpZWxkcygpO1xuICB9O1xuXG4gIC8qKlxuICAgKiBTdG9yZSBhbHRJbnB1dCB2YWx1ZSBpbiBoaWRkZW4gZmllbGQgZm9yIGRpc3BsYXkgaW4gcmVzdWx0cyBzdW1tYXJ5LlxuICAgKlxuICAgKiBAcGFyYW0gYWx0SW5wdXQge0VsZW1lbnR9XG4gICAqIEBwYXJhbSBpIHtJbnRlZ2VyfVxuICAgKi9cbiAgX2FkZEhpZGRlbkFsdElucHV0ID0gZnVuY3Rpb24gKGFsdElucHV0LCBpKSB7XG4gICAgdmFyIGhpZGRlbklucHV0O1xuXG4gICAgaGlkZGVuSW5wdXQgPSBhbHRJbnB1dC5jbG9uZU5vZGUoZmFsc2UpO1xuICAgIGhpZGRlbklucHV0LmlkID0gJ2FsdElucHV0JyArIGk7XG4gICAgaGlkZGVuSW5wdXQubmFtZSA9ICdhbHRJbnB1dCcgKyBpO1xuICAgIGhpZGRlbklucHV0LnR5cGUgPSAnaGlkZGVuJztcblxuICAgIGFsdElucHV0LnBhcmVudE5vZGUuYXBwZW5kQ2hpbGQoaGlkZGVuSW5wdXQpO1xuICB9O1xuXG4gIC8qKlxuICAgKiBBZGRpdGlvbmFsIGNvbmZpZ3VyYXRpb24gbmVjZXNzYXJ5IGZvciBmbGF0cGlja3IgZmllbGRzLlxuICAgKlxuICAgKiBAcGFyYW0gZnAge09iamVjdH1cbiAgICogICAgIGZsYXRwaWNrciBpbnN0YW5jZVxuICAgKiBAcGFyYW0gaSB7SW50ZWdlcn1cbiAgICovXG4gIF9jb25maWdGaWVsZCA9IGZ1bmN0aW9uIChmcCwgaSkge1xuICAgIHZhciBhbHRJbnB1dCxcbiAgICAgICAgZGVzY3JpcHRpb24sXG4gICAgICAgIGlucHV0LFxuICAgICAgICBsYWJlbCxcbiAgICAgICAgb3B0aW9ucyxcbiAgICAgICAgcGxhY2Vob2xkZXI7XG5cbiAgICBpbnB1dCA9IGZwLmlucHV0O1xuICAgIG9wdGlvbnMgPSBmcC5jb25maWc7XG5cbiAgICAvLyBSZW1vdmUgZm9ybWF0IGRlc2NyaXB0b3Igd2hpY2ggaXNuJ3QgbmVjZXNzYXJ5IHdpdGgganMgZW5hYmxlZFxuICAgIGRlc2NyaXB0aW9uID0gaW5wdXQucHJldmlvdXNFbGVtZW50U2libGluZztcbiAgICBkZXNjcmlwdGlvbi5pbm5lclRleHQgPSAnJztcblxuICAgIHBsYWNlaG9sZGVyID0gJ1NlbGVjdCBhIGRhdGUnO1xuICAgIGlmIChvcHRpb25zLm5vQ2FsZW5kYXIpIHtcbiAgICAgIHBsYWNlaG9sZGVyID0gJ1NlbGVjdCBhIHRpbWUnO1xuICAgIH1cbiAgICBpbnB1dC5zZXRBdHRyaWJ1dGUoJ3BsYWNlaG9sZGVyJywgcGxhY2Vob2xkZXIpO1xuXG4gICAgaWYgKG9wdGlvbnMuYWx0SW5wdXQpIHsgLy8gZmxhdHBpY2tyIGFsdElucHV0IChyZWFkYWJsZSBkYXRlKSBmaWVsZFxuICAgICAgLy8gU2V0IHBsYWNlaG9sZGVyIGFuZCByZS1hc3NpZ24gbGFiZWwgdGV4dCBmb3IgYWx0IGlucHV0XG4gICAgICBhbHRJbnB1dCA9IGlucHV0Lm5leHRFbGVtZW50U2libGluZztcbiAgICAgIGFsdElucHV0LnNldEF0dHJpYnV0ZSgnaWQnLCAnZmxhdHBpY2tyJyArIGkpO1xuICAgICAgYWx0SW5wdXQuc2V0QXR0cmlidXRlKCdwbGFjZWhvbGRlcicsIHBsYWNlaG9sZGVyKTtcblxuICAgICAgbGFiZWwgPSBhbHRJbnB1dC5uZXh0RWxlbWVudFNpYmxpbmc7XG4gICAgICBsYWJlbC5zZXRBdHRyaWJ1dGUoJ2ZvcicsICdmbGF0cGlja3InICsgaSk7XG5cbiAgICAgIC8vIFN0b3JlIGFsdElucHV0IHZhbHVlIGZvciBkaXNwbGF5aW5nIGluIHN1bW1hcnkgcmVzdWx0c1xuICAgICAgX2FkZEhpZGRlbkFsdElucHV0KGFsdElucHV0LCBpKTtcblxuICAgICAgLy8gU2V0IHVwIHZhbGlkYXRpb24gZm9yIGFsdCBpbnB1dFxuICAgICAgX3ZhbGlkYXRvci5pbml0QWx0SW5wdXQoaW5wdXQsIGFsdElucHV0KTtcbiAgICB9XG5cbiAgICAvLyBFeHRyYSBvcHRpb25zIGFkZGVkIHRvIGFsbCBmbGF0cGlja3IgaW5zdGFuY2VzXG4gICAgX3NldE9wdGlvbnMoZnAsIGkpO1xuICB9O1xuXG4gIC8qKlxuICAgKiBHZXQgZmxhdHBpY2tyIG9wdGlvbnMgd2hpY2ggYXJlIGVtYmVkZGVkIGlubGluZSB3aXRoaW4gSFRNTC5cbiAgICpcbiAgICogQHBhcmFtIGkge0ludGVnZXJ9XG4gICAqXG4gICAqIEByZXR1cm4gb3B0aW9ucyB7T2JqZWN0fVxuICAgKi9cbiAgX2dldE9wdGlvbnMgPSBmdW5jdGlvbiAoaSkge1xuICAgIHZhciBvcHRpb25zLFxuICAgICAgICBzZXRPcHRpb25zO1xuXG4gICAgLy8gRmlyc3QsIGV4ZWN1dGUgd3JhcHBlciBmdW5jdGlvbiB0byBzZXQgb3B0aW9ucyBub3cgdGhhdCBsaWIgaXMgbG9hZGVkXG4gICAgc2V0T3B0aW9ucyA9ICdpbml0RmxhdHBpY2tyT3B0aW9ucycgKyBpO1xuICAgIHdpbmRvd1tzZXRPcHRpb25zXSgpO1xuXG4gICAgb3B0aW9ucyA9IGZsYXRwaWNrck9wdGlvbnNbaV07IC8vIG9wdGlvbnMgZW1iZWRkZWQgaW4gSFRNTCBhcyBnbG9iYWwgb2JqXG5cbiAgICByZXR1cm4gb3B0aW9ucztcbiAgfTtcblxuICAvKipcbiAgICogSW5pdGlhbGl6ZSBGbGF0cGlja3IuXG4gICAqL1xuICBfaW5pdEZpZWxkcyA9IGZ1bmN0aW9uICgpIHtcbiAgICB2YXIgY2FsbGJhY2ssXG4gICAgICAgIGZwLFxuICAgICAgICBpbnB1dHMsXG4gICAgICAgIG9wdGlvbnM7XG5cbiAgICBpbnB1dHMgPSBfZm9ybS5xdWVyeVNlbGVjdG9yQWxsKCdpbnB1dFtkYXRhLXR5cGU9XCJkYXRldGltZVwiXScpO1xuXG4gICAgaWYgKGlucHV0cy5sZW5ndGggPiAwKSB7XG4gICAgICBjYWxsYmFjayA9IGZ1bmN0aW9uICgpIHsgLy8gaW5pdGlhbGl6ZSBmbGF0cGlja3IgYWZ0ZXIgc2NyaXB0IGlzIGxvYWRlZFxuICAgICAgICBpbnB1dHMuZm9yRWFjaChmdW5jdGlvbihpbnB1dCwgaW5kZXgpIHtcbiAgICAgICAgICAvLyBDcmVhdGUgZmxhdHBpY2tyIGluc3RhbmNlIGFuZCBzZXQgYWRkaXRpb25hbCBvcHRpb25zXG4gICAgICAgICAgb3B0aW9ucyA9IF9nZXRPcHRpb25zKGluZGV4KTsgLy8gdXNlci1zZXQgZmxhdHBpY2tyIG9wdGlvbnNcbiAgICAgICAgICBmcCA9IGZsYXRwaWNrcihpbnB1dCwgb3B0aW9ucyk7XG4gICAgICAgICAgX2NvbmZpZ0ZpZWxkKGZwLCBpbmRleCk7IC8vIGFkZGl0aW9uYWwgY29uZmlndXJhdGlvblxuICAgICAgICB9KTtcbiAgICAgIH07XG5cbiAgICAgIEFwcFV0aWwuYWRkQ3NzRmlsZSgnaHR0cHM6Ly9jZG4uanNkZWxpdnIubmV0L25wbS9mbGF0cGlja3IvZGlzdC9mbGF0cGlja3IubWluLmNzcycpO1xuICAgICAgQXBwVXRpbC5hZGRKc0ZpbGUoJ2h0dHBzOi8vY2RuLmpzZGVsaXZyLm5ldC9ucG0vZmxhdHBpY2tyJywgY2FsbGJhY2spO1xuICAgIH1cbiAgfTtcblxuICAvKipcbiAgICogU2V0IGFkZGl0aW9uYWwgb3B0aW9ucyAoaG9va3MpIGZvciBldmVyeSBmbGF0cGlja3IgaW5zdGFuY2UuXG4gICAqXG4gICAqIEBwYXJhbSBmcCB7T2JqZWN0fVxuICAgKiAgICAgZmxhdHBpY2tyIGluc3RhbmNlXG4gICAqIEBwYXJhbSBpIHtJbnRlZ2VyfVxuICAgKi9cbiAgX3NldE9wdGlvbnMgPSBmdW5jdGlvbiAoZnAsIGkpIHtcbiAgICB2YXIgYWx0SW5wdXQsXG4gICAgICAgIGNhbGVuZGFycyxcbiAgICAgICAgZGl2LFxuICAgICAgICBoaWRkZW5JbnB1dCxcbiAgICAgICAgaW5wdXQ7XG5cbiAgICBpbnB1dCA9IGZwLmlucHV0O1xuICAgIGRpdiA9IGlucHV0LmNsb3Nlc3QoJy5jb250cm9sJyk7XG5cbiAgICBmcC5jb25maWcub25DaGFuZ2UucHVzaChcbiAgICAgIGZ1bmN0aW9uKCkge1xuICAgICAgICBhbHRJbnB1dCA9IGRpdi5xdWVyeVNlbGVjdG9yKCcjZmxhdHBpY2tyJyArIGkpO1xuICAgICAgICBoaWRkZW5JbnB1dCA9IGRpdi5xdWVyeVNlbGVjdG9yKCcjYWx0SW5wdXQnICsgaSk7XG5cbiAgICAgICAgLy8gRmxhdHBpY2tyIGJyaWVmbHkgc2V0cyBhbHRJbnB1dCB2YWx1ZSB0byBjdXJyZW50IHRpbWUgKGJ1Zz8pIC0gYWRkIHNsaWdodCBkZWxheVxuICAgICAgICB3aW5kb3cuc2V0VGltZW91dChmdW5jdGlvbigpIHtcbiAgICAgICAgICBpZiAoaGlkZGVuSW5wdXQgJiYgYWx0SW5wdXQpIHtcbiAgICAgICAgICAgIGhpZGRlbklucHV0LnZhbHVlID0gYWx0SW5wdXQudmFsdWU7XG4gICAgICAgICAgfVxuICAgICAgICB9LCAxMDApO1xuICAgICAgfVxuICAgICk7XG5cbiAgICBmcC5jb25maWcub25DbG9zZS5wdXNoKFxuICAgICAgZnVuY3Rpb24oKSB7XG4gICAgICAgIGRpdi5jbGFzc0xpc3QucmVtb3ZlKCdvcGVuJyk7XG4gICAgICAgIF92YWxpZGF0b3IudmFsaWRhdGUoaW5wdXQpOyAvLyBiZSBjZXJ0YWluIGNvbnRyb2wgaXMgdmFsaWRhdGVkXG4gICAgICB9XG4gICAgKTtcblxuICAgIGZwLmNvbmZpZy5vbk9wZW4ucHVzaChcbiAgICAgIGZ1bmN0aW9uKCkge1xuICAgICAgICBkaXYuY2xhc3NMaXN0LmFkZCgnb3BlbicpO1xuICAgICAgICAvLyBTZXQgaW5pdGlhbCB2YWxpZGF0aW9uIHN0YXRlIG9uIGRhdGVwaWNrZXIgd2lkZ2V0IHdoZW4gb3BlbmVkXG4gICAgICAgIGNhbGVuZGFycyA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoJy5mbGF0cGlja3ItY2FsZW5kYXInKTtcbiAgICAgICAgY2FsZW5kYXJzLmZvckVhY2goZnVuY3Rpb24oY2FsZW5kYXIpIHtcbiAgICAgICAgICBjYWxlbmRhci5jbGFzc0xpc3QucmVtb3ZlKCdpbnZhbGlkJywgJ3ZhbGlkJyk7XG4gICAgICAgICAgaWYgKGRpdi5jbGFzc0xpc3QuY29udGFpbnMoJ2ludmFsaWQnKSkge1xuICAgICAgICAgICAgY2FsZW5kYXIuY2xhc3NMaXN0LmFkZCgnaW52YWxpZCcpO1xuICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgICB9XG4gICAgKTtcbiAgfTtcblxuXG4gIF9pbml0aWFsaXplKG9wdGlvbnMpO1xuICBvcHRpb25zID0gbnVsbDtcbiAgcmV0dXJuIF90aGlzO1xufTtcblxuXG5tb2R1bGUuZXhwb3J0cyA9IEZsYXRwaWNrcjtcbiIsIid1c2Ugc3RyaWN0JztcblxuXG4vKipcbiAqIERpc3BsYXkgaXRlbXMgYXNzb2NpYXRlZCB3aXRoIGEgc3BlY2lmaWMgJ2ZpZWxkJyBpbmxpbmUgZXZlbiB0aG91Z2ggdGhleSBhcmVcbiAqICAgcmVuZGVyZWQgYWZ0ZXIgdGhlIGZvcm0vcmVzdWx0cyBpbiBkaXYuZm9ybS1tZXRhLiBUaGUgaXRlbSB0byBiZSBtb3ZlZFxuICogICBtdXN0IGhhdmUgYSBjc3MgY2xhc3MgdGhhdCBtYXRjaGVzIHRoZSAnaWQnIHZhbHVlIG9mIHRoZSBhc3NvY2lhdGVkIGZpZWxkLlxuICpcbiAqIEBwYXJhbSBvcHRpb25zIHtPYmplY3R9XG4gKiAgIHtcbiAqICAgICBmb3JtOiB7RWxlbWVudH1cbiAqICAgfVxuICpcbiAqIEByZXR1cm4gX3RoaXMge09iamVjdH1cbiAqL1xudmFyIEZvcm1NZXRhID0gZnVuY3Rpb24ob3B0aW9ucykge1xuICB2YXIgX3RoaXMsXG4gICAgICBfaW5pdGlhbGl6ZSxcblxuICAgICAgX2Zvcm0sXG5cbiAgICAgIF9nZXRGaWVsZHMsXG4gICAgICBfZ2V0SXRlbXMsXG4gICAgICBfcGxhY2VJdGVtcztcblxuXG4gIF90aGlzID0ge307XG5cbiAgX2luaXRpYWxpemUgPSBmdW5jdGlvbiAob3B0aW9ucykge1xuICAgIF9mb3JtID0gb3B0aW9ucy5mb3JtO1xuXG4gICAgX3BsYWNlSXRlbXMoKTtcbiAgfTtcblxuICAvKipcbiAgICogR2V0IGFsbCAnZmllbGRzJzogZWl0aGVyIHRoZSBmb3JtIGNvbnRyb2xzIG9yIHJlc3VsdHMgbGlzdC5cbiAgICogICBOb3RlOiByYWRpby9jaGVja2JveCBmb3JtIGlucHV0cyBhcmUgbm90IGN1cnJlbnRseSBzdXBwb3J0ZWRcbiAgICpcbiAgICogQHJldHVybiBmaWVsZHMge0FycmF5fVxuICAgKi9cbiAgX2dldEZpZWxkcyA9IGZ1bmN0aW9uKCkge1xuICAgIHZhciBjb250cm9scyxcbiAgICAgICAgZmllbGQsXG4gICAgICAgIGZpZWxkcyxcbiAgICAgICAgcmVzdWx0cztcblxuICAgIGZpZWxkcyA9IFtdO1xuXG4gICAgaWYgKF9mb3JtKSB7XG4gICAgICBjb250cm9scyA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoJ2Zvcm0gPiAuY29udHJvbCcpO1xuXG4gICAgICBjb250cm9scy5mb3JFYWNoKGZ1bmN0aW9uKGNvbnRyb2wpIHtcbiAgICAgICAgZmllbGQgPSBjb250cm9sLnF1ZXJ5U2VsZWN0b3IoJ2lucHV0Om5vdChbdHlwZT1oaWRkZW5dKSwgc2VsZWN0LCB0ZXh0YXJlYScpO1xuICAgICAgICBmaWVsZHMucHVzaChmaWVsZC5pZCk7XG4gICAgICB9KTtcbiAgICB9IGVsc2UgeyAvLyBkaXNwbGF5aW5nIHJlc3VsdHNcbiAgICAgIHJlc3VsdHMgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKCdkbCA+IGRkJyk7XG5cbiAgICAgIHJlc3VsdHMuZm9yRWFjaChmdW5jdGlvbihyZXN1bHQpIHtcbiAgICAgICAgZmllbGRzLnB1c2gocmVzdWx0LmlkKTtcbiAgICAgIH0pO1xuICAgIH1cblxuICAgIHJldHVybiBmaWVsZHM7XG4gIH07XG5cbiAgLyoqXG4gICAqIEdldCBpdGVtcyB0aGF0IG5lZWQgdG8gYmUgbW92ZWQgaW4gRE9NLlxuICAgKlxuICAgKiBAcmV0dXJuIGl0ZW1zIHtBcnJheX1cbiAgICovXG4gIF9nZXRJdGVtcyA9IGZ1bmN0aW9uICgpIHtcbiAgICB2YXIgZmllbGRzLFxuICAgICAgICBpdGVtcztcblxuICAgIGZpZWxkcyA9IF9nZXRGaWVsZHMoKTtcbiAgICBpdGVtcyA9IFtdO1xuXG4gICAgZmllbGRzLmZvckVhY2goZnVuY3Rpb24oaWQpIHtcbiAgICAgIGlmIChkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcuZm9ybS1tZXRhIC4nICsgaWQpKSB7XG4gICAgICAgIGl0ZW1zLnB1c2goaWQpO1xuICAgICAgfVxuICAgIH0pO1xuXG4gICAgcmV0dXJuIGl0ZW1zO1xuICB9O1xuXG4gIC8qKlxuICAgKiBQbGFjZSBpdGVtcyBpbmxpbmUgbmV4dCB0byBmb3JtIGNvbnRyb2wgb3IgdmFsdWUgaW4gcmVzdWx0cyBsaXN0LlxuICAgKi9cbiAgX3BsYWNlSXRlbXMgPSBmdW5jdGlvbigpIHtcbiAgICB2YXIgY29udHJvbCxcbiAgICAgICAgZWwsXG4gICAgICAgIGl0ZW0sXG4gICAgICAgIGl0ZW1zO1xuXG4gICAgaXRlbXMgPSBfZ2V0SXRlbXMoKTtcblxuICAgIGl0ZW1zLmZvckVhY2goZnVuY3Rpb24oaWQpIHtcbiAgICAgIGVsID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoaWQpO1xuICAgICAgY29udHJvbCA9IGVsLmNsb3Nlc3QoJy5jb250cm9sJyk7XG4gICAgICBpdGVtID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLmZvcm0tbWV0YSAuJyArIGlkKTtcblxuICAgICAgaWYgKF9mb3JtKSB7XG4gICAgICAgIGNvbnRyb2wuaW5zZXJ0QmVmb3JlKGl0ZW0sIGNvbnRyb2wuZmlyc3RDaGlsZCk7XG4gICAgICB9IGVsc2UgeyAvLyBkaXNwbGF5aW5nIHJlc3VsdHNcbiAgICAgICAgZWwuYXBwZW5kQ2hpbGQoaXRlbSk7XG4gICAgICB9XG4gICAgfSk7XG4gIH07XG5cblxuICBfaW5pdGlhbGl6ZShvcHRpb25zKTtcbiAgb3B0aW9ucyA9IG51bGw7XG4gIHJldHVybiBfdGhpcztcbn07XG5cblxubW9kdWxlLmV4cG9ydHMgPSBGb3JtTWV0YTtcbiIsIid1c2Ugc3RyaWN0JztcblxuXG4vKipcbiAqIFNldCB1cCBmaWxlIHR5cGUgPGlucHV0PnMgdG8gc2hvdyBhIHByZXZpZXcgaW1hZ2UgaW5saW5lIHdoZW4gYSB1c2VyIGNob29zZXNcbiAqICAgYW4gaW1hZ2UuXG4gKlxuICogQHBhcmFtIG9wdGlvbnMge09iamVjdH1cbiAqICAge1xuICogICAgIGZvcm06IHtFbGVtZW50fVxuICogICB9XG4gKlxuICogQHJldHVybiBfdGhpcyB7T2JqZWN0fVxuICovXG52YXIgSW1hZ2UgPSBmdW5jdGlvbiAob3B0aW9ucykge1xuICB2YXIgX3RoaXMsXG4gICAgICBfaW5pdGlhbGl6ZSxcblxuICAgICAgX2NyZWF0ZUltZyxcbiAgICAgIF9nZXRDb250cm9sLFxuICAgICAgX3JlbW92ZUltZyxcbiAgICAgIF9zaG93SW1hZ2U7XG5cblxuICBfdGhpcyA9IHt9O1xuXG4gIF9pbml0aWFsaXplID0gZnVuY3Rpb24gKG9wdGlvbnMpIHtcbiAgICB2YXIgaW5wdXRzID0gb3B0aW9ucy5mb3JtLnF1ZXJ5U2VsZWN0b3JBbGwoJ2lucHV0W3R5cGU9ZmlsZV0nKTtcblxuICAgIGlucHV0cy5mb3JFYWNoKGZ1bmN0aW9uKGlucHV0KSB7XG4gICAgICBpZiAoL2ltYWdlLy50ZXN0KGlucHV0LmdldEF0dHJpYnV0ZSgnYWNjZXB0JykpKSB7IC8vIGltYWdlIGZpbGUgdHlwZVxuICAgICAgICBpbnB1dC5vbmNoYW5nZSA9IF9zaG93SW1hZ2U7XG4gICAgICB9XG4gICAgfSk7XG4gIH07XG5cbiAgLyoqXG4gICAqIENyZWF0ZSBhIG5ldyA8aW1nPiBhbmQgYWRkIGl0IHRvIHRoZSBET00uXG4gICAqXG4gICAqIEBwYXJhbSBpZCB7U3RyaW5nfVxuICAgKiBAcGFyYW0gZGF0YVVybCB7U3RyaW5nfVxuICAgKi9cbiAgX2NyZWF0ZUltZyA9IGZ1bmN0aW9uIChpZCwgZGF0YVVybCkge1xuICAgIHZhciBjb250cm9sLFxuICAgICAgICBpbWc7XG5cbiAgICBjb250cm9sID0gX2dldENvbnRyb2woaWQpO1xuICAgIGltZyA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2ltZycpO1xuXG4gICAgaW1nLm9ubG9hZCA9IGZ1bmN0aW9uKCkge1xuICAgICAgY29udHJvbC5pbnNlcnRCZWZvcmUoaW1nLCBjb250cm9sLmZpcnN0Q2hpbGQpO1xuICAgIH07XG4gICAgaW1nLnNyYyA9IGRhdGFVcmw7XG4gIH07XG5cbiAgLyoqXG4gICAqIEdldCB0aGUgY29udHJvbCA8ZGl2PiBhc3NvY2lhdGVkIHdpdGggYW4gPGlucHV0PiBpZC5cbiAgICpcbiAgICogQHBhcmFtIGlkIHtTdHJpbmd9XG4gICAqXG4gICAqIEByZXR1cm4ge0VsZW1lbnR9XG4gICAqL1xuICBfZ2V0Q29udHJvbCA9IGZ1bmN0aW9uIChpZCkge1xuICAgIHZhciBlbCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKGlkKTtcblxuICAgIHJldHVybiBlbC5jbG9zZXN0KCcuY29udHJvbCcpO1xuICB9O1xuXG4gIC8qKlxuICAgKiBSZW1vdmUgYW4gZXhpc3RpbmcgPGltZz4gZnJvbSBET00uXG4gICAqXG4gICAqIEBwYXJhbSBpZCB7U3RyaW5nfVxuICAgKi9cbiAgX3JlbW92ZUltZyA9IGZ1bmN0aW9uIChpZCkge1xuICAgIHZhciBjb250cm9sLFxuICAgICAgICBpbWc7XG5cbiAgICBjb250cm9sID0gX2dldENvbnRyb2woaWQpO1xuICAgIGltZyA9IGNvbnRyb2wucXVlcnlTZWxlY3RvcignaW1nJyk7XG5cbiAgICBpZiAoaW1nKSB7XG4gICAgICBpbWcucGFyZW50Tm9kZS5yZW1vdmVDaGlsZChpbWcpO1xuICAgIH1cbiAgfTtcblxuICAvKipcbiAgICogRGlzcGxheSB1c2VyLXNlbGVjdGVkIGltYWdlIGlubGluZSBiZWxvdyBmaWxlIGlucHV0IGNvbnRyb2wuXG4gICAqXG4gICAqIEBwYXJhbSBlIHtFdmVudH1cbiAgICovXG4gIF9zaG93SW1hZ2UgPSBmdW5jdGlvbiAoZSkge1xuICAgIHZhciBpbnB1dCxcbiAgICAgICAgcmVhZGVyO1xuXG4gICAgaW5wdXQgPSBlLnRhcmdldDtcbiAgICByZWFkZXIgPSBuZXcgRmlsZVJlYWRlcigpO1xuXG4gICAgcmVhZGVyLm9ubG9hZCA9IGZ1bmN0aW9uKCkge1xuICAgICAgX3JlbW92ZUltZyhpbnB1dC5pZCk7XG4gICAgICBfY3JlYXRlSW1nKGlucHV0LmlkLCByZWFkZXIucmVzdWx0KTtcbiAgICB9O1xuXG4gICAgcmVhZGVyLnJlYWRBc0RhdGFVUkwoaW5wdXQuZmlsZXNbMF0pO1xuICB9O1xuXG5cbiAgX2luaXRpYWxpemUob3B0aW9ucyk7XG4gIG9wdGlvbnMgPSBudWxsO1xuICByZXR1cm4gX3RoaXM7XG59O1xuXG5cbm1vZHVsZS5leHBvcnRzID0gSW1hZ2U7XG4iLCIvKiBnbG9iYWwgTUFQUVVFU1RLRVksIHBsYWNlU2VhcmNoICovXG4ndXNlIHN0cmljdCc7XG5cblxudmFyIEFwcFV0aWwgPSByZXF1aXJlKCdBcHBVdGlsJyk7XG5cblxuLyoqXG4gKiBTZXQgdXAgTWFwUXVlc3QgUGxhY2VTZWFyY2guanMsIGEgM3JkLXBhcnR5IGFkZHJlc3MgYXV0b2NvbXBsZXRlIGxpYnJhcnkuXG4gKlxuICogQHBhcmFtIG9wdGlvbnMge09iamVjdH1cbiAqICAge1xuICogICAgIGZvcm06IHtFbGVtZW50fVxuICogICB9XG4gKlxuICogQHJldHVybiBfdGhpcyB7T2JqZWN0fVxuICovXG52YXIgUGxhY2VTZWFyY2ggPSBmdW5jdGlvbiAob3B0aW9ucykge1xuICB2YXIgX3RoaXMsXG4gICAgICBfaW5pdGlhbGl6ZSxcblxuICAgICAgX2Zvcm0sXG5cbiAgICAgIF9pbml0RmllbGRzLFxuICAgICAgX3NldEhpZGRlbkZpZWxkcztcblxuXG4gIF90aGlzID0ge307XG5cbiAgX2luaXRpYWxpemUgPSBmdW5jdGlvbiAob3B0aW9ucykge1xuICAgIF9mb3JtID0gb3B0aW9ucy5mb3JtO1xuXG4gICAgX2luaXRGaWVsZHMoKTtcbiAgfTtcblxuICAvKipcbiAgICogSW5pdGlhbGl6ZSBQbGFjZVNlYXJjaC5cbiAgICovXG4gIF9pbml0RmllbGRzID0gZnVuY3Rpb24gKCkge1xuICAgIHZhciBhZGRyZXNzRmllbGQsXG4gICAgICAgIGNhbGxiYWNrLFxuICAgICAgICBpbnB1dHM7XG5cbiAgICBpbnB1dHMgPSBfZm9ybS5xdWVyeVNlbGVjdG9yQWxsKCdpbnB1dFtkYXRhLXR5cGU9XCJhZGRyZXNzXCJdJyk7XG5cbiAgICBpZiAoaW5wdXRzLmxlbmd0aCA+IDApIHsgLy8gYWRkIGxpYnJhcnkncyBjc3MgYW5kIGpzIHRvIERPTTsgc2V0IHVwIGxpc3RlbmVyc1xuICAgICAgY2FsbGJhY2sgPSBmdW5jdGlvbiAoKSB7IC8vIGluaXRpYWxpemUgUGxhY2VTZWFyY2ggYWZ0ZXIgc2NyaXB0IGlzIGxvYWRlZFxuICAgICAgICBpbnB1dHMuZm9yRWFjaChmdW5jdGlvbihpbnB1dCwgaW5kZXgpIHtcbiAgICAgICAgICBpbmRleCArKzsgLy8gemVyby1iYXNlZCBpbmRleCwgYnV0IHdlIHdhbnQgdG8gc3RhcnQgYXQgMVxuXG4gICAgICAgICAgYWRkcmVzc0ZpZWxkID0gcGxhY2VTZWFyY2goe1xuICAgICAgICAgICAga2V5OiBNQVBRVUVTVEtFWSxcbiAgICAgICAgICAgIGNvbnRhaW5lcjogaW5wdXQsXG4gICAgICAgICAgICB1c2VEZXZpY2VMb2NhdGlvbjogZmFsc2VcbiAgICAgICAgICB9KTtcbiAgICAgICAgICBhZGRyZXNzRmllbGQub24oJ2NoYW5nZScsIGZ1bmN0aW9uKGUpIHsgLy8gc2V0IGhpZGRlbiBmaWVsZHMgdG8gcmV0dXJuZWQgdmFsdWVzXG4gICAgICAgICAgICBfc2V0SGlkZGVuRmllbGRzKGUsIGluZGV4KTtcbiAgICAgICAgICB9KTtcbiAgICAgICAgICBhZGRyZXNzRmllbGQub24oJ2NsZWFyJywgZnVuY3Rpb24oZSkgeyAvLyBjbGVhciBoaWRkZW4gZmllbGRzXG4gICAgICAgICAgICBfc2V0SGlkZGVuRmllbGRzKGUsIGluZGV4KTtcbiAgICAgICAgICB9KTtcblxuICAgICAgICAgIC8vIEFkZCAncmVxdWlyZWQnIGNsYXNzIHRvIHBhcmVudCBmb3IgQ1NTIHRvIGZsYWcgcmVxdWlyZWQgZmllbGQgaW4gVUlcbiAgICAgICAgICBpZiAoaW5wdXQuaGFzQXR0cmlidXRlKCdyZXF1aXJlZCcpKSB7XG4gICAgICAgICAgICBpbnB1dC5jbG9zZXN0KCcubXEtcGxhY2Utc2VhcmNoJykuY2xhc3NMaXN0LmFkZCgncmVxdWlyZWQnKTtcbiAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgICAgfTtcblxuICAgICAgQXBwVXRpbC5hZGRDc3NGaWxlKCdodHRwczovL2FwaS5tcWNkbi5jb20vc2RrL3BsYWNlLXNlYXJjaC1qcy92MS4wLjAvcGxhY2Utc2VhcmNoLmNzcycpO1xuICAgICAgQXBwVXRpbC5hZGRKc0ZpbGUoJ2h0dHBzOi8vYXBpLm1xY2RuLmNvbS9zZGsvcGxhY2Utc2VhcmNoLWpzL3YxLjAuMC9wbGFjZS1zZWFyY2guanMnLCBjYWxsYmFjayk7XG4gICAgfVxuICB9O1xuXG4gIC8qKlxuICAgKiBTdG9yZSBjb25zdGl0dWVudCB2YWx1ZXMgZnJvbSBQbGFjZVNlYXJjaCBBUEkgaW4gaGlkZGVuIGZvcm0gZmllbGRzLlxuICAgKlxuICAgKiBAcGFyYW0gZSB7RXZlbnR9XG4gICAqIEBwYXJhbSBpIHtJbnRlZ2VyfVxuICAgKi9cbiAgX3NldEhpZGRlbkZpZWxkcyA9IGZ1bmN0aW9uIChlLCBpKSB7XG4gICAgdmFyIGVsLFxuICAgICAgICBmaWVsZHMsXG4gICAgICAgIG5hbWUsXG4gICAgICAgIHZhbHVlO1xuXG4gICAgZmllbGRzID0gW1xuICAgICAgJ2NpdHknLFxuICAgICAgJ2NvdW50cnlDb2RlJyxcbiAgICAgICdsYXRsbmcnLFxuICAgICAgJ3Bvc3RhbENvZGUnLFxuICAgICAgJ3N0YXRlJyxcbiAgICAgICdzdHJlZXQnXG4gICAgXTtcblxuICAgIGZpZWxkcy5mb3JFYWNoKGZ1bmN0aW9uKGZpZWxkKSB7XG4gICAgICBuYW1lID0gZmllbGQ7XG4gICAgICBpZiAoaSA+IDEpIHtcbiAgICAgICAgbmFtZSArPSBpO1xuICAgICAgfVxuXG4gICAgICB2YWx1ZSA9ICcnO1xuICAgICAgaWYgKGUpIHsgLy8gZSBpcyBlbXB0eSBpZiB1c2VyIGlzIGNsZWFyaW5nIG91dCBwcmV2aW91cyB2YWx1ZVxuICAgICAgICBpZiAoZmllbGQgPT09ICdsYXRsbmcnICYmIGUucmVzdWx0LmxhdGxuZykgeyAvLyBmbGF0dGVuIGNvb3JkLiBwYWlyXG4gICAgICAgICAgdmFsdWUgPSBlLnJlc3VsdC5sYXRsbmcubGF0ICsgJywgJyArIGUucmVzdWx0LmxhdGxuZy5sbmc7XG4gICAgICAgIH0gZWxzZSBpZiAoZmllbGQgPT09ICdzdHJlZXQnKSB7IC8vIHVzaW5nIGN1c3RvbSBuYW1lIGZvciBmaWVsZCB0aGF0IGRpZmZlcnMgZnJvbSBsaWJyYXJ5XG4gICAgICAgICAgdmFsdWUgPSBlLnJlc3VsdC5uYW1lIHx8ICcnO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHZhbHVlID0gZS5yZXN1bHRbZmllbGRdIHx8ICcnO1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIGVsID0gX2Zvcm0ucXVlcnlTZWxlY3RvcignaW5wdXRbbmFtZT1cIicgKyBuYW1lICsgJ1wiXScpO1xuICAgICAgZWwudmFsdWUgPSB2YWx1ZTtcbiAgICB9KTtcbiAgfTtcblxuXG4gIF9pbml0aWFsaXplKG9wdGlvbnMpO1xuICBvcHRpb25zID0gbnVsbDtcbiAgcmV0dXJuIF90aGlzO1xufTtcblxuXG5tb2R1bGUuZXhwb3J0cyA9IFBsYWNlU2VhcmNoO1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG5cbi8qKlxuICogU2V0IHVwIGNsaWVudC1zaWRlIGZvcm0gdmFsaWRhdGlvbi5cbiAqXG4gKiBAcGFyYW0gb3B0aW9ucyB7T2JqZWN0fVxuICogICB7XG4gKiAgICAgZm9ybToge0VsZW1lbnR9XG4gKiAgIH1cbiAqXG4gKiBAcmV0dXJuIF90aGlzIHtPYmplY3R9XG4gKiAgIHtcbiAqICAgICBpbml0QWx0SW5wdXQ6IHtGdW5jdGlvbn0sXG4gKiAgICAgdmFsaWRhdGU6IHtGdW5jdGlvbn1cbiAqICAgfVxuICovXG52YXIgVmFsaWRhdG9yID0gZnVuY3Rpb24gKG9wdGlvbnMpIHtcbiAgdmFyIF90aGlzLFxuICAgICAgX2luaXRpYWxpemUsXG5cbiAgICAgIF9hbGxDb250cm9scyxcbiAgICAgIF9mb3JtLFxuICAgICAgX2lucHV0cyxcbiAgICAgIF9zZWxlY3RzLFxuICAgICAgX3N1Ym1pdEJ1dHRvbixcbiAgICAgIF90ZXh0YXJlYXMsXG5cbiAgICAgIF9hZGRFdmVudEhhbmRsZXJzLFxuICAgICAgX2dldENvbnRyb2xzLFxuICAgICAgX2dldFN0YXRlLFxuICAgICAgX2hhbmRsZVN1Ym1pdCxcbiAgICAgIF92YWxpZGF0ZUFsbDtcblxuXG4gIF90aGlzID0ge307XG5cbiAgX2luaXRpYWxpemUgPSBmdW5jdGlvbiAob3B0aW9ucykge1xuICAgIF9mb3JtID0gb3B0aW9ucy5mb3JtO1xuXG4gICAgX2dldENvbnRyb2xzKCk7XG4gICAgX2FkZEV2ZW50SGFuZGxlcnMoKTtcbiAgfTtcblxuICAvKipcbiAgICogQWRkIGV2ZW50IGxpc3RlbmVycyB0byBmb3JtIGNvbnRyb2xzIGZvciB2YWxpZGF0aW5nIHVzZXIgaW5wdXQuXG4gICAqL1xuICBfYWRkRXZlbnRIYW5kbGVycyA9IGZ1bmN0aW9uICgpIHtcbiAgICB2YXIgdHlwZTtcblxuICAgIF9pbnB1dHMuZm9yRWFjaChmdW5jdGlvbihpbnB1dCkge1xuICAgICAgdHlwZSA9IGlucHV0LmdldEF0dHJpYnV0ZSgndHlwZScpO1xuXG4gICAgICBpZiAoaW5wdXQuaGFzQXR0cmlidXRlKCdtYXhsZW5ndGgnKSB8fFxuICAgICAgICAgIGlucHV0Lmhhc0F0dHJpYnV0ZSgnbWlubGVuZ3RoJykgfHxcbiAgICAgICAgICBpbnB1dC5oYXNBdHRyaWJ1dGUoJ3BhdHRlcm4nKSB8fFxuICAgICAgICAgIGlucHV0Lmhhc0F0dHJpYnV0ZSgncmVxdWlyZWQnKVxuICAgICAgKSB7XG4gICAgICAgIGlmICh0eXBlID09PSAnY2hlY2tib3gnIHx8IHR5cGUgPT09ICdyYWRpbycpIHtcbiAgICAgICAgICBpbnB1dC5hZGRFdmVudExpc3RlbmVyKCdjaGFuZ2UnLCBmdW5jdGlvbigpIHsgLy8gaW5wdXQgZXZlbnQgYnVnZ3kgZm9yIHJhZGlvL2NoZWNrYm94XG4gICAgICAgICAgICBfdGhpcy52YWxpZGF0ZShpbnB1dCk7XG4gICAgICAgICAgfSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgWydibHVyJywgJ2lucHV0J10uZm9yRWFjaChmdW5jdGlvbihldnQpIHsgLy8gYmx1cjogY2FwdHVyZSBhdXRvY29tcGxldGVkIGZpZWxkc1xuICAgICAgICAgICAgaW5wdXQuYWRkRXZlbnRMaXN0ZW5lcihldnQsIGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICBfdGhpcy52YWxpZGF0ZShpbnB1dCk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0pO1xuXG4gICAgX3NlbGVjdHMuZm9yRWFjaChmdW5jdGlvbihzZWxlY3QpIHtcbiAgICAgIGlmIChzZWxlY3QuaGFzQXR0cmlidXRlKCdyZXF1aXJlZCcpKSB7XG4gICAgICAgIFsnYmx1cicsICdjaGFuZ2UnXS5mb3JFYWNoKGZ1bmN0aW9uKGV2dCkgeyAvLyBibHVyOiBjb25zaXN0ZW50IHdpdGggaW5wdXRcbiAgICAgICAgICBzZWxlY3QuYWRkRXZlbnRMaXN0ZW5lcihldnQsIGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgX3RoaXMudmFsaWRhdGUoc2VsZWN0KTtcbiAgICAgICAgICB9KTtcbiAgICAgICAgfSk7XG4gICAgICB9XG4gICAgfSk7XG5cbiAgICBfc3VibWl0QnV0dG9uLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgZnVuY3Rpb24oZSkge1xuICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgX2hhbmRsZVN1Ym1pdCgpO1xuICAgIH0pO1xuXG4gICAgX3RleHRhcmVhcy5mb3JFYWNoKGZ1bmN0aW9uKHRleHRhcmVhKSB7XG4gICAgICBpZiAodGV4dGFyZWEuaGFzQXR0cmlidXRlKCdtYXhsZW5ndGgnKSB8fFxuICAgICAgICAgIHRleHRhcmVhLmhhc0F0dHJpYnV0ZSgnbWlubGVuZ3RoJykgfHxcbiAgICAgICAgICB0ZXh0YXJlYS5oYXNBdHRyaWJ1dGUoJ3BhdHRlcm4nKSB8fFxuICAgICAgICAgIHRleHRhcmVhLmhhc0F0dHJpYnV0ZSgncmVxdWlyZWQnKVxuICAgICAgKSB7XG4gICAgICAgIFsnYmx1cicsICdpbnB1dCddLmZvckVhY2goZnVuY3Rpb24oZXZ0KSB7IC8vIGJsdXI6IGNvbnNpc3RlbnQgd2l0aCBpbnB1dFxuICAgICAgICAgIHRleHRhcmVhLmFkZEV2ZW50TGlzdGVuZXIoZXZ0LCBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIF90aGlzLnZhbGlkYXRlKHRleHRhcmVhKTtcbiAgICAgICAgICB9KTtcbiAgICAgICAgfSk7XG4gICAgICB9XG4gICAgfSk7XG4gIH07XG5cbiAgLyoqXG4gICAqIEdldCBhIE5vZGVMaXN0IG9mIGZvcm0gY29udHJvbHMgYnkgdHlwZS5cbiAgICovXG4gIF9nZXRDb250cm9scyA9IGZ1bmN0aW9uICgpIHtcbiAgICBfYWxsQ29udHJvbHMgPSBfZm9ybS5xdWVyeVNlbGVjdG9yQWxsKCdpbnB1dDpub3QoW3R5cGU9XCJzdWJtaXRcIl0pLCBzZWxlY3QsIHRleHRhcmVhJyk7XG5cbiAgICBfaW5wdXRzID0gX2Zvcm0ucXVlcnlTZWxlY3RvckFsbCgnaW5wdXQ6bm90KFt0eXBlPVwiaGlkZGVuXCJdKTpub3QoW3R5cGU9XCJzdWJtaXRcIl0pJyk7XG4gICAgX3NlbGVjdHMgPSBfZm9ybS5xdWVyeVNlbGVjdG9yQWxsKCdzZWxlY3QnKTtcbiAgICBfdGV4dGFyZWFzID0gX2Zvcm0ucXVlcnlTZWxlY3RvckFsbCgndGV4dGFyZWEnKTtcbiAgICBfc3VibWl0QnV0dG9uID0gX2Zvcm0ucXVlcnlTZWxlY3RvcignaW5wdXRbdHlwZT1cInN1Ym1pdFwiXScpO1xuICB9O1xuXG4gIC8qKlxuICAgKiBHZXQgdmFsaWRhdGlvbiBzdGF0ZSBvZiBlbGVtZW50LlxuICAgKlxuICAgKiBAcGFyYW0gZWwge0VsZW1lbnR9XG4gICAqXG4gICAqIEByZXR1cm4gc3RhdGUge1N0cmluZ31cbiAgICovXG4gIF9nZXRTdGF0ZSA9IGZ1bmN0aW9uIChlbCkge1xuICAgIHZhciBjb250cm9scyxcbiAgICAgICAgbWF4TGVuZ3RoLFxuICAgICAgICBtaW5MZW5ndGgsXG4gICAgICAgIG5hbWUsXG4gICAgICAgIHBhdHRlcm4sXG4gICAgICAgIHN0YXRlLFxuICAgICAgICB0eXBlLFxuICAgICAgICB2YWx1ZTtcblxuICAgIHN0YXRlID0gJ3ZhbGlkJzsgLy8gZGVmYXVsdCBzdGF0ZTsgc2V0IHRvIGludmFsaWQgaWYgdmFsaWRhdGlvbiBmYWlsc1xuICAgIHR5cGUgPSBlbC5nZXRBdHRyaWJ1dGUoJ3R5cGUnKTtcbiAgICB2YWx1ZSA9IGVsLnZhbHVlO1xuXG4gICAgaWYgKHR5cGUgPT09ICdjaGVja2JveCcgfHwgdHlwZSA9PT0gJ3JhZGlvJykgeyAvLyBjaGVja2JveC9yYWRpbyBpbnB1dFxuICAgICAgbmFtZSA9IGVsLmdldEF0dHJpYnV0ZSgnbmFtZScpO1xuICAgICAgY29udHJvbHMgPSBfZm9ybS5xdWVyeVNlbGVjdG9yQWxsKCdpbnB1dFtuYW1lPVwiJyArIG5hbWUgKyAnXCJdJyk7XG4gICAgICBzdGF0ZSA9ICdpbnZhbGlkJzsgLy8gZmxpcCBkZWZhdWx0XG5cbiAgICAgIGNvbnRyb2xzLmZvckVhY2goZnVuY3Rpb24oY29udHJvbCkge1xuICAgICAgICBpZiAoY29udHJvbC5jaGVja2VkKSB7XG4gICAgICAgICAgc3RhdGUgPSAndmFsaWQnO1xuICAgICAgICB9XG4gICAgICB9KTtcbiAgICB9IGVsc2UgeyAvLyBldmVyeXRoaW5nIGVsc2VcbiAgICAgIGlmIChlbC5oYXNBdHRyaWJ1dGUoJ21pbmxlbmd0aCcpIHx8IGVsLmhhc0F0dHJpYnV0ZSgnbWF4bGVuZ3RoJykpIHtcbiAgICAgICAgbWF4TGVuZ3RoID0gcGFyc2VJbnQoZWwuZ2V0QXR0cmlidXRlKCdtYXhMZW5ndGgnKSwgMTApO1xuICAgICAgICBtaW5MZW5ndGggPSBwYXJzZUludChlbC5nZXRBdHRyaWJ1dGUoJ21pbkxlbmd0aCcpLCAxMCk7XG5cbiAgICAgICAgaWYgKGVsLnZhbHVlLmxlbmd0aCA8IG1pbkxlbmd0aCB8fCBlbC52YWx1ZS5sZW5ndGggPiBtYXhMZW5ndGgpIHtcbiAgICAgICAgICBzdGF0ZSA9ICdpbnZhbGlkJztcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgaWYgKGVsLmhhc0F0dHJpYnV0ZSgncGF0dGVybicpKSB7XG4gICAgICAgIHBhdHRlcm4gPSBuZXcgUmVnRXhwKGVsLmdldEF0dHJpYnV0ZSgncGF0dGVybicpKTtcbiAgICAgICAgaWYgKCFwYXR0ZXJuLnRlc3QodmFsdWUpICYmIHZhbHVlICE9PSAnJykge1xuICAgICAgICAgIHN0YXRlID0gJ2ludmFsaWQnO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICBpZiAoZWwuaGFzQXR0cmlidXRlKCdyZXF1aXJlZCcpICYmIHZhbHVlID09PSAnJykge1xuICAgICAgICBzdGF0ZSA9ICdpbnZhbGlkJztcbiAgICAgIH1cbiAgICB9XG5cbiAgICByZXR1cm4gc3RhdGU7XG4gIH07XG5cbiAgLyoqXG4gICAqIFNob3cgdmFsaWRhdGlvbiBlcnJvcnMgb3Igc3VibWl0IGZvcm0gZGVwZW5kaW5nIG9uIHZhbGlkYXRpb24gc3RhdGUuXG4gICAqL1xuICBfaGFuZGxlU3VibWl0ID0gZnVuY3Rpb24gKCkge1xuICAgIHZhciBkaXYsXG4gICAgICAgIGVycm9yTXNnLFxuICAgICAgICBpc0Zvcm1JbnZhbGlkLFxuICAgICAgICBzdWJtaXRCdXR0b247XG5cbiAgICBkaXYgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCdkaXYuZm9ybScpO1xuICAgIGVycm9yTXNnID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLmZvcm0gcC5lcnJvcicpO1xuXG4gICAgX3ZhbGlkYXRlQWxsKCk7XG5cbiAgICBpc0Zvcm1JbnZhbGlkID0gX2Zvcm0ucXVlcnlTZWxlY3RvcignLmludmFsaWQnKTtcbiAgICBpZiAoaXNGb3JtSW52YWxpZCkgeyAvLyBzdG9wIGZvcm0gc3VibWlzc2lvbiBhbmQgYWxlcnQgdXNlclxuICAgICAgaWYgKCFlcnJvck1zZykge1xuICAgICAgICBlcnJvck1zZyA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ3AnKTtcbiAgICAgICAgZXJyb3JNc2cuY2xhc3NMaXN0LmFkZCgnZXJyb3InKTtcbiAgICAgICAgZXJyb3JNc2cuaW5uZXJIVE1MID0gJ1BsZWFzZSBmaXggdGhlIGZvbGxvd2luZyBlcnJvcnMgYW5kIHN1Ym1pdCB0aGUgZm9ybSBhZ2Fpbi4nO1xuXG4gICAgICAgIGRpdi5pbnNlcnRCZWZvcmUoZXJyb3JNc2csIF9mb3JtKTtcbiAgICAgIH1cbiAgICAgIGRpdi5zY3JvbGxJbnRvVmlldygpO1xuICAgIH0gZWxzZSB7XG4gICAgICAvLyBSZW1vdmUgZXJyb3IgbWVzc2FnZSBpZiBpdCBleGlzdHNcbiAgICAgIGlmIChlcnJvck1zZykge1xuICAgICAgICBkaXYucmVtb3ZlQ2hpbGQoZXJyb3JNc2cpO1xuICAgICAgfVxuXG4gICAgICAvLyBTdWJtaXQgYnV0dG9uIGlzIG5vdCBzZXQgd2hlbiBmb3JtIGlzIHN1Ym1pdHRlZCB2aWEganM7IHNldCBpdCBoZXJlXG4gICAgICBzdWJtaXRCdXR0b24gPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdpbnB1dCcpO1xuICAgICAgc3VibWl0QnV0dG9uLnNldEF0dHJpYnV0ZSgnbmFtZScsICdzdWJtaXRidXR0b24nKTtcbiAgICAgIHN1Ym1pdEJ1dHRvbi5zZXRBdHRyaWJ1dGUoJ3R5cGUnLCAnaGlkZGVuJyk7XG4gICAgICBzdWJtaXRCdXR0b24uc2V0QXR0cmlidXRlKCd2YWx1ZScsICdTdWJtaXQnKTtcblxuICAgICAgX2Zvcm0uYXBwZW5kQ2hpbGQoc3VibWl0QnV0dG9uKTtcbiAgICAgIF9mb3JtLnN1Ym1pdCgpO1xuICAgIH1cbiAgfTtcblxuICAvKipcbiAgICogVmFsaWRhdGUgYWxsIGZvcm0gY29udHJvbHMgKHVzZWZ1bCB3aGVuIHVzZXIgc3VibWl0cyB0aGUgZm9ybSkuXG4gICAqL1xuICBfdmFsaWRhdGVBbGwgPSBmdW5jdGlvbiAoKSB7XG4gICAgX2FsbENvbnRyb2xzLmZvckVhY2goZnVuY3Rpb24oZWwpIHtcbiAgICAgIGlmIChlbC5oYXNBdHRyaWJ1dGUoJ3BhdHRlcm4nKSB8fCBlbC5oYXNBdHRyaWJ1dGUoJ3JlcXVpcmVkJykpIHtcbiAgICAgICAgX3RoaXMudmFsaWRhdGUoZWwpO1xuICAgICAgfVxuICAgIH0pO1xuICB9O1xuXG4gIC8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiAgLy8gUHVibGljIG1ldGhvZHNcbiAgLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuXG4gIC8qKlxuICAgKiBTZXQgdXAgdmFsaWRhdGlvbiBmb3IgZmxhdHBpY2tyIGFsdElucHV0IGZpZWxkcywgd2hpY2ggZGlzcGxheSBhIGh1bWFuLVxuICAgKiAgIHJlYWRhYmxlIGRhdGUgaW4gYSBzZXBhcmF0ZSBmaWVsZCB3aGlsZSByZXR1cm5pbmcgYSBkaWZmZXJlbnQgdmFsdWVcbiAgICogICB0byB0aGUgc2VydmVyIGluIHRoZSBvcmlnaW5hbCBmaWVsZC5cbiAgICpcbiAgICogQHBhcmFtIGlucHV0IHtFbGVtZW50fVxuICAgKiAgICAgb3JpZ2luYWwgPGlucHV0PiBlbGVtZW50XG4gICAqIEBwYXJhbSBhbHRJbnB1dCB7RWxlbWVudH1cbiAgICogICAgIG5ldyA8aW5wdXQ+IGVsZW1lbnRcbiAgICovXG4gIF90aGlzLmluaXRBbHRJbnB1dCA9IGZ1bmN0aW9uIChpbnB1dCwgYWx0SW5wdXQpIHtcbiAgICBbJ2JsdXInLCAnaW5wdXQnXS5mb3JFYWNoKGZ1bmN0aW9uKGV2dCkge1xuICAgICAgYWx0SW5wdXQuYWRkRXZlbnRMaXN0ZW5lcihldnQsIGZ1bmN0aW9uKCkge1xuICAgICAgICBfdGhpcy52YWxpZGF0ZShpbnB1dCk7XG4gICAgICB9KTtcbiAgICB9KTtcbiAgfTtcblxuICAvKipcbiAgICogVmFsaWRhdGUgdXNlciBpbnB1dCBvbiBhIGdpdmVuIGVsZW1lbnQuXG4gICAqXG4gICAqIEBwYXJhbSBlbCB7RWxlbWVudH1cbiAgICovXG4gIF90aGlzLnZhbGlkYXRlID0gZnVuY3Rpb24gKGVsKSB7XG4gICAgdmFyIGNhbGVuZGFycyxcbiAgICAgICAgcGFyZW50LFxuICAgICAgICBzdGF0ZTtcblxuICAgIHBhcmVudCA9IGVsLmNsb3Nlc3QoJy5jb250cm9sJyk7XG4gICAgaWYgKHBhcmVudC5jbGFzc0xpc3QuY29udGFpbnMoJ2NoZWNrYm94JykgfHwgcGFyZW50LmNsYXNzTGlzdC5jb250YWlucygncmFkaW8nKSkge1xuICAgICAgcGFyZW50ID0gcGFyZW50LmNsb3Nlc3QoJ2ZpZWxkc2V0Jyk7XG4gICAgfVxuICAgIHN0YXRlID0gX2dldFN0YXRlKGVsKTtcblxuICAgIC8vIFNldCB2YWxpZGF0aW9uIHN0YXRlIG9uIHBhcmVudCBub2RlIGFuZCBhbnkgZGF0ZXBpY2tlciB3aWRnZXQocylcbiAgICBpZiAoZWwuZ2V0QXR0cmlidXRlKCdkYXRhLXR5cGUnKSA9PT0gJ2RhdGV0aW1lJykge1xuICAgICAgLy8gRG9uJ3QgY2hhbmdlIHN0YXRlIHRvIGludmFsaWQgd2hpbGUgdXNlciBpcyBpbnRlcmFjdGluZyB3aXRoIGRhdGVwaWNrZXIgd2lkZ2V0XG4gICAgICBpZiAoc3RhdGUgPT09ICd2YWxpZCcgfHwgIXBhcmVudC5jbGFzc0xpc3QuY29udGFpbnMoJ29wZW4nKSkge1xuICAgICAgICBwYXJlbnQuY2xhc3NMaXN0LnJlbW92ZSgnaW52YWxpZCcsICd2YWxpZCcpO1xuICAgICAgICBwYXJlbnQuY2xhc3NMaXN0LmFkZChzdGF0ZSk7XG5cbiAgICAgICAgY2FsZW5kYXJzID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbCgnLmZsYXRwaWNrci1jYWxlbmRhcicpO1xuICAgICAgICBjYWxlbmRhcnMuZm9yRWFjaChmdW5jdGlvbihjYWxlbmRhcikge1xuICAgICAgICAgIGNhbGVuZGFyLmNsYXNzTGlzdC5yZW1vdmUoJ2ludmFsaWQnLCAndmFsaWQnKTtcbiAgICAgICAgICBjYWxlbmRhci5jbGFzc0xpc3QuYWRkKHN0YXRlKTtcbiAgICAgICAgfSk7XG4gICAgICB9XG4gICAgfSBlbHNlIHtcbiAgICAgIHBhcmVudC5jbGFzc0xpc3QucmVtb3ZlKCdpbnZhbGlkJywgJ3ZhbGlkJyk7XG4gICAgICBwYXJlbnQuY2xhc3NMaXN0LmFkZChzdGF0ZSk7XG4gICAgfVxuICB9O1xuXG5cbiAgX2luaXRpYWxpemUob3B0aW9ucyk7XG4gIG9wdGlvbnMgPSBudWxsO1xuICByZXR1cm4gX3RoaXM7XG59O1xuXG5cbm1vZHVsZS5leHBvcnRzID0gVmFsaWRhdG9yO1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG5cbnZhciBBcHBVdGlsID0gcmVxdWlyZSgnQXBwVXRpbCcpLFxuICAgIEZsYXRwaWNrciA9IHJlcXVpcmUoJ0ZsYXRwaWNrcicpLFxuICAgIEltYWdlID0gcmVxdWlyZSgnSW1hZ2UnKSxcbiAgICBGb3JtTWV0YSA9IHJlcXVpcmUoJ0Zvcm1NZXRhJyksXG4gICAgUGxhY2VTZWFyY2ggPSByZXF1aXJlKCdQbGFjZVNlYXJjaCcpLFxuICAgIFZhbGlkYXRvciA9IHJlcXVpcmUoJ1ZhbGlkYXRvcicpO1xuXG5cbi8vIEluaXRpYWxpemVcbmRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ0RPTUNvbnRlbnRMb2FkZWQnLCBmdW5jdGlvbigpIHtcbiAgdmFyIGZvcm0sXG4gICAgICBvcHRpb25zO1xuXG4gIGZvcm0gPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCdkaXYuZm9ybSBmb3JtJyk7XG4gIG9wdGlvbnMgPSB7XG4gICAgZm9ybTogZm9ybVxuICB9O1xuXG4gIEFwcFV0aWwuYWRkUG9seWZpbGxzKCk7XG5cbiAgRm9ybU1ldGEob3B0aW9ucyk7XG5cbiAgaWYgKGZvcm0pIHtcbiAgICBvcHRpb25zLnZhbGlkYXRvciA9IFZhbGlkYXRvcihvcHRpb25zKTtcblxuICAgIEZsYXRwaWNrcihvcHRpb25zKTtcbiAgICBJbWFnZShvcHRpb25zKTtcbiAgICBQbGFjZVNlYXJjaChvcHRpb25zKTtcbiAgfVxufSk7XG4iXX0=
