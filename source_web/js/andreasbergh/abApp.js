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
  'pubsub',
  'modules/abPlaylist',
  'modules/abSvgAnimation',
  'modules/abPlayer',
  'controllers/abVisualController',
  'controllers/abSoundCloudController',
  // Unnamed dependencies
  'smartresize'
],

function(require, $, CoreEvents, CorePlaylist, CoreSVGAnimation, CorePlayer, CoreVisualController, CoreSoundCloudController) {

  'use strict';

  /**
   * Constructor
   */
  var ABMain = function() {

    var playlist = null,
    analyzer = null,
    title = null,
    player = null,
    visualController = null,
    soundCloudController = null;

    /**
     * Private
     */
    var setListeners = function() {
      CoreEvents.subscribe('/soundcloud/track/ready', function(e) {
        console.log('/soundcloud/track/ready');

        // Get stream...
        soundCloudController.getStream();
      });

      CoreEvents.subscribe('/soundcloud/stream/ready', function(e) {
        console.log('/soundcloud/stream/ready');

        // hide loader
        $('.loader').addClass('is-hidden');

        // When stream is ready we show player...
        CoreEvents.publish('/player/show');
      });

      CoreEvents.subscribe('/player/is/ready', function(e) {
        // Start both outputs for analysing
        CoreEvents.publish('/analyser/source/start');
        CoreEvents.publish('/soundcloud/stream/start');

        // Fade in visuals
        CoreEvents.publish('/visuals/fade/in');
      });
    };

    var initPlaylist = function() {
      playlist = new CorePlaylist($('.playlist'), {}).init();

      // Enabled it
      $('.playlist').removeClass('is-hidden');
    };

    var initPlayer = function() {
      player = new CorePlayer($('.player'), {}).init();
    };

    var initSVGAnimation = function() {
      title = new CoreSVGAnimation('', {}).init();

      // Enabled it
      $('.title').removeClass('is-hidden');
    };

    var initVisualController = function() {
      visualController = new CoreVisualController($('.visuals__container'), {}).init();
    };

    var initSoundCloudController = function() {
      soundCloudController = new CoreSoundCloudController('', {}).init();
    };

    var initSmartResiez = function() {
      $(window).smartresize(function() {
        CoreEvents.publish('/app/resize');

        setFooterPosition();
      });
    };

    var setFooterPosition = function() {
      $('footer').css({
        top: $('.playlist').height()
      });
    };

    /**
     * Public
     */
    this.getBrowserSupport = function(e) {
      var ua= navigator.userAgent, tem,
      M = ua.match(/(opera|chrome|safari|firefox|msie|trident(?=\/))\/?\s*(\d+)/i) || [];

      if(/trident/i.test(M[1])) {
        tem=  /\brv[ :]+(\d+)/g.exec(ua) || [];
        return 'IE '+(tem[1] || '');
      }

      if(M[1]=== 'Chrome') {
        tem= ua.match(/\b(OPR|Edge)\/(\d+)/);
        if(tem !== null)
        return tem.slice(1).join(' ').replace('OPR', 'Opera');
      }

      M = M[2]? [M[1], M[2]]: [navigator.appName, navigator.appVersion, '-?'];

      if((tem = ua.match(/version\/(\d+)/i)) !== null) {
        M.splice(1, 1, tem[1]);
      }

      return {
        'family': M[0],
        'version': M[1]
      };
    };

    this.unsupport = function() {
      var section = $('<section />');
      $('main').append(
        section.addClass('unsupport')
      );

      var container = $('<div />');
      section.append(
        container.addClass('unsupport__container')
      );

      // Append unsupport message
      var message = $('<p />');
      message.text('This browser is currently unsupported, please use the latest version of Chrome on desktop for full functionality.');
      container.append(message);

      // Set position of footer
      $('footer').css({
        top: $(window).height()
      });

      // App is ready as we have no support
      $('html').removeClass('no-js').addClass('js loaded-and-ready');
    };

    this.initialize = function() {
      var self = this;

      // Touch support check
      var supportsTouch = 'ontouchstart' in window || !!navigator.msMaxTouchPoints;
      if(supportsTouch) {
        $('html').addClass('touch');
      }

      // Events
      setListeners();

      // Core initializing
      initSVGAnimation();
      initPlayer();
      initPlaylist();

      // Set position of footer
      setFooterPosition();

      // Controllers
      initVisualController();
      initSoundCloudController();

      // Smarte resize
      initSmartResiez();

      CoreEvents.subscribe('/app/is/ready', function() {
        $('html').removeClass('no-js').addClass('js loaded-and-ready');
      });

      return self;
    };

  };

  return ABMain;
});
