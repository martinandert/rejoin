'use strict';

var models        = require('../core/ModelRegistry').models;
var getModelBase  = require('../core/ModelCreator').getModelBase;
var isPlainObject = require('../utils/isPlainObject');

module.exports = {
  name: "Inheritance",

  singleton: {
    new: function() {
      if (this.isAbstractModel() || this === getModelBase()) {
        throw new Error(this.name + ' is an abstract model and cannot be instantiated');
      }

      var attributes = Array.prototype.slice.call(arguments)[0];
      var subModel = null;

      if (this._shouldUseSubModelFromAttributes(attributes)) {
        subModel = this._getSubModelFromAttributes(attributes);
      }

      this._super.apply(subModel || this, arguments);
    },

    getBaseModel: function() {
      if (this.parentModel === getModelBase() || this.parentModel.isAbstractModel()) {
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
      if (this === getModelBase()) {
        return true;
      } else if (this.parentModel.isAbstractModel()) {
        return this.parentModel.finderNeedsSTICondition();
      } else {
        return this.parentModel !== getModelBase() && this.attributeNames.indexOf(this.getInheritanceColumn()) > -1;
      }
    },

    getTypeCondition: function(table) {
      table = table || this.getTable();

      var stiColumn = table[this.getInheritanceColumn()];
      var stiNames  = ([this].concat(this.descendants)).map(function(model) { return model.name; });

      return stiColumn.in(stiNames);
    },

    _shouldUseSubModelFromAttributes: function(attributes) {
      return this.attributeNames.indexOf(this.getInheritanceColumn()) > -1 && isPlainObject(attributes);
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
    }
  }
};
