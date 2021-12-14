'use strict';


/**
 * Display items associated with a specific 'field' inline even though they are
 * rendered after the form/results. The item (node) you want to move must be
 * nested in a div with the class 'form-meta' have a css class that matches the
 * 'id' value of the associated field.
 *
 * @param options {Object}
 *   {
 *     form: {Element}
 *   }
 */
var FormMeta = function(options) {
  var _initialize,

      _form,

      _getFields,
      _getItems,
      _placeItems;


  _initialize = function (options) {
    _form = options.form;

    _placeItems();
  };

  /**
   * Get all 'fields': either the form controls or results list.
   *
   * Note: radio/checkbox inputs (form controls) are not currently supported.
   *
   * @return fields {Array}
   *     id values
   */
  _getFields = function() {
    var controls,
        field,
        fields,
        results;

    fields = [];

    if (_form) {
      controls = document.querySelectorAll('form > .control');

      controls.forEach(function(control) {
        field = control.querySelector('input:not([type=hidden]), select, textarea');
        fields.push(field.id);
      });
    } else { // displaying results
      results = document.querySelectorAll('dl > dd');

      results.forEach(function(result) {
        fields.push(result.id);
      });
    }

    return fields;
  };

  /**
   * Get the items that need to be moved in the DOM.
   *
   * @return items {Array}
   *     id (className) values
   */
  _getItems = function () {
    var fields,
        items;

    fields = _getFields();
    items = [];

    fields.forEach(function(id) {
      if (document.querySelector('.form-meta .' + id)) {
        items.push(id);
      }
    });

    return items;
  };

  /**
   * Place the items inline next to the form control or value in results list.
   */
  _placeItems = function() {
    var control,
        el,
        item,
        items;

    items = _getItems();

    items.forEach(function(id) {
      el = document.getElementById(id);
      control = el.closest('.control');
      item = document.querySelector('.form-meta .' + id);

      if (_form) {
        control.insertBefore(item, control.firstChild);
      } else { // displaying results
        el.appendChild(item);
      }
    });
  };


  _initialize(options);
  options = null;
};


module.exports = FormMeta;
