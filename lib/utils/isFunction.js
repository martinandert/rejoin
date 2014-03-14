'use strict';

var toString = Object.prototype.toString;

function isFunction(obj) {
  return typeof obj === 'function' || toString.call(obj) === '[object Function]';
}

module.exports = isFunction;
