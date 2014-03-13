'use strict';

var Inflector = require('inflected');

var MULTI_VALUE_METHODS   = ['includes', 'eager_load', 'preload', 'select', 'group', 'order', 'joins', 'where', 'having', 'bind', 'references', 'extending', 'unscope'];
var SINGLE_VALUE_METHODS  = ['limit', 'offset', 'lock', 'readonly', 'from', 'reordering', 'reverse_order', 'distinct', 'create_with', 'uniq'];

var methods = {};

MULTI_VALUE_METHODS.forEach(function(method) {
  var name = Inflector.camelize(method + '_values');

  methods['get' + name] = function(values) {
    if (typeof this.values[method] === 'undefined') {
      this.values[method] = [];
    }

    return this.values[method];
  };

  methods['set' + name] = function(values) {
    if (this.loaded) {
      throw new Error('a loaded relation is immutable');
    }

    this.values[method] = values;
    return this.values[method];
  };
});

SINGLE_VALUE_METHODS.forEach(function(method) {
  var name = Inflector.camelize(method + '_value');

  if (method !== 'create_with') {
    methods['get' + name] = function(values) {
      return this.values[method];
    };
  }

  methods['set' + name] = function(values) {
    if (this.loaded) {
      throw new Error('a loaded relation is immutable');
    }

    this.values[method] = values;
    return this.values[method];
  };
});

module.exports = methods;
