'use strict';

var hasProp = require('./hasProp');

function objEach(obj, fn, context) {
  for (var key in obj) {
    if (hasProp(obj, key)) {
      fn.call(context, key, obj[key]);
    }
  }
}

module.exports = objEach;
