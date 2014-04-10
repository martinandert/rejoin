'use strict';

var _         = require('lodash-node');
var Registry  = require('./ModelRegistry');

function subclass(parent, name) {
  if (!/^[A-Z][A-Za-z0-9_]*$/.test(name)) {
    throw new Error('invalid name: "' + name + '"');
  }

  var child = new Function('return function ' + name + '(){ return ' + name + '.parentModel.apply(this, arguments); }')(); // jshint ignore:line

  for (var key in parent) {
    if (_.has(parent, key)) {
      child[key] = parent[key];
    }
  }

  function Prototype() {
    this.constructor = child;
  }

  Prototype.prototype = parent.prototype;
  child.prototype = new Prototype();

  child.parentModel = parent;
  child.singletonMethods = [];
  child.inheritFunctions = [];
  child.descendants = [];

  parent.singletonMethods.forEach(function(name) {
    child[name] = parent[name];
    child.singletonMethods.push(name);
  });

  parent.inheritFunctions.forEach(function(fn) {
    fn(child);
    child.inheritFunctions.push(fn);
  });

  var current = parent;

  while (typeof current !== 'undefined' && typeof current.descendants !== 'undefined') {
    current.descendants.push(child);
    current = current.parentModel;
  }

  return child;
}

function createModel(name, parent, fn) {
  if (!fn) {
    fn = parent;
    parent = Base;
  }

  var model = subclass(parent, name);

  if (_.isFunction(fn)) {
    fn(model);
  }

  Registry.register(model);

  return model;
}

module.exports = {
  createModel: createModel
};

var Base = require('./Base');
