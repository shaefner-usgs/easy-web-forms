'use strict';


/**
 * Configure file type <input>s to:
 *   1) show a preview image inline when an image is chosen;
 *   2) reset when 'X' button is clicked.
 *
 * @param options {Object}
 *   {
 *     form: {Element}
 *   }
 */
var File = function (options) {
  var _initialize,

      _form,

      _addListeners,
      _createImg,
      _getControl,
      _removeImg,
      _reset,
      _showButton,
      _showImg;


  _initialize = function (options) {
    _form = options.form;

    _addListeners();
  };

  /**
   * Add event listeners to file controls.
   */
  _addListeners = function () {
    var button,
        control,
        inputs;

    inputs = _form.querySelectorAll('input[type=file]');

    inputs.forEach(function(input) {
      control = _getControl(input.id);
      button = control.querySelector('button');

      button.addEventListener('click', function() {
        button.classList.add('hide');

        _reset(input);
      });

      input.addEventListener('change', function(e) {
        button.classList.add('hide'); // need to re-render for proper placement

        if (/image/.test(input.getAttribute('accept'))) { // image file type
          _showImg(e);
        }

        _showButton();
      });
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
   * Remove user-selected image from the DOM.
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
   * Reset file input. Set control to invalid if it's a required field.
   *
   * @param input {Element}
   */
  _reset = function (input) {
    var control = _getControl(input.id);

    input.value = null;

    _removeImg(input.id);

    if (input.hasAttribute('required')) {
      control.classList.add('invalid');
    }
  };

  /**
   * Show reset button after setting CSS values that control placement.
   */
  _showButton = function () {
    var bottomHeight,
        button,
        div,
        input,
        label,
        topHeight;

    div = document.querySelector('.file');
    button = div.querySelector('button');
    input = document.getElementById('file');
    label = div.querySelector('label');

    // Add slight delay so image is rendered before calculating CSS values
    window.setTimeout(function() {
      topHeight = label.offsetHeight;
      bottomHeight = div.offsetHeight - topHeight - input.offsetHeight;

      button.style.top = topHeight + 'px';
      button.style.bottom = bottomHeight + 'px';
      button.classList.remove('hide');
    }, 250);
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
