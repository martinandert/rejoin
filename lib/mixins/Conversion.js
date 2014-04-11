'use strict';

function ConversionMixin(model) {
  model.instanceMethods({
    toKey: function() {
      var key = this.getID();

      return key ? [key] : null;
    },

    toParam: function() {
      if (this.isPersisted()) {
        var key = this.toKey();

        return key ? key.join('-') : null;
      } else {
        return null;
      }
    }
  });
}

module.exports = ConversionMixin;
