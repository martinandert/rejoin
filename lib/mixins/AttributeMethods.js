'use strict';

var extend = require('extend');

module.exports = {
  name: 'AttributeMethods',

  singleton: {
    getPrimaryKey: function() {
      if (typeof this._primaryKey === 'undefined') {
        this._primaryKey = this._resetPrimaryKey();
      }

      return this._primaryKey;
    },

    setPrimaryKey: function(value) {
      return (this._primaryKey = value);
    },

    _resetPrimaryKey: function() {
      return this.setPrimaryKey(this.isModelBase() ? 'id' : this.parentModel.getPrimaryKey());
    }
  },

  prototype: {
    getAttributes: function() {
      return extend({}, this._attributes);
    },

    readAttribute: function(name) {
      return this._attributes[name];
    },

    writeAttribute: function(name, value) {
      this._attributes[name] = value;
      return value;
    },

    queryAttribute: function(name) {
      return !!this.readAttribute(name);
    },

    getID: function() {
      return this.readAttribute(this.constructor.getPrimaryKey());
    },

    setID: function(value) {
      var key = this.constructor.getPrimaryKey();

      if (key) {
        return this.writeAttribute(key, value);
      }
    },

    hasID: function() {
      return this.queryAttribute(this.constructor.getPrimaryKey);
    }
  }
};
