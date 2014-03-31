'use strict';

var _       = require('lodash-node');
var sliced  = require('sliced');

function extendInto(left, right) {
  for (var key in right) {
    if (_.has(right, key)) {
      left[key] = right[key];
    }
  }
}

function extend() {
  var objs    = sliced(arguments);
  var result  = objs.shift();

  for (var i = 0, ii = objs.length; i < ii; i++) {
    extendInto(result, objs[i]);
  }

  return result;
}

module.exports = extend;
