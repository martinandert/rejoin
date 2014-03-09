'use strict';

var Name = require('../core/Callback').Name;
var slice = Array.prototype.slice;

function cb(args) {
  return slice.call(args).pop();
}

module.exports = {
  prototype: {
    initialize: function() {
      this.runCallbacks(Name.INITIALIZE, this._super, cb(arguments));
    },

    find: function() {
      this.runCallbacks(Name.FIND, this._super, cb(arguments));
    },

    touch: function() {
      this.runCallbacks(Name.TOUCH, this._super, cb(arguments));
    },

    destroy: function() {
      this.runCallbacks(Name.DESTROY, this._super, cb(arguments));
    },

    _createOrUpdate: function() {
      this.runCallbacks(Name.SAVE, this._super, cb(arguments));
    },

    _createRecord: function() {
      this.runCallbacks(Name.CREATE, this._super, cb(arguments));
    },

    _updateRecord: function() {
      this.runCallbacks(Name.UPDATE, this._super, cb(arguments));
    }
  }
};
