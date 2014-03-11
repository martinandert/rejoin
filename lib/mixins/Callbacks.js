'use strict';

var Name = require('../core/Callback').Name;

module.exports = {
  name: 'Callbacks',

  prototype: {
    initialize: function() {
      this.runCallbacks(Name.INITIALIZE, this._super, arguments);
    },

    find: function() {
      this.runCallbacks(Name.FIND, this._super, arguments);
    },

    touch: function() {
      this.runCallbacks(Name.TOUCH, this._super, arguments);
    },

    destroy: function() {
      this.runCallbacks(Name.DESTROY, this._super, arguments);
    },

    _createOrUpdate: function() {
      this.runCallbacks(Name.SAVE, this._super, arguments);
    },

    _createRecord: function() {
      this.runCallbacks(Name.CREATE, this._super, arguments);
    },

    _updateRecord: function() {
      this.runCallbacks(Name.UPDATE, this._super, arguments);
    }
  }
};
