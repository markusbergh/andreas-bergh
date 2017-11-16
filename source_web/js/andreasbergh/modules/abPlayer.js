/**
 * Player
 * This file contains the player user interface
 *
 * Author:
 * Markus Bergh, 2015
 */

define([
  'jquery',
  'pubsub',
  'models/abModel'
],

function($, CoreEvents, CoreModel) {

  'use strict';

  /**
   * Constructor
   */
  var Player = function(elem, options) {
    this.elem = elem;
    this.$elem = $(elem);
    this.options = options;
    this.totalDuration = 0;
  };

  /**
   * Prototype
   */
  Player.prototype = {
    defaults: {
      $body: $('body'),
      $player: $('.player'),
      $player_ui_controls: $('.player__ui_controls'),
      $player_ui_title: $('.player__ui_title'),
      $player_ui_genre: $('.player__ui_genre'),
      $player_ui_waveform: $('.player__ui_waveform'),
      $player_ui_time_current: $('.player__ui_time--current'),
      $player_ui_time_start: $('.player__ui_time--start'),
      $player_ui_time_total: $('.player__ui_time--total'),
      $player_ui_play: $('.player__ui_control--play'),
      $player_ui_stop: $('.player__ui_control--stop')
    },

    init: function() {
      var self = this;

      // Introduce defaults that can be extended either globally or using an object literal.
      self.config = $.extend({}, this.defaults, this.options);

      // Set position
      self.setPlayerPosition();

      // Set listeners
      self.setListeners();

      // Set waveform width
      self.setWaveformWidth();

      // Set events
      self.setEvents();

      // Set default state
      self.setDefaultPlayerState();
    },

    setEvents: function() {
      var self = this;

      self.config.$player_ui_stop.on('click', { self: self }, self.onClickPlayerStop);

      return self;
    },

    setListeners: function() {
      var self = this;

      CoreEvents.subscribe('/player/stop', function() {
        // Stop stream
        CoreEvents.publish('/soundcloud/stream/stop');
        CoreEvents.publish('/analyser/source/stop');
      });

      CoreEvents.subscribe('/player/hide', function() {
        // Fade out visuals
        CoreEvents.publish('/visuals/fade/out');

        // Animate out
        self.hidePlayer();
      });

      CoreEvents.subscribe('/player/is/hidden', function() {
        self.config.$player.addClass('is-hidden');
        self.config.$body.removeClass('no-scroll');
      });

      CoreEvents.subscribe('/player/show', function() {
        console.log('/player/show');

        self.config.$player.removeClass('is-hidden');
        self.config.$body.addClass('no-scroll');

        // Set theme
        self.setPlayerUITheme();

        // Animate in
        self.showPlayer();
      });

      CoreEvents.subscribe('/player/playtime/total', function(duration) {
        console.log('/player/playtime/total');

        // Update total time
        self.setPlayTimeTotal(duration);
      });

      CoreEvents.subscribe('/player/genre/set', function(genre) {
        self.setStreamGenre(genre);
      });

      CoreEvents.subscribe('/player/title/set', function(title) {
        self.setStreamTitle(title);
      });

      CoreEvents.subscribe('/player/playtime/update', function(duration, total) {
        self.updatePlayTime(duration, total);
      });

      CoreEvents.subscribe('/app/resize', function() {
        self.setPlayerPosition();
        self.setWaveformWidth();
      });

      return self;
    },

    setPlayerUITheme: function() {
      var self = this;

      var model = CoreModel;
      var track = model.getCurrentTrack();

      self.config.$player_ui_stop.find('i').css({
        background: track.theme.default.innerColor
      });

      return self;
    },

    setWaveformWidth: function() {
      var self = this;

      self.config.$player_ui_waveform.css({
        width: self.config.$player_ui_controls.width() - 90
      });

      CoreEvents.publish('/player/update/waveform');

      return self;
    },

    setPlayTimeTotal: function(duration) {
      var self = this;

      self.totalDuration = duration;
      self.config.$player_ui_time_total.text(self.getParsedDuration(duration));

      return self;
    },

    getParsedDuration: function(milliseconds) {
      var self = this;

      var minutes = Math.floor(milliseconds / 60000);
      var seconds = ((milliseconds % 60000) / 1000).toFixed(0);

      return minutes + ":" + (seconds < 10 ? '0' : '') + seconds;
    },

    setStreamTitle: function(title) {
      var self = this;

      self.config.$player_ui_title.text(title);

      return self;
    },

    setStreamGenre: function(genre) {
      var self = this;

      self.config.$player_ui_genre.text('#' + genre);

      return self;
    },

    updatePlayTime: function(duration, total) {
      var self = this;

      self.config.$player_ui_time_current.text(self.getParsedDuration(duration) + ' / ' + self.getParsedDuration(self.totalDuration));

      return self;
    },

    setDefaultPlayerState: function() {
      var self = this;

      self.config.$player_ui_time_current.css({
        y: 10,
        opacity: 0
      });

      self.config.$player_ui_title.css({
        y: 10,
        opacity: 0
      });

      self.config.$player_ui_genre.css({
        y: 10,
        opacity: 0
      });

      self.config.$player_ui_stop.css({
        opacity: 0,
        y: 15
      });

      self.config.$player_ui_waveform.css({
        opacity: 0,
        y: 15
      });

      self.config.$player_ui_time_start.css({
        opacity: 0,
        y: 10
      });

      self.config.$player_ui_time_total.css({
        opacity: 0,
        y: 10
      });

      return self;
    },

    showPlayer: function() {
      var self = this;

      self.showPlayerUI();
      self.showPlayerWaveform();

      return self;
    },

    showPlayerUI: function() {
      var self = this;

      self.config.$player_ui_time_current.transition({
        y: 0,
        opacity: 1,
        delay: 300
      }, 300, 'out');

      self.config.$player_ui_title.transition({
        y: 0,
        opacity: 1,
        delay: 450,
      }, 300, 'out');

      self.config.$player_ui_genre.transition({
        y: 0,
        opacity: 1,
        delay: 600
      }, 300, 'out');

      self.config.$player_ui_stop.transition({
        y: 0,
        opacity: 1,
        delay: 700
      }, 300, 'out');

      return self;
    },

    showPlayerWaveform: function() {
      var self = this;

      self.config.$player_ui_waveform.transition({
        opacity: 1,
        y: 0,
        delay: 750
      }, 300);

      self.config.$player_ui_time_start.transition({
        opacity: 1,
        y: 0,
        delay: 900
      }, 300);

      self.config.$player_ui_time_total.transition({
        opacity: 1,
        y: 0,
        delay: 1050
      }, 300, function() {
        CoreEvents.publish('/player/is/ready');
      });

      return self;
    },

    hidePlayer: function() {
      var self = this;

      self.hidePlayerUI();
      self.hidePlayerWaveform();

      return self;
    },

    hidePlayerUI: function() {
      var self = this;

      self.config.$player_ui_time_current.transition({
        y: 10,
        opacity: 0,
        delay: 300
      }, 300, 'out');

      self.config.$player_ui_title.transition({
        y: 10,
        opacity: 0,
        delay: 450,
      }, 300, 'out');

      self.config.$player_ui_genre.transition({
        y: 10,
        opacity: 0,
        delay: 600
      }, 300, 'out');

      self.config.$player_ui_stop.transition({
        y: 10,
        opacity: 0,
        delay: 700
      }, 300, 'out');

      return self;
    },

    hidePlayerWaveform: function() {
      var self = this;

      self.config.$player_ui_waveform.transition({
        opacity: 0,
        y: 1,
        delay: 750
      }, 300);

      self.config.$player_ui_time_start.transition({
        opacity: 0,
        y: 1,
        delay: 900
      }, 300);

      self.config.$player_ui_time_total.transition({
        opacity: 0,
        y: 1,
        delay: 1050
      }, 300, function() {
        CoreEvents.publish('/player/is/hidden');
      });

      return self;
    },

    onClickPlayerStop: function(e) {
      var self = e.data.self;

      e.preventDefault();

      CoreEvents.publish('/player/stop');
      CoreEvents.publish('/player/hide');

      return self;
    },

    setPlayerPosition: function() {
      var self = this;

      self.$elem.css({
        top: $(window).height()
      });

      return self;
    }
  };

  /**
   * Defaults
   */
  Player.defaults = Player.prototype.defaluts;

  $.fn.Player = function(options) {
    return this.each(function() {
      new Player(this, options).init();
    });
  };

  return Player;
});
