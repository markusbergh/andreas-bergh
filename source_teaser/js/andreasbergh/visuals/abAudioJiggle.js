/**
 * Audio Jiggle
 * This file contains the jiggling visual for audio
 *
 * Author:
 * Markus Bergh, 2015
 */

define([
  'require',
  'jquery'
],

function(require, $) {

  'use strict';

  /**
   * Constructor
   */
  var AudioJiggle = function(elem, options) {
    this.elem = elem;
    this.$elem = $(elem);
    this.options = options;
  };

  /**
   * Prototype
   */
  AudioJiggle.prototype = {
    defaults: {
      audioAnalyzer: null,
      $jiggle: $('.audio_visuals__jiggle'),
      $image: $('.audio_visuals__jiggle--image'),
      $container: null,
      NUM_OF_SLICES: 300,
      STEP: null,
      NO_SIGNAL: 128, // All values in array will be 128 when there is no audio signal
      slices: [],
      rect: null,
      width: 0,
      height: 0,
      width_per_slice: 0
    },

    init: function() {
      var self = this;

      // Introduce defaults that can be extended either globally or using an object literal.
      self.config = $.extend({}, this.defaults, this.options);

      // Draw image to be used
      self.createSlices();

      return self;
    },

    createSlices: function() {
      var self = this;

      self.config.rect = self.config.$jiggle[0].getBoundingClientRect();
      self.config.width = self.config.rect.width;
      self.config.height = self.config.rect.height;
      self.config.width_per_slice = self.config.width / self.config.NUM_OF_SLICES;

      self.config.$container = document.createElement('div');
      self.config.$container.className = 'audio_visuals__jiggle--container';
      self.config.$container.style.width = self.config.width + 'px';
      self.config.$container.style.height = self.config.height + 'px';

      for (var i = 0; i < self.config.NUM_OF_SLICES; i++) {
        /* Calculate the `offset` for each individual 'slice'. */
        var offset = i * self.config.width_per_slice;

        /* Create a mask `<div>` for this 'slice'. */
        var mask = document.createElement('div');
        mask.className = 'audio_visuals__jiggle--mask';
        mask.style.width = self.config.width_per_slice + 'px';

        /* For the best performance, and to prevent artefacting when we
         * use `scale` we instead use a 2d `matrix` that is in the form:
         * matrix(scaleX, 0, 0, scaleY, translateX, translateY). We initially
         * translate by the `offset` on the x-axis. */
        mask.style.transform = 'matrix(1,0,0,1,' + offset + '0)';

        /* Clone the original element. */
        var clone = self.config.$jiggle[0].cloneNode(true);
        clone.className = 'audio_visuals__jiggle--clone';
        clone.style.width = self.config.width + 'px';

        /* We won't be changing this transform so we don't need to use a matrix. */
        clone.style.transform = 'translate3d(' + -offset + 'px,0,0)';
        clone.style.height = mask.style.height = self.config.height + 'px';

        mask.appendChild(clone);
        self.config.$container.appendChild(mask);

        /* We need to maintain the `offset` for when we
         * alter the transform in `requestAnimationFrame`. */
        self.config.slices.push({ offset: offset, elem: mask });
      }

      self.config.$image.replaceWith(
        $(self.config.$container)
      );

      return self;
    },

    render: function(bands, waves) {
      var self = this;

      if(bands && waves) {
        self.animate(bands, waves);
      }

      return self;
    },

    animate: function(bands, waves) {
      var self = this;

      self.config.STEP = Math.floor(waves.length / self.config.NUM_OF_SLICES);

      /* Loop through our 'slices' and use the STEP(n) data from the
       * analysers data. */
      for (var i = 0, n = 0; i < self.config.NUM_OF_SLICES; i++, n+=self.config.STEP) {
        var slice = self.config.slices[i],
        elem = slice.elem,
        offset = slice.offset;

        /* Make sure the val is positive and divide it by `NO_SIGNAL`
         * to get a value suitable for use on the Y scale. */
        var val = Math.abs(waves[n]) / self.config.NO_SIGNAL;

        /* Change the scaleY value of our 'slice', while keeping it's
         * original offset on the x-axis. */
        elem.style.transform = 'matrix(1,0,0,' + val + ',' + offset + ',0)';
        elem.style.opacity = val;
      }

      return self;
    }
  };

  /**
   * Defaults
   */
  AudioJiggle.defaults = AudioJiggle.prototype.defaluts;

  $.fn.AudioJiggle = function(options) {
    return this.each(function() {
      new AudioJiggle(this, options).init();
    });
  };

  return AudioJiggle;
});
