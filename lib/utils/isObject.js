'use strict';

var toString = Object.prototype.toString;

function isObject(obj) {
  return toString.call(obj) === '[object Object]';
}

module.exports = isObject;
