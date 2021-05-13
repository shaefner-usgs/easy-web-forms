'use strict';


/**
 * Configure file type <input>s to:
 *   1) show a preview image inline when an image is chosen;
 *   2) reset when the 'X' button in the form control is clicked.
 *
 * @param options {Object}
 *   {
 *     form: {Element}
 *   }
 */
var File = function (options) {
  var _initialize,

      _form,
      _prevImgs,

      _addListeners,
      _addPrevImg,
      _createImg,
      _getControl,
      _removeImg,
      _reset,
      _showButton,
      _showImg;


  _initialize = function (options) {
    var control,
        inputs;

    _form = options.form;
    _prevImgs = {};

    inputs = _form.querySelectorAll('input[type=file]');

    inputs.forEach(function(input) {
      control = _getControl(input);

      _prevImgs[input.id] = control.querySelector('img');
    });

    _addListeners(inputs);
  };

  /**
   * Add event listeners to file controls.
   *
   * @param inputs {NodeList}
   */
  _addListeners = function (inputs) {
    var button,
        control;

    inputs.forEach(function(input) {
      control = _getControl(input);
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

        _showButton(input);
      });
    });
  };

  /**
   * Add previously uploaded image back (when input is reset).
   *
   * @param input {Element}
   */
  _addPrevImg = function (input) {
    var control,
        firstChild,
        img;

    control = _getControl(input);
    firstChild = control.querySelector('.description');
    img = _prevImgs[input.id];

    if (img) {
      control.insertBefore(img, firstChild);
    }
  };

  /**
   * Create a new <img> and add it to the DOM.
   *
   * @param input {Element}
   * @param dataUrl {String}
   */
  _createImg = function (input, dataUrl) {
    var control,
        img;

    control = _getControl(input);
    img = document.createElement('img');

    img.onload = function() {
      control.insertBefore(img, control.firstChild);
    };
    img.src = dataUrl;
  };

  /**
   * Get the control (i.e. parent) <div> associated with an <input>.
   *
   * @param input {Element}
   *
   * @return {Element}
   */
  _getControl = function (input) {
    var el = document.getElementById(input.id);

    return el.closest('.control');
  };

  /**
   * Remove user-selected image from the DOM.
   *
   * @param input {Element}
   */
  _removeImg = function (input) {
    var control,
        img;

    control = _getControl(input);
    img = control.querySelector('img');

    if (img) {
      img.parentNode.removeChild(img);
    }
  };

  /**
   * Reset file input. Set control to 'invalid' if it's a required field.
   *
   * @param input {Element}
   */
  _reset = function (input) {
    var control = _getControl(input);

    input.value = null;

    _removeImg(input);
    _addPrevImg(input);

    if (input.hasAttribute('required')) {
      control.classList.add('invalid');
    }
  };

  /**
   * Show reset button after setting CSS that controls its placement.
   *
   * @param input {Element}
   */
  _showButton = function (input) {
    var bottomHeight,
        button,
        div,
        label,
        topHeight;

    div = _getControl(input);
    button = div.querySelector('button');
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
      _removeImg(input);
      _createImg(input, reader.result);
    };

    reader.readAsDataURL(input.files[0]);
  };


  _initialize(options);
  options = null;
};


module.exports = File;
