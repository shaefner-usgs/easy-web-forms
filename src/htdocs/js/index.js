'use strict';


var AppUtil = require('AppUtil'),
    Flatpickr = require('Flatpickr'),
    MapQuestPlaceSearch = require('MapQuestPlaceSearch'),
    Validator = require('Validator');


// Initialize
document.addEventListener('DOMContentLoaded', function() {
  var options = {
    form: document.querySelector('section.form form')
  };

  AppUtil.addPolyfills();

  options.validator = Validator(options);

  MapQuestPlaceSearch(options);
  Flatpickr(options);
});
