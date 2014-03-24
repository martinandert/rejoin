'use strict';

var isBlank = require('./isBlank');

function isPresent(val) {
  return !isBlank(val);
}

module.exports = isPresent;
