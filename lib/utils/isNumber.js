'use strict';

var toString = Object.prototype.toString;

function isNumber(value) {
  return toString.call(value) === '[object Number]' && !isNaN(value);
}

module.exports = isNumber;
