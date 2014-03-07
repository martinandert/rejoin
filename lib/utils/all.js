'use strict';

function all(arr, fn) {
  for (var i = 0, ii = arr.length; i < ii; i++) {
    if (!fn(arr[i])) {
      return false;
    }
  }

  return true;
}

module.exports = all;
