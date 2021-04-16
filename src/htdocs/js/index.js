'use strict';


var AppUtil = require('AppUtil'),
    Flatpickr = require('Flatpickr'),
    Image = require('Image'),
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

  if (form) {
    options.validator = Validator(options);

    Flatpickr(options);
    Image(options);
    PlaceSearch(options);
  }
});
