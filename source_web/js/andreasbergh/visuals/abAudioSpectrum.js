/**
 * Audio Spectrum
 * This file contains the spectrum visual for audio
 *
 * Author:
 * Markus Bergh, 2015
 */

define([
  'require',
  'jquery',
  'pubsub',
  'models/abModel'
],

function(require, $, CoreEvents, CoreModel) {

  'use strict';

  /**
   * Constructor
   */
  var AudioSpectrum = function(elem, options) {
    this.elem = elem;
    this.$elem = $(elem);
    this.options = options;
    this.model = CoreModel;
  };

  /**
   * Prototype
   */
  AudioSpectrum.prototype = {
    defaults: {
      audioAnalyzer: null,
      $spectrum: $('.audio_visuals__spectrum'),
      currentTrack: null
    },

    init: function() {
      var self = this;

      // Introduce defaults that can be extended either globally or using an object literal.
      self.config = $.extend({}, this.defaults, this.options);

      // Set size
      self.setSize();

      // Set position
      self.setPosition();

      // Set events
      self.setEvents();

      return self;
    },

    setSize: function() {
      var self = this;

      self.config.$spectrum.attr({
        width: 230,
        height: 50
      });

      return self;
    },

    setPosition: function() {
      var self = this;

      var mq = window.matchMedia('all and (min-width: 1600px)');
      if(!mq.matches) {
        self.config.$spectrum.css({
          left: Math.floor($('.player__ui_title').offset().left)
        });
      } else {
        self.config.$spectrum.css({
          left: 0
        });
      }

      return self;
    },

    getCurrentTrack: function() {
      var self = this;

      self.config.currentTrack = self.model.getCurrentTrack();

      return self;
    },

    setEvents: function() {
      var self = this;

      CoreEvents.subscribe('/soundcloud/track/ready', function(e) {
        self.getCurrentTrack();
      });

      CoreEvents.subscribe('/app/resize', function() {
        // Set position
        self.setPosition();
      });

      return self;
    },

    render: function(bands, waves) {
      var self = this;

      if(bands && waves) {
        self.animate(bands, waves);
      }
    },

    animate: function(bands, waves) {
      var self = this;

      var audioVizCanvas = $('.audio_visuals__spectrum')[0];

      var canvasWidth = audioVizCanvas.width;
      var canvasHeight = audioVizCanvas.height;

      var ctx = audioVizCanvas.getContext("2d");
      ctx.clearRect(0, 0, canvasWidth, canvasHeight);

      var sum, average, bar_width, num_bars, scaled_average;

      // Set amount of bars
      num_bars = 40;

      var bin_size = Math.floor(bands.length / num_bars);

      for (var i = 0; i < num_bars; i += 1) {
        sum = 0;

        for (var j = 0; j < bin_size; j += 1) {
          sum += bands[(i * bin_size) + j];
        }

        average = sum / bin_size;
        bar_width = canvasWidth / num_bars;
        scaled_average = (average / 256) * canvasHeight;
        ctx.fillStyle = self.config.currentTrack.theme.visuals.primaryColor;
        ctx.fillRect(i * bar_width, canvasHeight, bar_width - 2, - scaled_average);
      }
    }
  };

  /**
   * Defaults
   */
  AudioSpectrum.defaults = AudioSpectrum.prototype.defaluts;

  $.fn.AudioSpectrum = function(options) {
    return this.each(function() {
      new AudioSpectrum(this, options).init();
    });
  };

  return AudioSpectrum;
});
