'use strict';

var toString = Object.prototype.toString;

function isString(obj) {
  return toString.call(obj) === '[object String]';
}

module.exports = isString;
