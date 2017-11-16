/*
 * Main
 * This file contains the main script for site
 *
 * Author
 * Markus Bergh
 * 2014
 */

require(['jquery', './andreasbergh/abApp'], function($, CoreApp) {

  $(function() {

    // Force scroll to top
    $(window).on('beforeunload', function() {
      $(window).scrollTop(0);
    });

    // Defaults

    // Kickstart application
    var app = new CoreApp().initialize();

    // Add class for script support
    $('html').removeClass('no-js').addClass('js loaded-and-ready');
  });

});
