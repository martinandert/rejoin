'use strict';

var _ = require('lodash-node');

function isBlank(val) {
  if (typeof val === 'undefined' || val === null) {
    return true;
  } else if (_.isString(val)) {
    return /^\s*$/.test(val);
  } if (_.isArray(val)) {
    return val.length === 0;
  } else if (_.isPlainObject(val)) {
    return _.keys(val).length === 0;
  } else {
    return false;
  }
}

module.exports = isBlank;
