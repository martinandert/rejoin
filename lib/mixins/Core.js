'use strict';

var hasProp = require('../utils/hasProp');
var isFunc = require('../utils/isFunc');

module.exports = {
  methods: {
    initialize: function(attributes, fn) {
      if (isFunc(attributes)) {
        fn = attributes;
        attributes = null;
      }

      this._attributes = /* this._assignAttributeDefaults() */ {};

      if (!hasProp(attributes, 'id')) {
        this._attributes.id = null;
      }

      this._newRecord = true;
      this._destroyed = false;
      this._frozen = false;

      if (attributes) {
        this._assignAttributes(attributes);
      }

      if (fn) {
        fn.call(this);
      }

      if (this._initializeCallbacks.length) {
        this._runCallbacks('initialize');
      }
    },

    freeze: function() {
      this._frozen = true;
      return this;
    }

    isFrozen: function() {
      return this._frozen;
    }

    toString: function() {
      return '[' + this.constructor.modelName + ']';
    }
  }
};