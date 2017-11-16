/**
 * Audio Circle
 * This file contains the circle visual for audio
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
  var AudioCircle = function(elem, options) {
    this.elem = elem;
    this.$elem = $(elem);
    this.options = options;
    this.model = CoreModel;
  };

  /**
   * Prototype
   */
  AudioCircle.prototype = {
    defaults: {
      audioAnalyzer: null,
      $circles: $('.audio_visuals__circles'),
      $loudness: $('.audio_visuals__circles--loudness'),
      currentTrack: null
    },

    init: function() {
      var self = this;

      // Introduce defaults that can be extended either globally or using an object literal.
      self.config = $.extend({}, this.defaults, this.options);

      // Set size
      self.setSize();

      // Set events
      self.setEvents();

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
        self.setSize();
      });

      return self;
    },

    setSize: function() {
      var self = this;

      self.config.$circles.attr({
        width: $('.visuals__container').width(),
        height: $('.visuals__container').height()
      });


      self.config.$loudness.attr({
        width: $('.visuals__container').width(),
        height: $('.visuals__container').height()
      });

      return self;
    },

    render: function(bands, waves) {
      var self = this;

      if(bands && waves) {
        self.animatePrimary(waves);
        self.animateSecondary(bands);
      }
    },

    animatePrimary: function(bands) {
      var self = this;

      var audioVizCanvas = $('.audio_visuals__circles')[0];

      var centerWidth = audioVizCanvas.width / 2;
      var centerHeight = audioVizCanvas.height / 2;

      var ctx = audioVizCanvas.getContext("2d");
      ctx.clearRect(0, 0, centerWidth * 2, centerHeight * 2);

      var styles = [
        self.config.currentTrack.theme.visuals.primaryColor,
        self.config.currentTrack.theme.visuals.secondaryColor,
        self.config.currentTrack.theme.visuals.tertiaryColor,
        self.config.currentTrack.theme.visuals.quarternaryColor,
        self.config.currentTrack.theme.visuals.quinaryColor,
        self.config.currentTrack.theme.visuals.senaryColor,
      ];

      var radiusA = bands[0];
      var radiusB = bands[10];
      var radiusC = bands[20];
      var radiusD = bands[30];
      var radiusE = bands[40];
      var radiusF = bands[50];

      var dataFigures = 6;

      for (var i = 0; i < dataFigures; i++) {
        ctx.beginPath();
        ctx.arc(centerWidth, centerHeight, bands[i * 5 + 10] * 1.5, 0, 2 * Math.PI);
        ctx.lineWidth = 8;
        ctx.strokeStyle = styles[i];
        ctx.stroke();
        ctx.closePath();
      }
    },

    animateSecondary: function(bands) {
      var self = this;

      var audioVizCanvas = $('.audio_visuals__circles--loudness')[0];
      var centerWidth = audioVizCanvas.width / 2;
      var centerHeight = audioVizCanvas.height / 2;

      var ctx2 = audioVizCanvas.getContext("2d");
      ctx2.clearRect(0, 0, centerWidth * 2, centerHeight * 2);

      var average = 0;
      for(var i = 0, len = bands.length; i < len; i++) {
        average += parseFloat(bands[i]);
      }
      average = average / bands.length;

      ctx2.fillStyle = self.config.currentTrack.theme.visuals.primaryColor;

      ctx2.beginPath();
      ctx2.arc(centerWidth, centerHeight, average, 0, Math.PI * 2, true);
      ctx2.closePath();
      ctx2.fill();
    }
  };

  /**
   * Defaults
   */
  AudioCircle.defaults = AudioCircle.prototype.defaluts;

  $.fn.AudioCircle = function(options) {
    return this.each(function() {
      new AudioCircle(this, options).init();
    });
  };

  return AudioCircle;
});
