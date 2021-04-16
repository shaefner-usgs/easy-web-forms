'use strict';


/**
 * Set up file type <input>s to show a preview image inline when a user chooses
 *   an image.
 *
 * @param options {Object}
 *   {
 *     form: {Element}
 *   }
 *
 * @return _this {Object}
 */
var Image = function (options) {
  var _this,
      _initialize,

      _createImg,
      _getControl,
      _removeImg,
      _showImage;


  _this = {};

  _initialize = function (options) {
    var inputs = options.form.querySelectorAll('input[type=file]');

    inputs.forEach(function(input) {
      if (/image/.test(input.getAttribute('accept'))) { // image file type
        input.onchange = _showImage;
      }
    });
  };

  /**
   * Create a new <img> and add it to the DOM.
   *
   * @param id {String}
   * @param dataUrl {String}
   */
  _createImg = function (id, dataUrl) {
    var control,
        img;

    control = _getControl(id);
    img = document.createElement('img');

    img.onload = function() {
      control.insertBefore(img, control.firstChild);
    };
    img.src = dataUrl;
  };

  /**
   * Get the control <div> associated with an <input> id.
   *
   * @param id {String}
   *
   * @return {Element}
   */
  _getControl = function (id) {
    var el = document.getElementById(id);

    return el.closest('.control');
  };

  /**
   * Remove an existing <img> from DOM.
   *
   * @param id {String}
   */
  _removeImg = function (id) {
    var control,
        img;

    control = _getControl(id);
    img = control.querySelector('img');

    if (img) {
      img.parentNode.removeChild(img);
    }
  };

  /**
   * Display user-selected image inline below file input control.
   *
   * @param e {Event}
   */
  _showImage = function (e) {
    var input,
        reader;

    input = e.target;
    reader = new FileReader();

    reader.onload = function() {
      _removeImg(input.id);
      _createImg(input.id, reader.result);
    };

    reader.readAsDataURL(input.files[0]);
  };


  _initialize(options);
  options = null;
  return _this;
};


module.exports = Image;
