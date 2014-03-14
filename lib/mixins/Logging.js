'use strict';

var sliced = require('sliced');

module.exports = {
  name: 'Logging',

  prototype: {
    _log: function() {
      var args = sliced(arguments);
      args.unshift(' *** [Rejoin]  ' + this.constructor.name + ':');

      // jshint ignore:start
      console.log.apply(this, args);
      // jshint ignore:end
    }
  }
};
