'use strict';

var Callbacks = require('callbacks');
var Attributes = require('./Attributes');
var defineMethodWithSuper = require('./defineMethodWithSuper');

var wrap = require('../utils/wrap');

function extend(parent, child) {
  function Ctor() {
    this.constructor = child;
  }

  Ctor.prototype = parent.prototype;
  child.prototype = new Ctor();
  child.__parent = parent.prototype;

  return child;
}

function createModelAsExtensionOf(base, name) {
  var model = new Function('return function ' + name + '(){ return ' + name + '.__parent.constructor.apply(this, arguments); }')(); // jshint ignore:line

  extend(base, model);

  model.baseModel = base;
  model.singletonMethods = [];

  base.singletonMethods.forEach(function(name) {
    model[name] = base[name];
    model.singletonMethods.push(name);
  });

  return model;
}

function mergePrototypeIntoModel(model, methods) {
  for (var name in methods) {
    defineMethodWithSuper(model.prototype, model.baseModel.prototype, name, methods[name]);
  }
}

function mergeSingletonIntoModel(model, methods) {
  for (var name in methods) {
    defineMethodWithSuper(model, model.baseModel, name, methods[name]);
    model.singletonMethods.push(name);
  }
}

function mergeMixinsIntoModel(model, mixins) {
  for (var i in mixins) {
    mergeSpecIntoModel(model, mixins[i]);
  }
}

function mergeAttributesIntoModel(model, attributes) {
  Attributes.mixInto(model, model.baseModel);

  for (var name in attributes) {
    model.registerAttribute(name, attributes[name]);
  }
}

function mergeCallbacksIntoModel(model, callbacks) {
  Callbacks.mixInto(model, model.baseModel);

  for (var i in callbacks) {
    var callback  = callbacks[i];
    var args      = wrap(callback.do);

    args.unshift(callback.on.type);
    args.unshift(callback.on.name);

    delete callback.do;
    delete callback.on;

    args.push(callback);

    model.registerCallback.apply(model, args);
  }
}

function mergeSpecIntoModel(model, spec) {
  mergeMixinsIntoModel(model, spec.mixins);
  mergePrototypeIntoModel(model, spec.prototype || spec.instanceMethods);
  mergeSingletonIntoModel(model, spec.singleton || spec.singletonMethods);
  mergeAttributesIntoModel(model, spec.attributes);
  mergeCallbacksIntoModel(model, spec.callbacks);
}

var ModelCreator = {
  createModel: function(name, spec) {
    if (!name || !/^[A-Z][A-Za-z0-9]*$/.test(name)) {
      throw new Error('ModelCreator#createModel: invalid `name` argument, must be a non-empty string starting with an uppercase letter');
    }

    if (!spec) {
      throw new Error('ModelCreator#createModel: no specification provided');
    }

    var extended = spec.extends || require('./Model');
    var newModel = createModelAsExtensionOf(extended, name);

    mergeSpecIntoModel(newModel, spec);

    return newModel;
  }
};

module.exports = ModelCreator;
