/**
 * App
 * This file contains the initializer for site
 *
 * Author:
 * Markus Bergh, 2015
 */

define([
  'require',
  'jquery',
  './controllers/abVisualController',
  './controllers/abSoundCloudController',
  'pubsub'
],

function(require, $, CoreVisualController, CoreSoundCloudController, CoreEvents) {

  'use strict';

  /**
   * Constructor
   */
  var ABMain = function() {

    var visualController = null,
    soundCloudController = null;

    /**
     * Private
     */
    var setEvents = function() {
      CoreEvents.subscribe('/soundcloud/track/ready', function(e) {
        // Get stream...
        soundCloudController.getStream();
      });

      CoreEvents.subscribe('/soundcloud/stream/ready', function(e) {
        // Start both outputs for analysing
        CoreEvents.publish('/analyser/source/start');
        CoreEvents.publish('/soundcloud/stream/start');

        // Fade in visuals
        CoreEvents.publish('/visuals/fade/in');
      });
    };

    var initVisualController = function() {
      visualController = new CoreVisualController($('.visuals__container'), {}).init();
    };

    var initSoundCloudController = function() {
      soundCloudController = new CoreSoundCloudController('', {}).init();

      CoreEvents.publish('/soundcloud/track/get', [
        'https://soundcloud.com/kavehazizi/sergelstorg'
      ]);
    };

    /**
     * Public
     */
    this.initialize = function() {
      var self = this;

      // Touch support check
      var supportsTouch = 'ontouchstart' in window || !!navigator.msMaxTouchPoints;
      if(supportsTouch) {
        $('html').addClass('touch');
      }

      // Events
      setEvents();

      // Controllers
      initVisualController();
      initSoundCloudController();

      return self;
    };

  };

  return ABMain;
});
