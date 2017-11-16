/**
 * Playlist
 * This file contains the playlist for music
 *
 * Author:
 * Markus Bergh, 2015
 */

define([
  'jquery',
  'waypoints',
  'pubsub',
  'models/abModel',
  // Unnamed dependencies
  'transit'
],

function($, Waypoint, CoreEvents, CoreModel) {

  'use strict';

  /**
   * Constructor
   */
  var Playlist = function(elem, options) {
    this.elem = elem;
    this.$elem = $(elem);
    this.options = options;
  };

  /**
   * Prototype
   */
  Playlist.prototype = {
    defaults: {
      $container: $('.playlist__container'),
      $playlist_nav: $('.playlist__container nav'),
      $playlist_title: $('.playlist__title'),
      $playlist_item: $('.playlist__item'),
      $playlist_powered_by: $('.playlist__powered_by'),
      $playlist_loader: $('.loader'),
      path_artwork: 'static/img/',
      url_artwork: 'url(%artwork%.jpg)',
      playlist_scrolled_into_view: null,
      GAP_PLAY_ICON: 85,
      data: null,
      model: null
    },

    init: function() {
      var self = this;

      // Introduce defaults that can be extended either globally or using an object literal.
      self.config = $.extend({}, this.defaults, this.options);

      self.getData();
    },

    getData: function() {
      var self = this;

      self.config.model = CoreModel;
      self.config.model.getData().done(function(data) {
        self.config.data = data;

        for(var index in self.config.data) {
          if(self.config.data.hasOwnProperty(index)) {
            var mix = self.config.data[index];
            self.setData(mix);
          }
        }

        self.setDefaultBackground();
        self.setDefaultPlaylistState();
        self.setPlaylistPosition();
        self.setPlaylistSize();
        self.setListeners();

        CoreEvents.publish('/app/is/ready');
      });

      return self;
    },

    setData: function(data) {
      var self = this;

      $.each(self.config.$playlist_nav.find('a'), function(i, elem) {
        var $elem = $(elem);

        if (parseInt($elem.data('playlist-id'), 10) === data.id) {

          // Set metadata
          $elem.find('.mix__metadata--title').text(data.title);
          $elem.find('.mix__metadata--date').text(data.date);
          $elem.find('.mix__metadata--genre').text('Genre: ' + data.genre);
          $elem.find('.mix__metadata--duration').text('Time: ' + data.duration);

          // Set artwork
          $elem.data('playlist-item-artwork', data.artwork);

          return false;
        }
      });

      return self;
    },

    setListeners: function() {
      var self = this;

      $.each(self.config.$playlist_nav.find('a'), function(i, elem) {
        var $elem = $(elem);
        var $parent = $(elem).parent();

        $elem.hover(function(e) {
          self.setBackground($elem.data('playlist-item-artwork'));

          // Scale up
          $elem.transition({
            scale: 1.05
          }, 600);
        }, function(e) {
          // Scale down
          $elem.transition({
            scale: 1
          }, 600);
        });

        $elem.on('click', { self: self }, self.onClickPlaylistItem);
      });

      self.config.playlist_scrolled_into_view = new Waypoint({
        element: self.config.$playlist_item,
        handler: function(direction) {
          if(direction === 'up') {
            self.hidePlaylist();
            self.hidePoweredBySoundCloud();
          } else {
            self.showPlaylist();
            self.showPoweredBySoundCloud();
          }
        },
        offset: '80%'
      });

      CoreEvents.subscribe('/app/resize', function() {
        self.setPlaylistPosition();
        self.setPlaylistSize();
      });

      CoreEvents.subscribe('/player/is/hidden', function() {
        self.enableScrollEvent();
        self.showPlaylist();
      });

      return self;
    },

    onClickPlaylistItem: function(e) {
      var self = e.data.self;

      e.preventDefault();

      // Get id
      var id = $(this).data('playlist-id');

      // Set current id in model
      self.config.model.setCurrentId(id);

      // Match track with id
      for(var index in self.config.data) {
        var track = self.config.data[index];
        if(track.id == id) {
          // Set current track
          self.config.model.setCurrentTrack(track);

          // Disabling waypoint events for now
          self.disableScrollEvent();

          // Hide playlist
          self.hidePlaylist(true);

          break;
        }
      }

      return self;
    },

    setPlaylistPosition: function() {
      var self = this;

      self.$elem.css({
        top: $(window).height()
      });

      return self;
    },

    setDefaultPlaylistState: function() {
      var self = this;

      $.each(self.config.$playlist_nav.find('a'), function(i, elem) {
        var $elem = $(elem);

        $elem.css({
          y: 10,
          opacity: 0
        });
      });

      self.config.$playlist_title.css({
        y: 10,
        opacity: 0
      });

      self.config.$playlist_powered_by.css({
        y: 10,
        opacity: 0
      });

      return self;
    },

    setPlaylistSize: function() {
      var self = this,
      width_container = self.config.$container.width(),
      width_item = width_container / 3;

      $.each(self.$elem.find('li'), function(i, elem) {
        var $elem = $(elem),
        $link = $elem.find('a'),
        index = i,
        left_pos = 0,
        right_pos = 'auto';

        $elem.css({
          width: width_item,
          left: i * width_item
        });

        var mq = window.matchMedia('all and (min-width: 1700px)');
        if(mq.matches) {
          if(index > 0 && index < self.$elem.find('li').length - 1) {
            left_pos = width_item / 2 - $link.outerWidth() / 2;
          } else if(index === self.$elem.find('li').length - 1) {
            left_pos = 'auto';
            right_pos = 0;
          }
        } else {
          left_pos = width_item / 2 - $link.outerWidth() / 2;
        }

        $link.css({
          top: self.config.$container.height() / 2 - $link.outerHeight() / 2 - self.config.GAP_PLAY_ICON / 2,
          left: left_pos,
          right: right_pos
        });
      });

      self.config.$playlist_title.css({
        left: self.$elem.find('li:first-child a').position().left
      });

      return self;
    },

    disableScrollEvent: function() {
      var self = this;

      self.config.playlist_scrolled_into_view.disable();

      return self;
    },

    enableScrollEvent: function() {
      var self = this;

      self.config.playlist_scrolled_into_view.enable();

      return self;
    },

    showPlaylist: function() {
      var self = this;

      $.each(self.config.$playlist_nav.find('a'), function(i, elem) {
        var $elem = $(elem);

        $elem.css({
          display: 'block'
        });

        $elem.transition({
          y: 0,
          opacity: 1,
          delay: 100 * i
        }, 300, 'out');
      });

      return self;
    },

    showPoweredBySoundCloud: function() {
      var self = this;

      self.config.$playlist_powered_by.transition({
        y: 0,
        opacity: 1
      }, 300);

      return self;
    },

    hidePoweredBySoundCloud: function() {
      var self = this;

      self.config.$playlist_powered_by.transition({
        y: 10,
        opacity: 0
      }, 300);

      return self;
    },

    hidePlaylist: function(callback) {
      var self = this,
      len = self.config.$playlist_nav.find('a').length,
      useCallback = callback || false;

      $.each(self.config.$playlist_nav.find('a'), function(i, elem) {
        var $elem = $(elem);

        $elem.transition({
          y: 10,
          opacity: 0,
          delay: 100 * i
        }, 300, 'in', function() {
          if(useCallback) {
            $elem.css({
              display: 'none'
            });

            if(i === 0) {
              self.playItem();
            }
          }
        });
      });

      return self;
    },

    playItem: function() {
      var self = this;

      // Get current track
      var track = self.config.model.getCurrentTrack();

      // Set theme to loader
      self.config.$playlist_loader.find('.player__loader').css({
        color: track.theme.default.innerColor
      });

      // Show loader
      self.config.$playlist_loader.removeClass('is-hidden');

      // Create visuals
      CoreEvents.publish('/visuals/create');

      // Dispatch event
      CoreEvents.publish('/soundcloud/track/get');

      return self;
    },

    setDefaultBackground: function() {
      var self = this;

      self.setBackground(self.config.data[0].artwork);

      return self;
    },

    setBackground: function(item_artwork) {
      var self = this;

      var artwork_image = item_artwork,
      artwork_url = self.config.path_artwork + artwork_image,
      artwork_to_use = self.config.url_artwork.replace('%artwork%', artwork_url);

      $('.artwork').css({
        backgroundImage: artwork_to_use
      });

      return self;
    }
  };

  /**
   * Defaults
   */
  Playlist.defaults = Playlist.prototype.defaluts;

  $.fn.Playlist = function(options) {
    return this.each(function() {
      new Playlist(this, options).init();
    });
  };

  return Playlist;
});
