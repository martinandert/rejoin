'use strict';

var _         = require('lodash-node');
var sliced    = require('sliced');
var Inflector = require('inflected');
var override  = require('./utils/override');

// private constructor
function Model() {
}

Model.new = function() {
  var args      = sliced(arguments);
  var callback  = args.pop();
  var sync      = true;
  var record    = new this();

  record.initialize.apply(record, args.concat(cbWrap));

  sync = false;

  function cbWrap(err, result) {
    if (sync) {
      process.nextTick(function() {
        callback(err, result);
      });
    } else {
      callback(err, result);
    }
  }
};

Model.prototype.initialize = function(callback) {
  callback(null, this);
};

Model.inspect = function() {
  return this.name;
};

Model.isModelBase = function() {
  return this.name === 'Base';
};

Model.classMethods = function(methods) {
  for (var name in methods) {
    this.classMethod(name, methods[name]);
  }
};

Model.classMethod = function(name, fn) {
  override(this, this.parentModel, name, fn);
  this.singletonMethods.push(name);
};

Model.instanceMethods = function(methods) {
  for (var name in methods) {
    this.instanceMethod(name, methods[name]);
  }
};

Model.instanceMethod = function(name, fn) {
  override(this.prototype, this.parentModel.prototype, name, fn);
};

Model.mixin = function() {
  var mixins = _.flatten(sliced(arguments));

  for (var i in mixins) {
    var mixin = mixins[i];

    mixin(this);

    if (_.isFunction(mixin.mixedIn)) {
      mixin.mixedIn(this);
    }

    if (_.isFunction(mixin.inherited)) {
      this.inheritFunctions.push(mixin.inherited);
    }
  }
};

Model.classAccessor = function(name, initialValue) {
  var camelizedName = Inflector.camelize(name);
  var getter = 'get' + camelizedName;
  var setter = 'set' + camelizedName;

  this[getter] = function() {
    if (typeof this['_' + name] !== 'undefined') {
      return this['_' + name];
    }

    if (this.parentModel && _.has(this.parentModel, getter)) {
      return this.parentModel[getter]();
    }

    return initialValue;
  };

  this[setter] = function(value) {
    this['_' + name] = value;
    return value;
  };

  this.singletonMethods.push(getter);
  this.singletonMethods.push(setter);
};

Model.singletonMethods = ['new', 'isModelBase'];
Model.inheritFunctions = [];
Model.descendants = [];

module.exports = Model;
