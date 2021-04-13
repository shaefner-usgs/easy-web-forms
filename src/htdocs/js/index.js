'use strict';


var AppUtil = require('AppUtil'),
    Flatpickr = require('Flatpickr'),
    PlaceSearch = require('PlaceSearch'),
    Validator = require('Validator');


// Initialize
document.addEventListener('DOMContentLoaded', function() {
  var options = {
    form: document.querySelector('section.form form')
  };

  AppUtil.addPolyfills();

  options.validator = Validator(options);

  PlaceSearch(options);
  Flatpickr(options);
});
