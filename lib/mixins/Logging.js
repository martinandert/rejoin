'use strict';

var slice = Array.prototype.slice;

module.exports = {
  name: "Logging",

  prototype: {
    _log: function() {
      var args = slice.call(arguments);
      args.unshift(' *** [Rejoin]  ' + this.constructor.name + ':');

      // jshint ignore:start
      console.log.apply(this, args);
      // jshint ignore:end
    }
  }
};
