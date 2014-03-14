'use strict';

var toString = Object.prototype.toString;

function isString(obj) {
  return typeof obj === 'string' || toString.call(obj) === '[object String]';
}

module.exports = isString;
