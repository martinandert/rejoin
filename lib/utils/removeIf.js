'use strict';

var splice = Array.prototype.splice;

function removeIf(arr, cb) {
  for (var i = arr.length - 1; i >= 0; i--) {
    if (cb(arr[i])) {
      splice.call(arr, i, 1);
    }
  }
}

module.exports = removeIf;
