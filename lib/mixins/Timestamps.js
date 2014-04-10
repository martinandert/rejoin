'use strict';

var _ = require('lodash-node');

function TimestampsMixin(model) {
  model.classMethods({
    getRecordTimestamps: function() {
      if (typeof this._recordTimestamps === 'undefined') {
        this._recordTimestamps = this._resetRecordTimestamps();
      }

      return this._recordTimestamps;
    },

    setRecordTimestamps: function(value) {
      return (this._recordTimestamps = value);
    },

    _resetRecordTimestamps: function() {
      return this.setRecordTimestamps(this.isModelBase() ? false : this.parentModel.getRecordTimestamps());
    }
  });

  model.instanceMethods({
    _createRecord: function() {
      if (this.constructor.getRecordTimestamps()) {
        var now = new Date();

        this.getAllTimestampAttributes().forEach(function(name) {
          var definition = this.constructor.attributeDefinitions[name];

          if (definition && this.readAttribute(name) === null) {
            this.writeAttribute(name, now);
          }
        });
      }

      this._super.call(this, arguments);
    },

    _updateRecord: function() {
      if (this._shouldRecordTimestamps()) {
        var now = new Date();

        this.getTimestampAttributesForUpdateInModel().forEach(function(name) {
          if (!this.hasAttributeChanged(name)) {
            this.writeAttribute(name, now);
          }
        });
      }

      this._super.call(this, arguments);
    },

    _shouldRecordTimestamps: function() {
      return this.constructor.getRecordTimestamps() && this.hasChanges();
    },

    getAllTimestampAttributes: function() {
      return this.getTimestampAttributesForCreate().concat(this.getTimestampAttributesForUpdate());
    },

    getTimestampAttributesForCreate: function() {
      return ['created_at', 'created_on'];
    },

    getTimestampAttributesForUpdate: function() {
      return ['updated_at', 'updated_on'];
    },

    getAllTimestampAttributesInModel: function() {
      return this.getTimestampAttributesForCreateInModel().concat(this.getTimestampAttributesForUpdateInModel());
    },

    getTimestampAttributesForCreateInModel: function() {
      return this.getTimestampAttributesForCreate().filter(function(name) { return _.has(this.constructor.attributeDefinitions, name); }, this);
    },

    getTimestampAttributesForUpdateInModel: function() {
      return this.getTimestampAttributesForUpdate().filter(function(name) { return _.has(this.constructor.attributeDefinitions, name); }, this);
    }
  });
}

module.exports = TimestampsMixin;
