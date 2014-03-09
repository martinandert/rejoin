'use strict';

var extend = require('extend');

module.exports = {
  prototype: {
    getAttributes: function() {
      return extend({}, this._attributes);
    },

    getAttribute: function(name) {
      return this._attributes[name];
    },

    setAttribute: function(name, value) {
      this._attributes[name] = value;
      return value;
    },

    queryAttribute: function(name) {
      return !!this._attributes[name];
    }
  }
};
