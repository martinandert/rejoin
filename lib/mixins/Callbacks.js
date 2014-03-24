'use strict';

var sliced  = require('sliced');
var Name    = require('../core/Callback').Name;

module.exports = {
  name: 'Callbacks',

  prototype: {
    initialize: function() {
      this.runCallbacks(Name.INITIALIZE, this._super, arguments);
    },

    populate: function() {
      var args  = sliced(arguments);
      var cb    = args.pop();
      var self  = this;

      // TODO: find a better way
      this._super.apply(this, args.concat(function(err, result) {
        self.runCallbacks(Name.FIND, function(err, result) {
          if (err) {
            cb(err);
          } else {
            result.runCallbacks(Name.INITIALIZE, function(err, result) {
              if (err) { cb(err); return; }

              cb(null, self);
            });
          }
        });
      }));
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
