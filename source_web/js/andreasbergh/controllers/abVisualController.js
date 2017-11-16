/**
 * Visual Controller
 * This file contains the visual controller
 *
 * Author:
 * Markus Bergh, 2015
 */

define([
  'jquery',
  'waypoints',
  'pubsub',
  'visuals/abAudioCircle',
  'visuals/abAudioCurve',
  'visuals/abAudioWobble',
  'visuals/abAudioSpectrum',
  'utils/abAudioAnalyser',
  // Unnamed dependencies
  'transit'
],

function($, Waypoint, CoreEvents, CoreVisualCircle, CoreVisualCurve, CoreVisualWobble, CoreVisualSpectrum, CoreAudioAnalyser) {

  'use strict';

  /**
   * Constructor
   */
  var VisualController = function(elem, options) {
    this.elem = elem;
    this.$elem = $(elem);
    this.options = options;

    // Visual constants
    this.TYPE_VISUAL_CIRCLE = 'circles';
    this.TYPE_VISUAL_CURVE = 'curve';
    this.TYPE_VISUAL_WOBBLE = 'wobble';
    this.TYPE_VISUAL_SPECTRUM = 'spectrum';
  };

  /**
   * Prototype
   */
  VisualController.prototype = {
    defaults: {
      visuals: {
        circles: null,
        curve: null,
        wobble: null,
        spectrum: null
      },
      audioAnalyser: null,
      $visual_container: $('.visuals__container')
    },

    init: function() {
      var self = this;

      // Introduce defaults that can be extended either globally or using an object literal.
      self.config = $.extend({}, this.defaults, this.options);

      // Set position
      self.setVisualsPosition();

      // Create analyser for audio
      self.createAudioAnalyser();

      // Bind events
      self.setListeners();
    },

    setListeners: function() {
      var self = this;

      // For listening to audio changes
      self.config.analyser.onUpdate = function(bands, wave) {
        for (var type in self.config.visuals) {
          var visual = self.config.visuals[type];
          if(visual && typeof visual !== 'undefined') {
            visual.render(bands, wave);
          }
        }
      };

      CoreEvents.subscribe('/visuals/create', function(e) {
        self.setRandomVisual();

        // Always use spectrum
        self.createVisual(self.TYPE_VISUAL_SPECTRUM);
      });

      CoreEvents.subscribe('/visuals/fade/in', function(e) {
        self.config.$visual_container.css({
          y: 10,
          opacity: 0
        }).transition({
          y: 0,
          opacity: 1
        }, 500);
      });

      CoreEvents.subscribe('/visuals/fade/out', function(e) {
        self.config.$visual_container.transition({
          y: 10,
          opacity: 0
        }, 500, function() {
          // Reset visuals for new batch
          self.reset();
        });
      });

      CoreEvents.subscribe('/app/resize', function(e) {
        self.setVisualsPosition();
      });

      return self;
    },

    setRandomVisual: function() {
      var self = this;

      var types = [self.TYPE_VISUAL_CIRCLE, self.TYPE_VISUAL_CURVE, self.TYPE_VISUAL_WOBBLE];
      var type = types[Math.floor(Math.random() * types.length)];

      self.createVisual(type);

      return self;
    },

    createVisual: function(type) {
      var self = this;

      // If visual type exists
      if(self.config.visuals[type] !== 'undefined') {
        var VisualType = null;

        // Match visual type
        switch(type) {
          case self.TYPE_VISUAL_CIRCLE:
          VisualType = function() {
            $('.audio_visuals__circles').removeClass('is-hidden');
            $('.audio_visuals__circles--loudness').removeClass('is-hidden');
            return new CoreVisualCircle('', {}).init();
          };
          break;
          case self.TYPE_VISUAL_CURVE:
          VisualType = function() {
            $('.audio_visuals__curve').removeClass('is-hidden');
            return new CoreVisualCurve('', {}).init();
          };
          break;
          case self.TYPE_VISUAL_WOBBLE:
          VisualType = function() {
            $('.audio_visuals__wobble--left').removeClass('is-hidden');
            $('.audio_visuals__wobble--right').removeClass('is-hidden');
            return new CoreVisualWobble('', {}).init();
          };
          break;
          case self.TYPE_VISUAL_SPECTRUM:
          VisualType = function() {
            return new CoreVisualSpectrum('', {}).init();
          };
          break;
        }

        // Create visual
        self.config.visuals[type] = VisualType.apply();
      }

      return self;
    },

    createAudioAnalyser: function() {
      var self = this;

      self.config.analyser = new CoreAudioAnalyser(null, 512, 0.5);

      return self;
    },

    setVisualsPosition: function() {
      var self = this;

      self.$elem.css({
        top: $(window).height()
      });

      return self;
    },

    reset: function() {
      var self = this;

      for (var type in self.config.visuals) {
        self.config.visuals[type] = null;
      }

      // Hide them all
      $('.audio_visuals__circles').addClass('is-hidden');
      $('.audio_visuals__circles--loudness').addClass('is-hidden');
      $('.audio_visuals__curve').addClass('is-hidden');
      $('.audio_visuals__wobble--left').addClass('is-hidden');
      $('.audio_visuals__wobble--right').addClass('is-hidden');

      return self;
    }
  };

  /**
   * Defaults
   */
  VisualController.defaults = VisualController.prototype.defaluts;

  $.fn.VisualController = function(options) {
    return this.each(function() {
      new VisualController(this, options).init();
    });
  };

  return VisualController;
});
