'use strict';

var Inflector = require('inflected');
var getModelBase = require('../core/ModelCreator').getModelBase;

module.exports = {
  name: "Schema",

  singleton: {
    initializeAttributes: function(attributes, options) {
      return attributes;
    },

    getTableName: function() {
      if (typeof this._tableName === 'undefined') {
        this._resetTableName();
      }

      return this._tableName;
    },

    setTableName: function(value) {
      this._tableName = value;
      return value;
    },

    _resetTableName: function() {
      this._tableName = (function(model) {
        if (model.isAbstractModel()) {
          return model.parentModel === getModelBase() ? null : model.parentModel.getTableName();
        } else if (model.parentModel.isAbstractModel()) {
          return model.parentModel.getTableName() || model._computeTableName();
        } else {
          return model._computeTableName();
        }
      })(this);
    },

    _computeTableName: function() {
      var base = this.getBaseModel();

      return (this === base) ? Inflector.tableize(this.name) : base.getTableName();
    },

    getInheritanceColumn: function() {
      if (typeof this._inheritanceColumn === 'undefined') {
        this._inheritanceColumn = null;
      }

      return this._inheritanceColumn || this.parentModel.getInheritanceColumn();
    },

    setInheritanceColumn: function(value) {
      this._inheritanceColumn = value;
    }
  }
};
