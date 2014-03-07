'use strict';

var slice = Array.prototype.slice;

module.exports = {
  methods: {
    _log: function() {
      var args = slice.call(arguments);
      args.unshift(' *** [Rejoin]  ' + this.constructor.modelName + ':');
      console.log.apply(this, args);
    }
  }
};
