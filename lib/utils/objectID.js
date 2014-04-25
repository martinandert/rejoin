'use strict';

var idCounter = 0;

Object.defineProperty(Object.prototype, '____objectID', {
  writable: true
});

Object.defineProperty(Object.prototype, '__objectID', {
  get: function() {
    if (typeof this.____objectID === 'undefined') {
      this.____objectID = ++idCounter;
    }

    return this.____objectID;
  }
});
