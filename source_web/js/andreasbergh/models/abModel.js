/**
 * Model
 * This file contains the application model
 *
 * Author:
 * Markus Bergh, 2015
 */

define([
  'jquery'
],

function($) {

  'use strict';

  /**
   * Constructor
   */
  var ApplicationModel = function() {

    // Cached instance
    var instance;

    // Rewrite the constructor
    ApplicationModel = function() {
      return instance;
    };

    // Carry over the prototype
    ApplicationModel.prototype = this;

    // The instance
    instance = new ApplicationModel();

    // Reset the constructor pointer
    instance.constructor = ApplicationModel;

    // The settings
    this.current_id = null;
    this.current_track = null;

    this.getData = function() {
      return $.getJSON('/data/data.json');
    };

    this.setCurrentId = function(id) {
      this.current_id = id;
    };

    this.getCurrentId = function() {
      return this.current_id;
    };

    this.setCurrentTrack = function(track) {
      this.current_track = track;
    };

    this.getCurrentTrack = function() {
      return this.current_track;
    };

    return instance;
  };

  return new ApplicationModel();

});
