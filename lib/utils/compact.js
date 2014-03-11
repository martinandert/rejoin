'use strict';

function compact(arr) {
  return arr.filter(function(value) {
    return typeof value !== 'undefined' && value !== null;
  });
}

module.exports = compact;
