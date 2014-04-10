'use strict';

var _         = require('lodash-node');
var sliced    = require('sliced');
var isBlank   = require('../utils/isBlank');
var isPresent = require('../utils/isPresent');

function DirtyTrackingMixin(model) {
  model.instanceMethods({
    save: function() {
      var args = sliced(arguments);
      var cb = args.pop();

      return this._super.apply(this, args.concat(function(err, result) {
        if (err) { cb(err); return; }

        this._changesApplied();
        cb(null, result);
      }));
    },

    getChangedAttributes: function() {
      if (_.isUndefined(this._changedAttributes)) {
        this._changedAttributes = {};
      }

      return this._changedAttributes;
    },

    getPreviouslyChangedAttributes: function() {
      if (_.isUndefined(this._previouslyChangedAttributes)) {
        this._previouslyChangedAttributes = {};
      }

      return this._previouslyChangedAttributes;
    },

    hasChanged: function() {
      return !_.isEmpty(this.getChangedAttributes());
    },

    getChangedAttributeNames: function() {
      return _.keys(this.getChangedAttributes());
    },

    getChanges: function() {
      return _.reduce(this.getChangedAttributeNames(), function(memo, name) {
        memo[name] = this.getAttributeChange(name);
        return memo;
      }, {}, this);
    },

    hasAttributeChanged: function(name, options) {
      options = options || {};

      var result = _.has(this.getChangedAttributes(), name);

      if (_.has(options, 'to')) {
        var definition = this.constructor.attributeDefinitions[name];
        result = result && options.to == this[definition.getterMethodName]();
      }

      if (_.has(options, 'from')) {
        result = result && options.from == this.getChangedAttributes()[name];
      }

      return result;
    },

    getAttributeChange: function(name) {
      if (this.hasAttributeChanged(name)) {
        var definition = this.constructor.attributeDefinitions[name];
        return [this.getChangedAttributes()[name], this[definition.getterMethodName]()];
      } else {
        return null;
      }
    },

    getAttributeWas: function(name) {
      if (this.hasAttributeChanged(name)) {
        return this.getChangedAttributes()[name];
      } else {
        var definition = this.constructor.attributeDefinitions[name];
        return this[definition.getterMethodName]();
      }
    },

    setAttributeWillChange: function(name) {
      if (this.hasAttributeChanged(name)) {
        return;
      }

      var definition = this.constructor.attributeDefinitions[name];
      var value = this[definition.getterMethodName]();

      this.getChangedAttributes()[name] = _.clone(value);
    },

    resetAttribute: function(name) {
      if (this.hasAttributeChanged(name)) {
        var definition = this.constructor.attributeDefinitions[name];
        this[definition.setterMethodName](this.getChangedAttributes()[name]);
        this._changedAttributes = _.omit(this._changedAttributes, name);
      }
    },

    _changesApplied: function() {
      this._previouslyChangedAttributes = this.getChanges();
      this._changedAttributes = {};
    },

    _resetChanges: function() {
      this._previouslyChangedAttributes = {};
      this._changedAttributes = {};
    },

    _initializeInternalsHock: function() {
      this._super();
      this._initializeChangedAttributes();
    },

    _initializeChangedAttributes: function() {
      this._changedAttributes = {};

      _.forOwn(this.constructor.attributeDefinitions, function(definition, name) {
        var originalValue = definition.default;

        if (this._fieldChanged(name, originalValue, this._attributes[name])) {
          this._changedAttributes[name] = originalValue;
        }
      }, this);
    },

    writeAttribute: function(name, value) {
      this._saveChangedAttribute(name, value);
      return this._super(name, value);
    },

    _saveChangedAttribute: function(name, value) {
      var old;

      if (this.hasAttributeChanged(name)) {
        old = this.getChangedAttributes()[name];

        if (!this._fieldChanged(name, old, value)) {
          this._changedAttributes = _.omit(this._changedAttributes, name);
        }
      } else {
        old = this._cloneAttributeValue('readAttribute', name);

        if (this._fieldChanged(name, old, value)) {
          this.getChangedAttributes()[name] = old;
        }
      }
    },

    _createRecord: function(cb) {
      return this._super(this._getKeysForPartialWrite(), cb);
    },

    _updateRecord: function(cb) {
      return this._super(this._getKeysForPartialWrite(), cb);
    },

    _getKeysForPartialWrite: function() {
      return this.getChangedAttributeNames();
    },

    _fieldChanged: function(name, old, value) {
      var definition = this.constructor.attributeDefinitions[name];

      if (definition.isNumeric() && (this._changesFromNullToEmptyString(definition, old, value) || this._changesFromZeroToString(old, value))) {
        value = null;
      } else {
        value = definition.typeCast(value);
      }

      return old !== value;
    },

    _changesFromNullToEmptyString: function(definition, old, value) {
      return definition.allowNull && (old === null || old === 0) && isBlank(value);
    },

    _changesFromZeroToString: function(old, value) {
      return old === 0 && _.isString(value) && isPresent(value) && !/^0+(\.0+)?$/.test(value);
    }
  });
}

DirtyTrackingMixin.mixedIn = function(model) {
  model.attributeMethodAffix({ prefix: 'has', suffix: 'Changed' });
  model.attributeMethodAffix({ prefix: 'get', suffix: 'Change' });
  model.attributeMethodAffix({ prefix: 'get', suffix: 'Was' });
  model.attributeMethodAffix({ prefix: 'set', suffix: 'WillChange' });
  model.attributeMethodPrefix('reset');
};

module.exports = DirtyTrackingMixin;
