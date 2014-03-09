'use strict';

function compact(arr) {
  return arr.reduce(function(memo, elem) {
    if (typeof elem !== 'undefined' && elem !== null) {
      memo.push(elem);
    }
    
    return memo;
  }, []);
}

module.exports = compact;
