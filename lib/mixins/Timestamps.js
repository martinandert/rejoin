'use strict';

var filter = require('../utils/filter');
var hasProp = require('../utils/hasProp');

module.exports = {
  name: 'Timestamps',

  singleton: {
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
  },

  prototype: {
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
      return filter(this.getTimestampAttributesForCreate(), function(name) { return hasProp(this.constructor.attributeDefinitions, name); }, this);
    },

    getTimestampAttributesForUpdateInModel: function() {
      return filter(this.getTimestampAttributesForUpdate(), function(name) { return hasProp(this.constructor.attributeDefinitions, name); }, this);
    }
  }
};
