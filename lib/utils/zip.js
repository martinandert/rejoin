'use strict';

function zip(left, right) {
  var result = [];

  for (var i = 0, ii = left.length; i < ii; i++) {
    result.push([left[i], right[i]]);
  }

  return result;
}

module.exports = zip;
