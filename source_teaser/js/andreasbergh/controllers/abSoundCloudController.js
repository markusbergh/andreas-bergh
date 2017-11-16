/**
 * SoundCloud Controller
 * This file contains SoundCloud API interface
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

      self.setEvents();

      return self;
    },

    setEvents: function() {
      var self = this;

      CoreEvents.subscribe('/soundcloud/track/get', function(track) {
        self.getTrack(track);
      });

      CoreEvents.subscribe('/soundcloud/stream/start', function(track) {
        self.startStream();
      });

      CoreEvents.subscribe('/app/smartresize', function() {
        // Do nothing...
      });

      return self;
    },

    getTrack: function(trackUrl) {
      var self = this;

      SC.get('/resolve', { url: trackUrl }, function(track) {
        var src = 'http://api.soundcloud.com/tracks/' + track.id + '/stream?client_id=' + self.CLIENT_ID_SOUNDCLOUD;

        // Set source for audio visualisation
        CoreEvents.publish('/analyser/source/set', [src]);

        // Save reference from track
        self.config.currentTrack = track;

        // Dispatch event
        CoreEvents.publish('/soundcloud/track/ready');
      });

      return self;
    },

    getStream: function() {
      var self = this;

      SC.stream(self.config.currentTrack.uri, {}, function(stream) {
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
  //SoundCloudController.getTrack = getTrack;

  $.fn.SoundCloudController = function(options) {
    return this.each(function() {
      new SoundCloudController(this, options).init();
    });
  };

  return SoundCloudController;
});
