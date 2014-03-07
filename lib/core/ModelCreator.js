'use strict';

var Callbacks = require('callbacks');
var Attributes = require('./Attributes');
var defineMethodWithSuper = require('./defineMethodWithSuper');

var wrap = require('../utils/wrap');

var inheritedSingletonMethods = ['new'];

function extend(parent, child) {
  inheritedSingletonMethods.forEach(function(method) {
    child[method] = parent[method];
  });

  function Ctor() {
    this.constructor = child;
  }

  Ctor.prototype = parent.prototype;
  child.prototype = new Ctor();
  child.__parent = parent.prototype;

  return child;
}

function createModelAsExtensionOf(base) {
  extend(base, Model);

  function Model() {
    return Model.__parent.constructor.apply(this, arguments);
  }

  return Model;
}

function mergeInstanceMethodsIntoModel(model, methods) {
  for (var name in methods) {
    defineMethodWithSuper(model, name, methods[name]);
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
  mergeInstanceMethodsIntoModel(model, spec.methods || spec.instanceMethods);
  mergeAttributesIntoModel(model, spec.attributes);
  mergeCallbacksIntoModel(model, spec.callbacks);
}

var ModelCreator = {
  createModel: function(name, spec) {
    if (!name || !/^[A-Z][A-Za-z0-9]*$/.test(name)) {
      throw new Error('Rejoin#createModel: invalid `name` argument, must be a non-empty string starting with an uppercase letter');
    }

    if (!spec) {
      throw new Error('Rejoin#createModel: no spec argument provided');
    }

    var extended = spec.extends || require('./Model');
    var newModel = createModelAsExtensionOf(extended);

    newModel.modelName = name;
    newModel.baseModel = extended;

    mergeSpecIntoModel(newModel, spec);

    return newModel;
  }
};

module.exports = ModelCreator;
