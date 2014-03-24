'use strict';

var _ = require('lodash-node');

function objMap(obj, fn, context) {
  return Object.keys(obj).reduce(function(memo, key) {
    if (_.has(obj, key)) {
      memo.push(fn.call(context, key, obj[key]));
    }

    return memo;
  }, []);
}

module.exports = objMap;
