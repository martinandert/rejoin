'use strict';

var sql         = require('sql');
var extend      = require('extend');
var Relation    = require('../core/Relation');
var hasProp     = require('../utils/hasProp');
var isFunction  = require('../utils/isFunction');
var objMap      = require('../utils/objMap');
var compact     = require('../utils/compact');

module.exports = {
  name: 'Core',

  singleton: {
    getSqlTable: function() {
      if (typeof this._sqlTable === 'undefined') {
        this._sqlTable = sql.define({ name: this.getTableName(), columns: this.attributeNames });
      }

      return this._sqlTable;
    },

    _getRelation: function() {
      var relation = Relation.create(this, this.getSqlTable());

      if (this.finderNeedsSTICondition()) {
        var conditions = {};
        conditions[this.getInheritanceColumn()] = this.name;

        return relation.where(this.getTypeCondition()).createWith(conditions);
      } else {
        return relation;
      }
    },

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
      if (isFunction(attributes)) {
        cb = attributes;
        attributes = null;
      }

      var defaults = extend({}, this.constructor.attributeDefaults);
      this._attributes = this.constructor.initializeAttributes(defaults);

      attributes = attributes || {};

      this._initializeInternals();
      this._initializeInternalsCallback();
      this._initializeAttributes(attributes);

      this._super(cb);
    },

    populate: function(coder, cb) {
      var attributes = extend({}, this.constructor.attributeDefaults, coder.attributes);
      this._attributes = this.constructor.initializeAttributes(attributes);

      this._initializeInternals();

      this._isNew = false;

      cb(null, this);
    },

    freeze: function() {
      this._frozen = true;
      return this;
    },

    isFrozen: function() {
      return this._frozen;
    },

    inspect: function() {
      var pk = this.constructor.getPrimaryKey();

      var inspection = objMap(this.getAttributes(), function(name, value) {
        return value || name === pk ? name + ': ' + this.getAttributeForInspect(name) : null;
      }, this);

      inspection = compact(inspection).join(', ');

      return '#<' + this.constructor.name + ' ' + inspection + '>';
    },

    _initializeInternals: function() {
      var primaryKey = this.constructor.getPrimaryKey();

      if (!hasProp(this._attributes, primaryKey)) {
        this._attributes[primaryKey] = null;
      }

      this._isNew     = true;
      this._destroyed = false;
      this._frozen    = false;
    },

    _initializeAttributes: function(attributes, options) {
      this.setAttributes(attributes);
    },

    _initializeInternalsCallback: function() {
    }
  }
};
