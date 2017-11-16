/**
 * Audio Wobble
 * This file contains the wobbling circular visual for audio
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
  var AudioWobble = function(elem, options) {
    this.elem = elem;
    this.$elem = $(elem);
    this.options = options;

    this.radius = 0;
    this.SinFrequencyA = 15;
    this.SinAmplitudeA = 10;
    this.SinFrequencyB = 40;
    this.SinAmplitudeB = 10;
    this.centerX = window.innerWidth / 2;
    this.centerY = window.innerHeight / 2;

    this.model = CoreModel;
  };

  /**
   * Prototype
   */
  AudioWobble.prototype = {
    defaults: {
      radius: 0,
      $wobble_left: $('.audio_visuals__wobble--left'),
      $wobble_right: $('.audio_visuals__wobble--right'),
      currentTrack: null
    },

    init: function() {
      var self = this;

      // Introduce defaults that can be extended either globally or using an object literal.
      self.config = $.extend({}, this.defaults, this.options);

      // Set events
      self.setEvents();

      // Set size
      self.setSize();

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
        self.setSize();
      });

      CoreEvents.subscribe('/soundcloud/track/ready', function(e) {
        self.getCurrentTrack();
      });

      return self;
    },

    setSize: function() {
      var self = this;

      self.config.$wobble_left.attr({
        width: $('.visuals__container').width(),
        height: $('.visuals__container').height()
      });

      self.config.$wobble_right.attr({
        width: $('.visuals__container').width(),
        height: $('.visuals__container').height()
      });

      return self;
    },

    render: function(bands, wave) {
      var self = this;

      if(bands && wave) {
        self.animateLeft(bands, wave);
        self.animateRight(bands, wave);
      }
    },

    animateLeft: function(bands, wave) {
      var self = this;

      var audioVizCanvas = $('.audio_visuals__wobble--left')[0];

      var canvasWidth = audioVizCanvas.width;
      var canvasHeight = audioVizCanvas.height;

      var ctx = audioVizCanvas.getContext("2d");
      ctx.lineWidth = 10;
      ctx.lineJoin = 'round';
      ctx.lineCap = 'round';



      var angle, radius, t, x, y, _i;
      ctx.clearRect(0, 0, canvasWidth, canvasHeight);

      ctx.beginPath();
      for (t = _i = 0; _i <= 512; t = _i += 1) {
        radius = wave[t] + this.radius;
        angle = (t * 360 / 512) / -360 * Math.PI;
        x = canvasWidth / 2 - 5 + Math.sin(angle) * (radius + (Math.sin(angle * this.SinFrequencyA) * this.SinAmplitudeA + Math.sin(angle * this.SinFrequencyB) * this.SinAmplitudeB));
        y = canvasHeight / 2 + Math.cos(angle) * (radius + (Math.sin(angle * this.SinFrequencyA) * this.SinAmplitudeA + Math.sin(angle * this.SinFrequencyB) * this.SinAmplitudeB));
        ctx.lineTo(x, y);
      }
      ctx.closePath();

      var grd = ctx.createRadialGradient(window.innerWidth / 2, window.innerHeight / 2, 0, window.innerWidth / 2, window.innerHeight / 2, bands[0] * 2);
      ctx.fillStyle = grd;
      ctx.fill();
      ctx.strokeStyle = self.config.currentTrack.theme.visuals.primaryColor;
      ctx.stroke();
    },

    animateRight: function(bands, wave) {
      var self = this;

      var audioVizCanvas = $('.audio_visuals__wobble--right')[0];
      var canvasWidth = audioVizCanvas.width;
      var canvasHeight = audioVizCanvas.height;

      var ctx = audioVizCanvas.getContext("2d");
      ctx.lineWidth = 10;
      ctx.lineJoin = 'round';
      ctx.lineCap = 'round';

      var angle, radius, t, x, y, _i;
      ctx.clearRect(0, 0, canvasWidth, canvasHeight);

      ctx.beginPath();
      for (t = _i = 0; _i <= 512; t = _i += 1) {
        radius = wave[t] + this.radius;
        angle = (t * 360 / 512) / 360 * Math.PI;

        x = canvasWidth / 2 + 5 + Math.sin(angle) * (radius + (Math.sin(angle * this.SinFrequencyA) * this.SinAmplitudeA + Math.sin(angle * this.SinFrequencyB) * this.SinAmplitudeB));
        y = canvasHeight / 2 + Math.cos(angle) * (radius + (Math.sin(angle * this.SinFrequencyA) * this.SinAmplitudeA + Math.sin(angle * this.SinFrequencyB) * this.SinAmplitudeB));
        ctx.lineTo(x, y);
      }
      ctx.closePath();

      var grd = ctx.createRadialGradient(window.innerWidth / 2, window.innerHeight / 2, 0, window.innerWidth / 2, window.innerHeight / 2, bands[0] * 2);
      ctx.fillStyle = grd;
      ctx.fill();
      ctx.strokeStyle = self.config.currentTrack.theme.visuals.secondaryColor;
      ctx.stroke();
    },
  };

  /**
   * Defaults
   */
  AudioWobble.defaults = AudioWobble.prototype.defaluts;

  $.fn.AudioWobble = function(options) {
    return this.each(function() {
      new AudioWobble(this, options).init();
    });
  };

  return AudioWobble;
});
