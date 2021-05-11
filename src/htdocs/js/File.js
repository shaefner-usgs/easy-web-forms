'use strict';


/**
 * Set up file type <input>s to show a preview image inline when a user chooses
 *   an image.
 *
 * @param options {Object}
 *   {
 *     form: {Element}
 *   }
 */
var File = function (options) {
  var _initialize,

      _createImg,
      _getControl,
      _removeImg,
      _showImg;


  _initialize = function (options) {
    var inputs = options.form.querySelectorAll('input[type=file]');

    inputs.forEach(function(input) {
      if (/image/.test(input.getAttribute('accept'))) { // image file type
        input.onchange = _showImg;
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
   * Remove an existing <img> from the DOM.
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
   * Show user-selected image inline below the file input.
   *
   * @param e {Event}
   */
  _showImg = function (e) {
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
};


module.exports = File;
