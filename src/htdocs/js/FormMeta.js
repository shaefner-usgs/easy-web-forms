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
var FormMeta = function(options) {
  var _this,
      _initialize,

      _form,

      _getFields,
      _getItems,
      _placeItems;


  _this = {};

  _initialize = function (options) {
    _form = options.form;

    _placeItems();
  };

  /**
   * Get all 'fields': either the form controls or results list.
   *   Note: radio/checkbox form inputs are not currently supported
   *
   * @return fields {Array}
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
   * Get items that need to be moved in DOM.
   *
   * @return items {Array}
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
   * Place items inline next to form control or value in results list.
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
  return _this;
};


module.exports = FormMeta;
