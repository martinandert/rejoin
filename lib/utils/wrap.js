'use strict';

function wrap() {
  var args = Array.prototype.slice.call(arguments);

  switch (args.length) {
    case 0:
      return [];
    case 1:
      return (args[0] === null || args[0] === undefined) ? [] : (args[0] instanceof Array) ? args[0] : [args[0]];
    default:
      return args;
  }
}

module.exports = wrap;
