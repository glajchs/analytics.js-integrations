
var alias = require('alias');
var callback = require('callback');
var convertDates = require('convert-dates');
var integration = require('integration');
var load = require('load-script');
var push = require('global-queue')('_ufq');


/**
 * Expose plugin.
 */

module.exports = exports = function (analytics) {
  analytics.addIntegration(Userfox);
};


/**
 * Expose `Userfox` integration.
 */

var Userfox = exports.Integration = integration('userfox')
  .assumesPageview()
  .readyOnInitialize()
  .global('_ufq')
  .option('clientId', '');


/**
 * Initialize.
 *
 * https://www.userfox.com/docs/
 *
 * @param {Object} page
 */

Userfox.prototype.initialize = function (page) {
  window._ufq = [];
  this.load();
};


/**
 * Loaded?
 *
 * @return {Boolean}
 */

Userfox.prototype.loaded = function () {
  return !! (window._ufq && window._ufq.push !== Array.prototype.push);
};


/**
 * Load.
 *
 * @param {Function} callback
 */

Userfox.prototype.load = function (callback) {
  load('//d2y71mjhnajxcg.cloudfront.net/js/userfox-stable.js', callback);
};


/**
 * Identify.
 *
 * https://www.userfox.com/docs/#custom-data
 *
 * @param {String} id (optional)
 * @param {Object} traits (optional)
 * @param {Object} options (optional)
 */

Userfox.prototype.identify = function (id, traits, options) {
  traits = traits || {};
  if (!traits.email) return;

  // initialize the library with the email now that we have it
  push('init', {
    clientId: this.options.clientId,
    email: traits.email
  });

  traits = convertDates(traits, formatDate);
  traits = alias(traits, { created: 'signup_date' });
  push('track', traits);
};


/**
 * Convert a `date` to a format userfox supports.
 *
 * @param {Date} date
 * @return {String}
 */

function formatDate (date) {
  return Math.round(date.getTime() / 1000).toString();
}