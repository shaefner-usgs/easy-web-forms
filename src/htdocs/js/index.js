'use strict';


var AppUtil = require('AppUtil'),
    Flatpickr = require('Flatpickr'),
    FormMeta = require('FormMeta'),
    Image = require('Image'),
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

    Flatpickr(options);
    Image(options);
    PlaceSearch(options);
  }
});
