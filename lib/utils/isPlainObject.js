'use strict';

function isPlainObject(value) {
  return value && typeof value === 'object' &&
    value.__proto__ === Object.prototype; // jshint ignore:line
}

module.exports = isPlainObject;
