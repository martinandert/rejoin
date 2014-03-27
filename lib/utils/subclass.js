'use strict';

var _         = require('lodash-node');
var override  = require('./override');

function subclass(parent, name, methods) {
  if (!/^[A-Z][A-Za-z0-9]+$/.test(name)) {
    throw new Error('invalid name: "' + name + '"');
  }

  var child = new Function('return function ' + name + '(){ return ' + name + '.__parent.apply(this, arguments); }')(); // jshint ignore:line
  var key;

  for (key in parent) {
    if (_.has(parent, key)) {
      child[key] = parent[key];
    }
  }

  function Prototype() {
    this.constructor = child;
  }

  Prototype.prototype = parent.prototype;
  child.prototype = new Prototype();
  child.__parent = parent;

  for (key in methods) {
    override(child.prototype, parent.prototype, key, methods[key]);
  }

  return child;
}

module.exports = subclass;
