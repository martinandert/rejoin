'use strict';

var _ = require('lodash-node');

function extractOptions(args, defaults) {
  var options = _.isPlainObject(_.last(args)) ? args.pop() : {};

  if (defaults) {
    _.defaults(options, defaults);
  }

  return options;
}

module.exports = extractOptions;
