/* global MAPQUESTKEY, placeSearch */
'use strict';


var AppUtil = require('AppUtil');


/**
 * Set up MapQuest PlaceSearch.js, a 3rd-party address-autocomplete library.
 *
 * @param options {Object}
 *   {
 *     form: {Element}
 *   }
 */
var PlaceSearch = function (options) {
  var _initialize,

      _form,

      _initFields,
      _setHiddenFields;


  _initialize = function (options) {
    _form = options.form;

    _initFields();
  };

  /**
   * Initialize PlaceSearch on address <input> fields.
   */
  _initFields = function () {
    var addressField,
        callback,
        inputs;

    inputs = _form.querySelectorAll('input[data-type="address"]');

    if (inputs.length > 0) {
      callback = function () { // initialize PlaceSearch after script is loaded
        inputs.forEach(function(input, index) {
          addressField = placeSearch({
            key: MAPQUESTKEY,
            container: input,
            useDeviceLocation: false
          });
          index ++; // zero-based index, but we want to start at 1

          addressField.on('change', function(e) {
            _setHiddenFields(e, index); // set hidden fields to returned values
          });
          addressField.on('clear', function(e) {
            _setHiddenFields(e, index); // clear hidden fields
          });

          // Add 'required' class to parent for CSS to flag required field in UI
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
      value = '';

      if (i > 1) {
        name += i;
      }

      el = _form.querySelector('input[name="' + name + '"]');

      if (e) { // e is empty if user is clearing out previous value
        if (field === 'latlng' && e.result.latlng) { // flatten coord. pair
          value = e.result.latlng.lat + ', ' + e.result.latlng.lng;
        } else if (field === 'street') { // using custom name for field that differs from library
          value = e.result.name || '';
        } else {
          value = e.result[field] || '';
        }
      }

      el.value = value;
    });
  };


  _initialize(options);
  options = null;
};


module.exports = PlaceSearch;
