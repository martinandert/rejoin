'use strict';

var _       = require('lodash-node');
var all     = require('../utils/all');
var wrap    = require('../utils/wrap');
var isBlank = require('../utils/isBlank');

function Errors(record) {
  this.record = record;
  this.messages = {};
}

Errors.prototype.clear = function() {
  this.messages = {};
};

Errors.prototype.hasKey = function(key) {
  return this.get(key).length > 0;
};

Errors.prototype.get = function(key) {
  if (_.isUndefined(this.messages[key])) {
    this.messages[key] = [];
  }

  return this.messages[key];
};

Errors.prototype.set = function(key, value) {
  this.get(key).push(value);
};

Errors.prototype.remove = function(key) {
  this.messages = _.omit(this.messages, key);
};

Errors.prototype.each = function(cb) {
  _.forOwn(this.messages, function(errors, key) {
    _.forEach(errors, function(error) {
      cb(key, error);
    });
  });
};

Errors.prototype.getKeys = function() {
  return _.keys(this.messages);
};

Errors.prototype.getValues = function() {
  return _.values(this.messages);
};

Errors.prototype.getSize = function() {
  return _.flatten(this.getValues()).length;
};

Errors.prototype.toArray = function() {
  return this.getFullMessages();
};

Errors.prototype.getCount = function() {
  return this.toArray.length;
};

Errors.prototype.isEmpty = function() {
  return all(this.getValues(), _.isEmpty);
};

Errors.prototype.toJSON = function(options) {
  _.defaults(options, { fullMessages: false });

  return JSON.stringify(this.toHash(options.fullMessages));
};

Errors.prototype.toHash = function(fullMessages) {
  if (fullMessages) {
    var messages = {};

    _.forOwn(this.messages, function(errors, key) {
      messages[key] = _.map(errors, function(error) {
        return this.getFullMessage(key, error);
      });
    });

    return messages;
  } else {
    return _.clone(this.messages);
  }
};

Errors.prototype.add = function(key, error, options) {
  error   = error || 'invalid';
  options = options || {};

  error = this.normalizeError(key, error, options);

  this.set(key, error);
};

Errors.prototype.addOnEmpty = function(keys, options) {
  _.forEach(wrap(keys), function(key) {
    var value = this.record.readAttributeForValidation(key);

    if (_.isEmpty(value)) {
      this.add(key, 'empty', options);
    }
  });
};

Errors.prototype.addOnBlank = function(keys, options) {
  _.forEach(wrap(keys), function(key) {
    var value = this.record.readAttributeForValidation(key);

    if (isBlank(value)) {
      this.add(key, 'blank', options);
    }
  });
};

module.exports = {};
