/**
 * Visual Controller
 * This file contains the visual controller
 *
 * Author:
 * Markus Bergh, 2015
 */

define([
  'jquery',
  'pubsub',
  '../visuals/abAudioJiggle',
  '../utils/abAudioAnalyser',
  // Unnamed dependencies
  'transit'
],

function($, CoreEvents, CoreVisualJiggle, CoreAudioAnalyser) {

  'use strict';

  /**
  * Constructor
  */
  var VisualController = function(elem, options) {
    this.elem = elem;
    this.$elem = $(elem);
    this.options = options;

    // Visual constants
    this.TYPE_VISUAL_JIGGLE = 'jiggle';
  };

  /**
  * Prototype
  */
  VisualController.prototype = {
    defaults: {
      visuals: {
        jiggle: null
      },
      audioAnalyser: null,
      $visual_container: $('.visuals__container')
    },

    init: function() {
      var self = this;

      // Introduce defaults that can be extended either globally or using an object literal.
      self.config = $.extend({}, this.defaults, this.options);

      // Hide container
      self.hideVisual();

      // Create visual
      self.createVisual(self.TYPE_VISUAL_JIGGLE);

      // Create analyser for audio
      self.createAudioAnalyser();

      // Bind events
      self.setEvents();
    },

    setEvents: function() {
      var self = this;

      // For listening to audio changes
      self.config.analyser.onUpdate = function(bands, wave) {
        for (var type in self.config.visuals) {
          var visual = self.config.visuals[type];
          if(typeof visual !== 'undefined') {
            visual.render(bands, wave);
          }
        }
      };

      CoreEvents.subscribe('/visuals/fade/in', function(e) {
        self.config.$visual_container.transition({
          opacity: 1
        }, 500);
      });

      return self;
    },

    createVisual: function(type) {
      var self = this;

      // If visual type exists
      if(self.config.visuals[type] !== 'undefined') {
        var VisualType = null;

        // Match visual type
        switch(type) {
          case self.TYPE_VISUAL_JIGGLE:
          VisualType = function() {
            return new CoreVisualJiggle('', {}).init();
          };
          break;
        }

        // Create visual
        self.config.visuals[type] = VisualType.apply();
      }

      return self;
    },

    hideVisual: function() {
      var self = this;

      self.config.$visual_container.css({
        opacity: 0
      });

      return self;
    },

    createAudioAnalyser: function() {
      var self = this;

      self.config.analyser = new CoreAudioAnalyser(null, 512, 0.5);

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
