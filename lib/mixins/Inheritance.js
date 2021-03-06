'use strict';

var _         = require('lodash-node');
var sliced    = require('sliced');
var models    = require('../ModelRegistry').models;
var isPresent = require('../utils/isPresent');

function InheritanceMixin(model) {
  model.classMethods({
    new: function() {
      if (this.isAbstractModel() || this.isModelBase()) {
        throw new Error(this.name + ' is an abstract model and cannot be instantiated');
      }

      var attributes = sliced(arguments)[0];
      var subModel = null;

      if (this._shouldUseSubModelFromAttributes(attributes)) {
        subModel = this._getSubModelFromAttributes(attributes);
      }

      this._super.apply(subModel || this, arguments);
    },

    getBaseModel: function() {
      if (this.parentModel.isModelBase() || this.parentModel.isAbstractModel()) {
        return this;
      } else {
        return this.parentModel.getBaseModel();
      }
    },

    isAbstractModel: function() {
      return this._abstractModel === true;
    },

    setAbstractModel: function(value) {
      this._abstractModel = value;
    },

    finderNeedsSTICondition: function() {
      if (this.isModelBase()) {
        return true;
      } else if (this.parentModel.isAbstractModel()) {
        return this.parentModel.finderNeedsSTICondition();
      } else {
        return !this.parentModel.isModelBase() && this.attributeNames.indexOf(this.getInheritanceColumn()) > -1;
      }
    },

    getTypeCondition: function(table) {
      table = table || this.getSqlTable();

      var stiColumn = table[this.getInheritanceColumn()];
      var stiNames  = ([this].concat(this.descendants)).map(function(model) { return model.name; });

      return stiColumn.in(stiNames);
    },

    _shouldUseSubModelFromAttributes: function(attributes) {
      return this.attributeNames.indexOf(this.getInheritanceColumn()) > -1 && _.isPlainObject(attributes);
    },

    _getSubModelFromAttributes: function(attributes) {
      var subModelName = attributes[this.getInheritanceColumn()];

      if (typeof subModelName !== 'undefined' && subModelName !== null && subModelName.length > 0) {
        var subModel = models[subModelName];

        if (this.descendants.indexOf(subModel) === -1) {
          throw new Error('invalid single-table inheritance type: ' + subModelName + ' does not extend ' + this.name);
        }

        return subModel;
      } else {
        return null;
      }
    },

    _discriminateModelForRecord: function(record) {
      if (this._usingSingleTableInheritance(record)) {
        return models[record[this.getInheritanceColumn()]];
      } else {
        return this._super(record);
      }
    },

    _usingSingleTableInheritance: function(record) {
      return isPresent(record[this.getInheritanceColumn()]) && this.attributeNames.indexOf(this.getInheritanceColumn()) > -1;
    }
  });

  model.instanceMethods({
    _initializeInternalsHock: function() {
      this._super();
      this._ensureProperType();
    },

    _ensureProperType: function() {
      var model = this.constructor;

      if (model.finderNeedsSTICondition()) {
        this.writeAttribute(model.getInheritanceColumn(), model.name);
      }
    }
  });
}

module.exports = InheritanceMixin;
