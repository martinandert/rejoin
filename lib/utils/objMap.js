'use strict';

var hasProp = require('./hasProp');

function objMap(obj, fn, context) {
  return Object.keys(obj).reduce(function(memo, key) {
    if (hasProp(obj, key)) {
      memo.push(fn.call(context, key, obj[key]));
    }

    return memo;
  }, []);
}

module.exports = objMap;
