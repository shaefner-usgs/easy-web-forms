'use strict';


var AppUtil = {};

/**
 * Add a CSS file to the DOM
 *
 * @param file {String}
 */
AppUtil.addCssFile = function (file) {
  var css;

  css = document.createElement('link');
  css.href = file;
  css.rel = 'stylesheet';
  css.type = 'text/css';

  document.head.appendChild(css);
};

/**
* Add a JS file to the DOM
*
* @param file {String}
* @param callback {Function}
*/
AppUtil.addJsFile = function (file, cb) {
  var js;

  js = document.createElement('script');
  js.onload = cb;
  js.src = file;

  document.head.appendChild(js);
};

/**
 * Add Polyfill for Element.closest()
 */
AppUtil.addPolyfills = function () {
  if (!Element.prototype.matches) { // used in El.closest polyfill
    Element.prototype.matches = Element.prototype.msMatchesSelector ||
      Element.prototype.webkitMatchesSelector;
  }

  if (!Element.prototype.closest) {
    Element.prototype.closest = function(s) {
      var el = this;
      if (!document.documentElement.contains(el)) {
        return null;
      }
      do {
        if (el.matches(s)) {
          return el;
        }
        el = el.parentElement || el.parentNode;
      } while (el !== null && el.nodeType === 1);

      return null;
    };
  }
};


module.exports = AppUtil;
