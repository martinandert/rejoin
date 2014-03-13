'use strict';

function partition(arr, fn, context) {
  var left = [], right = [];

  arr.forEach(function(elem) {
    if (fn.call(context, elem)) {
      left.push(elem);
    } else {
      right.push(elem);
    }
  });

  return [left, right];
}

module.exports = partition;
