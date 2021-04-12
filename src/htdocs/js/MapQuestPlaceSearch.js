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
   * Initialize PlaceSearch.
   */
  _initAddressFields = function () {
    var addressField,
        callback,
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
      if (i > 1) {
        name += i;
      }

      value = '';
      if (e) { // e is empty if user is clearing out previous value
        if (field === 'latlng' && e.result.latlng) { // flatten coord. pair
          value = e.result.latlng.lat + ', ' + e.result.latlng.lng;
        } else if (field === 'street') { // using custom name for field that differs from library
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


module.exports = MapQuestPlaceSearch;
