'use strict';

var hasProp = require('../utils/hasProp');
var isFunc  = require('../utils/isFunc');

module.exports = {
  methods: {
    initialize: function(attributes, cb) {
      if (isFunc(attributes)) {
        cb = attributes;
        attributes = null;
      }

      attributes = attributes || {};

      // TODO
      this._attributes = /* this._assignAttributeDefaults() */ {};

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
      return '[' + this.constructor.modelName + ']';
    }
  }
};
