'use strict';

var extend  = require('extend');
var hasProp = require('../utils/hasProp');
var isFunc  = require('../utils/isFunc');
var objMap  = require('../utils/objMap');
var compact = require('../utils/compact');

module.exports = {
  name: 'Core',

  singleton: {
    inspect: function() {
      var superInspect = this._super();

      if (this.isModelBase()) {
        return superInspect;
      } else if (this.isAbstractModel()) {
        return superInspect + '(abstract)';
      } else {
        var attributes = objMap(this.attributeDefinitions, function(name, definition) {
          return name + ': ' + definition.type;
        });

        return superInspect + '(' + attributes.join(', ') + ')';
      }
    }
  },

  prototype: {
    initialize: function(attributes, cb) {
      if (isFunc(attributes)) {
        cb = attributes;
        attributes = null;
      }

      var defaults = extend({}, this.constructor.attributeDefaults);
      this._attributes = this.constructor.initializeAttributes(defaults);

      attributes = attributes || {};

      var primaryKey = this.constructor.getPrimaryKey();

      if (!hasProp(attributes, primaryKey)) {
        this._attributes[primaryKey] = null;
      }

      this._isNew = true;
      this._destroyed = false;
      this._frozen = false;

      this._initializeAttributes(attributes);

      this._super(cb);
    },

    freeze: function() {
      this._frozen = true;
      return this;
    },

    isFrozen: function() {
      return this._frozen;
    },

    inspect: function() {
      var inspection = objMap(this.getAttributes(), function(name, value) {
        return value ? name + ': ' + value.toString() : null;
      });

      inspection = compact(inspection).join(', ');

      return '#<' + this.constructor.name + ' ' + inspection + '>';
    },

    _initializeAttributes: function(attributes, options) {
      this.setAttributes(attributes);
    }
  }
};
