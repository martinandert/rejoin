'use strict';

module.exports = {
  name: 'Querying',

  singleton: {
    getAll: function() {
      return this._getRelation();
    },

    find: function() {
      this.getAll().find.apply(this, arguments);
    }
  }
};
