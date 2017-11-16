/**
 * SoundCloud Controller
 * This file contains SoundCloud API interface
 *
 * Author:
 * Markus Bergh, 2015
 */

define([
  'jquery',
  'waveform',
  'pubsub',
  'models/abModel',
  // Unnamed dependencies
  'transit'
],

function($, Waveform, CoreEvents, CoreModel) {

  'use strict';

  /**
   * Constructor
   */
  var SoundCloudController = function(elem, options) {
    this.elem = elem;
    this.$elem = $(elem);
    this.options = options;
    this.CLIENT_ID_SOUNDCLOUD = 'b544db97514f12eefbf1c1bc111bc245';
  };

  /**
   * Prototype
   */
  SoundCloudController.prototype = {
    defaults: {
      currentTrack: null,
      currentTrackSCObject: null,
      currentStream: null,
      streamOptions: null,
      waveform: null
    },

    init: function() {
      var self = this;

      // Introduce defaults that can be extended either globally or using an object literal.
      self.config = $.extend({}, this.defaults, this.options);

      // Initialize SoundCloud SDK
      SC.initialize({
        client_id: self.CLIENT_ID_SOUNDCLOUD
      });

      self.setListeners();

      return self;
    },

    setListeners: function() {
      var self = this;

      CoreEvents.subscribe('/soundcloud/track/get', function() {
        console.log('/soundcloud/track/get');

        var model = CoreModel;
        self.config.currentTrack = model.getCurrentTrack();

        // Get track
        self.getTrack(self.config.currentTrack.url);
      });

      CoreEvents.subscribe('/soundcloud/stream/start', function(track) {
        console.log('/soundcloud/stream/start');
        self.startStream();
      });

      CoreEvents.subscribe('/soundcloud/stream/stop', function() {
        self.stopStream();
        self.destroyWaveform();
      });

      CoreEvents.subscribe('/player/update/waveform', function() {
        if(self.config.waveform) {
          self.setSizeWaveform();
        }
      });

      return self;
    },

    getTrack: function(trackUrl) {
      var self = this;

      SC.get('/resolve', { url: trackUrl }, function(track) {
        var src = 'http://api.soundcloud.com/tracks/' + track.id + '/stream?client_id=' + self.CLIENT_ID_SOUNDCLOUD;

        // Update some data
        CoreEvents.publish('/player/playtime/total', [track.duration]);
        CoreEvents.publish('/player/genre/set', [track.genre]);
        CoreEvents.publish('/player/title/set', [track.title]);

        // Set source for audio visualisation
        CoreEvents.publish('/analyser/source/set', [src]);

        self.config.waveform = new Waveform({
          container: $('.player__waveform')[0],
          innerColor: function(x, y) {
            return self.config.currentTrack.theme.default.innerColor;
          },
          outerColor: self.config.currentTrack.theme.default.outerColor,
          interpolate: true,
        });

        // Set size of waveform
        self.setSizeWaveform();

        self.config.waveform.updatePlayback = self.handleUpdatePlayback;
        self.config.waveform.dataFromSoundCloudTrack(track);

        self.config.streamOptions = self.config.waveform.optionsForSyncedStream({
          defaultColor: self.config.currentTrack.theme.stream.defaultColor,
          playedColor: self.config.currentTrack.theme.stream.playedColor,
          loadedColor: self.config.currentTrack.theme.stream.loadedColor
        });

        self.config.waveform.redraw();

        // Save reference from track
        self.config.currentTrackSCObject = track;

        // Track is now ready!
        self.config.waveform.dataParseComplete = function() {
          CoreEvents.publish('/soundcloud/track/ready');
        };
      });

      return self;
    },

    setSizeWaveform: function() {
      var self = this;

      // Clear
      self.config.waveform.clear();

      // Update size
      self.config.waveform.updateSize(
        $('.player__ui_waveform').width(),
        $('.player__ui_waveform').height()
      );

      // Redraw
      self.config.waveform.redraw();

      return self;
    },

    destroyWaveform: function() {
      var self = this;

      $('.player__waveform canvas').transition({
        y: 10,
        opacity: 0
      }, 300, function() {
        $(this).remove();
      });

      return self;
    },

    handleUpdatePlayback: function(position, duration, eqData, waveformData) {
      var self = this;

      CoreEvents.publish('/player/playtime/update', [position, duration]);
    },

    getStream: function() {
      var self = this;

      SC.stream(self.config.currentTrackSCObject.uri, self.config.streamOptions, function(stream) {
        self.config.currentStream = stream;

        // Mute stream as we will play in audio context instead
        self.config.currentStream.setVolume(0);

        // Stream is now ready!
        CoreEvents.publish('/soundcloud/stream/ready');
      });

      return self;
    },

    startStream: function() {
      var self = this;

      self.config.currentStream.start();

      return self;
    },

    stopStream: function() {
      var self = this;

      self.config.currentStream.stop();

      return self;
    }
  };

  /**
   * Defaults
   */
  SoundCloudController.defaults = SoundCloudController.prototype.defaults;

  /**
   * Public
   */
  SoundCloudController.getTrack = getTrack;

  $.fn.SoundCloudController = function(options) {
    return this.each(function() {
      new SoundCloudController(this, options).init();
    });
  };

  return SoundCloudController;
});
