/**
 * Audio Analyser
 * This file contains the analyser
 *
 * Author:
 * Markus Bergh, 2015
 */

define([
  'jquery',
  'pubsub'
],

function($, CoreEvents) {

  'use strict';

  /**
  * Constructor
  */
  var AudioAnalyser = function(audio, numBands, smoothing) {
    var src,
    self = this;

    this.audio = audio != null ? audio : new Audio();
    this.numBands = numBands != null ? numBands : 360;
    this.smoothing = smoothing != null ? smoothing : 0.3;

    // Set source when initiating
    if(typeof this.audio === 'string') {
      src = this.audio;
      this.audio = new Audio();
      this.audio.controls = true;
      this.audio.src = src;
    }

    this.context = new AudioAnalyser.AudioContext();
    this.jsNode = this.context.createScriptProcessor(2048, 1, 1);
    this.analyser = this.context.createAnalyser();
    this.analyser.smoothingTimeConstant = this.smoothing;
    this.analyser.fftSize = this.numBands * 2;
    this.bands = new Uint8Array(this.analyser.frequencyBinCount);
    this.wave = new Uint8Array(this.analyser.frequencyBinCount);
    this.analyser.frequencyBinCount;

    CoreEvents.subscribe('/analyser/source/set', function(source) {
      self.setSource(source);
    });

    CoreEvents.subscribe('/analyser/source/start', function(source) {
      self.start();
    });
  };

  /**
  * Prototype
  */
  AudioAnalyser.prototype = {
    defaults: {
      audio: null,
    },

    setEvents: function() {
      this.audio.addEventListener('canplay', (function(_this) {
        return function() {
          _this.source = _this.context.createMediaElementSource(_this.audio);
          _this.source.connect(_this.analyser);
          _this.analyser.connect(_this.jsNode);
          _this.jsNode.connect(_this.context.destination);
          _this.source.connect(_this.context.destination);

          _this.audio.onended = function() {
            _this.source.disconnect(_this.jsNode);
            _this.jsNode.disconnect(_this.context.destination);
            _this.jsNode.onaudioprocess = function() {};
          };

          _this.jsNode.onaudioprocess = function() {
            _this.analyser.getByteFrequencyData(_this.bands);
            _this.analyser.getByteTimeDomainData(_this.wave);
            if (!_this.audio.paused && _this.onUpdate) {
              return _this.onUpdate(_this.bands, _this.wave);
            }
          };

          return _this.jsNode.onaudioprocess;
        };
      })(this));
    },

    setSource: function(audio) {
      if(typeof this.audio !== 'undefined') {
        this.audio = new Audio();
        this.audio.controls = true;
        this.audio.src = audio;
        this.audio.volume = 0.5;
      }

      // Bind events for analysing
      this.setEvents();
    },

    start: function() {
      return this.audio.play();
    },

    stop: function() {
      // Set position
      this.audio.currentTime = 0;

      // Pause
      return this.audio.pause();
    }
  };

  /**
  * Defaults
  */
  AudioAnalyser.defaults = AudioAnalyser.prototype.defaluts;

  AudioAnalyser.AudioContext = self.AudioContext || self.webkitAudioContext;
  AudioAnalyser.enabled = AudioAnalyser.AudioContext !== null;

  $.fn.AudioAnalyser = function(options) {
    return this.each(function() {
      new AudioAnalyser(this, options).init();
    });
  };

  return AudioAnalyser;
});
