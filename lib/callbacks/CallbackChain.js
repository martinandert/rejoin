'use strict';

var Filters   = require('./Filters');
var remove    = require('../utils/remove');
var removeIf  = require('../utils/removeIf');
var extend    = require('../utils/extend');

var synchronized = require('synchronized');

function CallbackChain(name, config) {
  this._name   = name;
  this._config = extend({ scope: ['kind'] }, config);
  this._chain  = [];
  this._compilation = {};
}

CallbackChain.copy = function(other) {
  var chain = new CallbackChain();
  chain._name   = other._name;
  chain._config = other._config;
  chain._chain  = other._chain.slice();
  chain._compilation = {};

  return chain;
};

CallbackChain.prototype.getName = function() {
  return this._name;
};

CallbackChain.prototype.getConfig = function() {
  return this._config;
};

CallbackChain.prototype.forEach = function(fn, context) {
  return this._chain.forEach(fn, context);
};

CallbackChain.prototype.indexOf = function(callback) {
  return this._chain.indexOf(callback);
};

CallbackChain.prototype.isEmpty = function() {
  return this._chain.length === 0;
};

CallbackChain.prototype.insert = function(index, callback) {
  this._compilation = {};
  this._chain.splice(index, 0, callback);
};

CallbackChain.prototype.remove = function(callback) {
  this._compilation = {};
  remove(this._chain, callback);
};

CallbackChain.prototype.clear = function() {
  this._compilation = {};
  this._chain = [];
  return this;
};

CallbackChain.prototype.find = function(fn, context) {
  for (var i in this._chain) {
    var callback = this._chain[i];

    if (fn.call(context, callback)) {
      return callback;
    }
  }

  return undefined;
};

CallbackChain.prototype.compile = function(cb) {
  var self = this;

  synchronized(this._compilation, function(done) {
    var name = self.getName();

    if (self._compilation[name]) {
      return done(self._compilation[name]);
    }

    self._compilation[name] = self._chain.reduceRight(function(chain, callback) {
      return callback.apply(chain);
    }, Filters.End);

    done(self._compilation[name]);
  }, cb);
};

CallbackChain.prototype.append = function(callbacks) {
  callbacks.forEach(function(callback) {
    this._appendOne(callback);
  }, this);
};

CallbackChain.prototype.prepend = function(callbacks) {
  callbacks.forEach(function(callback) {
    this._prependOne(callback);
  }, this);
};

CallbackChain.prototype._appendOne = function(callback) {
  this._compilation = {};
  this._removeDuplicates(callback);
  this._chain.push(callback);
};

CallbackChain.prototype._prependOne = function(callback) {
  this._compilation = {};
  this._removeDuplicates(callback);
  this._chain.unshift(callback);
};

CallbackChain.prototype._removeDuplicates = function(callback) {
  this._compilation = {};

  removeIf(this._chain, function(c) {
    return callback.duplicates(c);
  });
};

module.exports = CallbackChain;
