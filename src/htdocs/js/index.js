'use strict';


var AppUtil = require('AppUtil'),
    File = require('File'),
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

  FormMeta(options);

  if (form) { // displaying form (not results)
    options.validator = Validator(options);

    File(options);
    Flatpickr(options);
    PlaceSearch(options);
  }
});
