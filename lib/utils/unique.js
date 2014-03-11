'use strict';

function unique(arr) {
  return arr.filter(function(value, index, self) {
    return self.indexOf(value) === index;
  });
}

module.exports = unique;
