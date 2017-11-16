/*
 * Main
 * This file contains the main script for site
 *
 * Author:
 * Markus Bergh, 2015
 */

require(['jquery', './andreasbergh/abApp'], function($, CoreApp) {

  $(function() {
    // Force scroll to top
    $(window).on('beforeunload', function() {
      $(window).scrollTop(0);
    });

    // Initiate application
    var app = new CoreApp();

    // Sniff for 'ugly' browsers
    var browser = app.getBrowserSupport();

    // If browser is not chrome, show unsupported message
    if(browser.family.toLowerCase().indexOf('chrome') == -1) {
      app.unsupport();
    } else {
      app.initialize();
    }
  });

});
