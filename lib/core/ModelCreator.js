'use strict';

var hasProp = require('../utils/hasProp');

function extend(parent, child) {
  for (var key in parent) {
    if (hasProp(parent, key)) {
      child[key] = parent[key];
    }
  }

  function ctor() { 
    this.constructor = child;
  }

  ctor.prototype = parent.prototype;
  child.prototype = new ctor();
  child.__base = parent.prototype;

  return child;
}

function createModelAsExtensionOf(base) {
  extend(base, model);

  function model() {
    return model.__base.constructor.apply(this, arguments);
  }

  model.base = base;

  return model;
}

function mergeInstanceMethodsIntoModel(model, methods) {
  var prototype = model.prototype;
  var _super = model.base.prototype;

  for (var name in methods) {
    prototype[name] = (function() {
      if (typeof methods[name] == 'function' && typeof _super[name] == 'function' && /\b_super\b/.test(methods[name])) {
        return (function(name, fn){
          return function() {
            var tmp = this._super;           
            this._super = _super[name];           
            var result = fn.apply(this, arguments);        
            this._super = tmp;
           
            return result;
          };
        })(name, methods[name])
      } else {
        return methods[name]
      }
    })();
  }
}

function mergeMixinsIntoModel(model, mixins) {
  for (var i in mixins) {
    mergeSpecIntoModel(model, mixins[i]);
  }
}

function mergeSpecIntoModel(model, spec) {
  mergeMixinsIntoModel(model, spec.mixins);
  mergeInstanceMethodsIntoModel(model, spec.methods || spec.instanceMethods);
}

var ModelCreator = {
  createModel: function(spec) {
    var extended = spec.extends || require('./Model');
    var newModel = createModelAsExtensionOf(extended);

    newModel.modelName = spec.name;

    mergeSpecIntoModel(newModel, spec);

    return newModel;
  }
};

module.exports = ModelCreator;
