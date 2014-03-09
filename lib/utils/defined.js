'use strict';

function defined(obj) {
  return typeof obj !== 'undefined' && obj !== null;
}

module.exports = defined;
