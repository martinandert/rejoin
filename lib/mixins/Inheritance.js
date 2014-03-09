'use strict';

var getRejoinModel = require('../core/ModelCreator').getRejoinModel;

module.exports = {
  singleton: {
    new: function() {
      if (this.isAbstractModel() || this === getRejoinModel()) {
        throw new Error(this.name + ' is an abstract model and cannot be instantiated');
      }

      this._super.apply(this, arguments);
    },

    getBaseModel: function() {
      if (this.parentModel === getRejoinModel() || this.parentModel.isAbstractModel()) {
        return this;
      } else {
        return this.parentModel.getBaseClass();
      }
    },

    isAbstractModel: function() {
      return this._abstractModel === true;
    },

    setAbstractModel: function(value) {
      this._abstractModel = value;
    }
  }
};
