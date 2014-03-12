'use strict';

var isString = require('./isPlainObject');
var isPlainObject = require('./isPlainObject');

function blank(val) {
  if (typeof val === 'undefined' || val === null) {
    return true;
  } else if ((isString(val) || Array.isArray(val)) && val.length === 0) {
    return true;
  } else if (isPlainObject(val) && Object.keys(val).length === 0) {
    return true;
  } else {
    return false;
  }
}

module.exports = blank;
