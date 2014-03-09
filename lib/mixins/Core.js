'use strict';

var extend  = require('extend');
var hasProp = require('../utils/hasProp');
var isFunc  = require('../utils/isFunc');

module.exports = {
  prototype: {
    initialize: function(attributes, cb) {
      if (isFunc(attributes)) {
        cb = attributes;
        attributes = null;
      }

      var defaults = extend({}, this.constructor.attributeDefaults);
      this._attributes = this.constructor.initializeAttributes(defaults);

      attributes = attributes || {};

      if (!hasProp(attributes, 'id')) {
        this._attributes.id = null;
      }

      this._newRecord = true;
      this._destroyed = false;
      this._frozen = false;

      // TODO
      // this._attributes = this._assignAttributes(attributes);

      this._super(cb);
    },

    freeze: function() {
      this._frozen = true;
      return this;
    },

    isFrozen: function() {
      return this._frozen;
    },

    toString: function() {
      return '[' + this.constructor.name + ']';
    }
  }
};
