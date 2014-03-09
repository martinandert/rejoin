'use strict';

var Callbacks = require('callbacks');

// private constructor
function ModelBase() {
}

Callbacks.mixInto(ModelBase);

ModelBase.defineCallbackChains('initialize', 'find', 'touch', { only: Callbacks.Type.AFTER });
ModelBase.defineCallbackChains('validation', 'save', 'create', 'destroy');

ModelBase.singletonMethods = ['new'];

ModelBase.new = function() {
  var record = new this();
  record.initialize.apply(record, arguments);
};

ModelBase.prototype.initialize = function(cb) {
  cb(null, this);
};

module.exports = ModelBase;
