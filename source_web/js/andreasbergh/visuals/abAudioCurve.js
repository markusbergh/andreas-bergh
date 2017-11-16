/**
 * Audio Curve
 * This file contains the curve visual for audio
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
  var AudioCurve = function(elem, options) {
    this.elem = elem;
    this.$elem = $(elem);
    this.options = options;
    this.model = CoreModel;
  };

  /**
   * Prototype
   */
  AudioCurve.prototype = {
    defaults: {
      bufferLength: 1024,
      data: [],
      $curve: $('.audio_visuals__curve'),
      currentTrack: null
    },

    init: function() {
      var self = this;

      // Introduce defaults that can be extended either globally or using an object literal.
      self.config = $.extend({}, this.defaults, this.options);

      // Set events
      self.setEvents();

      // Set size and position
      self.setSizeAndPosition();

      return self;
    },

    getCurrentTrack: function() {
      var self = this;

      self.config.currentTrack = self.model.getCurrentTrack();

      return self;
    },

    setEvents: function() {
      var self = this;

      CoreEvents.subscribe('/app/resize', function() {
        self.setSizeAndPosition();
      });

      CoreEvents.subscribe('/soundcloud/track/ready', function(e) {
        self.getCurrentTrack();
      });

      return self;
    },

    setSizeAndPosition: function() {
      var self = this;

      self.config.$curve.attr({
        width: $('.visuals__container').width() - 200,
        height: 100
      });

      self.config.$curve.css({
        top: '50%',
        left: '50%',
        transform: 'translateX(-50%)',
        marginTop: '-50px'
      });

      return self;
    },

    render: function(bands, wave) {
      var self = this;

      if(bands && wave) {
        self.animate(bands, wave);
      }
    },

    animate: function(bands, wave) {
      var self = this;

      var audioVizCanvas = self.config.$curve[0];
      var canvasWidth = audioVizCanvas.width;
      var canvasHeight = audioVizCanvas.height;

      var ctx = audioVizCanvas.getContext("2d");
      ctx.clearRect(0, 0, canvasWidth, canvasHeight);

      for (var i = 0; i < 2014; i++) {
        var value = wave[i];
        var percent = value / 256;
        var height = canvasHeight * percent;
        var offset = canvasHeight - height - 1;
        var barWidth = canvasWidth / 1024;
        ctx.fillStyle = self.config.currentTrack.theme.visuals.primaryColor;
        ctx.fillRect(i * barWidth, offset, 1, 8);
      }

      return self;
    }
  };

  /**
   * Defaults
   */
  AudioCurve.defaults = AudioCurve.prototype.defaluts;

  $.fn.AudioCurve = function(options) {
    return this.each(function() {
      new AudioCurve(this, options).init();
    });
  };

  return AudioCurve;
});
