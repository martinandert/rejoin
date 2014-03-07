'use strict';

module.exports = {
  methods: {
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
