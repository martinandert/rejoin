'use strict';

var Callbacks   = require('callbacks');
var Attributes  = require('./Attributes');
var Registry    = require('./ModelRegistry');
var DataType    = require('./DataType');

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

function createModelAsExtensionOf(parentModel, name) {
  var model = new Function('return function ' + name + '(){ return ' + name + '.__parent.constructor.apply(this, arguments); }')(); // jshint ignore:line

  extend(parentModel, model);

  model.parentModel = parentModel;
  model.singletonMethods = [];
  model.descendants = [];

  parentModel.singletonMethods.forEach(function(name) {
    model[name] = parentModel[name];
    model.singletonMethods.push(name);
  });

  var current = parentModel;

  while (typeof current !== 'undefined' && typeof current.descendants !== 'undefined') {
    current.descendants.push(model);
    current = current.parentModel;
  }

  return model;
}

function mergeMixinsIntoModel(model, mixins) {
  for (var i in mixins) {
    mergeSpecIntoModel(model, mixins[i]);
  }
}

function mergeSingletonIntoModel(model, methods) {
  for (var name in methods) {
    defineMethodWithSuper(model, model.parentModel, name, methods[name]);
    model.singletonMethods.push(name);
  }
}

function mergePrototypeIntoModel(model, methods) {
  for (var name in methods) {
    defineMethodWithSuper(model.prototype, model.parentModel.prototype, name, methods[name]);
  }
}

function mergeAttributesIntoModel(model, attributes) {
  Attributes.mixInto(model, model.parentModel);

  if (attributes) {
    var primaryKey = model.getPrimaryKey();

    if (primaryKey && model.attributeNames.indexOf(primaryKey) === -1) {
      model.registerAttribute(primaryKey, DataType.PRIMARY_KEY, true);
    }
  }

  for (var name in attributes) {
    model.registerAttribute(name, attributes[name]);
  }
}

function mergeCallbacksIntoModel(model, callbacks) {
  Callbacks.mixInto(model, model.parentModel);

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
  mergeSingletonIntoModel(model, spec.singleton || spec.singletonMethods);
  mergePrototypeIntoModel(model, spec.prototype || spec.instanceMethods);
  mergeAttributesIntoModel(model, spec.attributes);
  mergeCallbacksIntoModel(model, spec.callbacks);
}

function mergeConfigIntoModel(model, spec) {
  var config = spec.config || {};

  if (typeof config.table !== 'undefined') {
    model.setTableName(config.table);
  }

  if (typeof config.primaryKey !== 'undefined') {
    model.setPrimaryKey(config.primaryKey);
  }

  if (typeof config.abstract !== 'undefined') {
    model.setAbstractModel(config.abstract);
  }

  if (typeof config.inheritanceColumn !== 'undefined') {
    model.setInheritanceColumn(config.inheritanceColumn);
  }
}

var ModelCreator = {
  createModel: function(name, spec) {
    if (!name || !/^[A-Z][A-Za-z0-9]*$/.test(name)) {
      throw new Error('ModelCreator#createModel: invalid `name` argument, must be a non-empty string starting with an uppercase letter');
    }

    if (!spec) {
      throw new Error('ModelCreator#createModel: no specification provided');
    }

    var extended = spec.extends || ModelCreator.getModelBase();
    var newModel = createModelAsExtensionOf(extended, name);

    Registry.register(newModel);

    mergeConfigIntoModel(newModel, spec);
    mergeSpecIntoModel(newModel, spec);

    return newModel;
  },

  getModelBase: function() {
    if (typeof ModelCreator._modelBase === 'undefined') {
      ModelCreator._modelBase = require('./Base');
    }

    return ModelCreator._modelBase;
  }
};

module.exports = ModelCreator;
