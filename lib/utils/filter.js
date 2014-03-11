'use strict';

function filter(arr, fn, context) {
  return arr.reduce(function(memo, item) {
    if (fn.call(context, item)) {
      memo.push(item);
    }

    return memo;
  }, []);
}

module.exports = filter;
