'use strict';


var AppUtil = require('AppUtil'),
    Flatpickr = require('Flatpickr'),
    FormMeta = require('FormMeta'),
    PlaceSearch = require('PlaceSearch'),
    Validator = require('Validator');


// Initialize
document.addEventListener('DOMContentLoaded', function() {
  var form,
      options;

  form = document.querySelector('div.form form');
  options = {
    form: form
  };

  AppUtil.addPolyfills();

  if (form) {
    options.validator = Validator(options);

    Flatpickr(options);
    PlaceSearch(options);
  }

  FormMeta(options);
});
