'use strict';

var extend    = require('extend');
var isString  = require('../utils/isString');

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

    getAttributeForInspect: function(name) {
      var value = this.readAttribute(name);

      if (isString(value)) {
        if (value.length > 50) {
          value = value.slice(0, 50) + '...';
        }

        return "'" + value + "'";
      } else if (Array.isArray(value)) {
        if (value.length > 10) {
          return '[' + value.slice(0, 10).join(', ') + ', ...]';
        } else {
          return '[' + value.join(', ') + ']';
        }
      } else {
        return value.toString();
      }
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
