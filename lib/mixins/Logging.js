'use strict';

var sliced = require('sliced');

function LoggingMixin(model) {
  model.instanceMethods({
    _log: function() {
      var args = sliced(arguments);
      args.unshift(' *** [Rejoin]  ' + this.constructor.name + ':');

      // jshint ignore:start
      console.log.apply(this, args);
      // jshint ignore:end
    }
  });
}

module.exports = LoggingMixin;
