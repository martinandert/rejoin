'use strict';

module.exports = {
  name: 'Conversion',

  prototype: {
    toKey: function() {
      var key = this.getID();

      return key ? [key] : null;
    },

    toParam: function() {
      return this.isPersisted() ? this.toKey().join('-') : null;
    }
  }
};
