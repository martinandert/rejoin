'use strict';

function flatten(arr) {
  var result = [];

  for (var i = 0, ii = arr.length; i < ii; i++) {
    result = result.concat(Array.isArray(arr[i]) ? flatten(arr[i]) : arr[i]);
  }

  return result;
}

module.exports = flatten;
