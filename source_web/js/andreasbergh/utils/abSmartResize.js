/**
 * Smart resize
 * Debounced resize event
 *
 * Author:
 * Paul Irish, 2009
 */

define([
  'jquery'
],

function($) {

  var sr = 'smartresize';

  // debouncing function from John Hann
  // http://unscriptable.com/index.php/2009/03/20/debouncing-javascript-methods/
  var debounce = function (func, threshold, execAsap) {
    var timeout;

    return function debounced () {
      var obj = this, args = arguments;
      function delayed () {
        if (!execAsap)
        func.apply(obj, args);
        timeout = null;
      }

      if (timeout)
      clearTimeout(timeout);
      else if (execAsap)
      func.apply(obj, args);

      timeout = setTimeout(delayed, threshold || 100);
    };
  };

  // Smartresize
  jQuery.fn[sr] = function(fn){  return fn ? this.bind('resize', debounce(fn)) : this.trigger(sr); };
});
