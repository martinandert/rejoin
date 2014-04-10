'use strict';

function ConversionMixin(model) {
  model.instanceMethods({
    toKey: function() {
      var key = this.getID();

      return key ? [key] : null;
    },

    toParam: function() {
      return this.isPersisted() ? this.toKey().join('-') : null;
    }
  });
}

module.exports = ConversionMixin;
