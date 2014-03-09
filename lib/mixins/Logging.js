'use strict';

var slice = Array.prototype.slice;

module.exports = {
  prototype: {
    _log: function() {
      var args = slice.call(arguments);
      args.unshift(' *** [Rejoin]  ' + this.constructor.name + ':');
      console.log.apply(this, args);
    }
  }
};
