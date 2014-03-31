'use strict';

function Result(resultFn) {
  this.fn = function(_, result) {
    return resultFn(result);
  };
}

module.exports = Result;