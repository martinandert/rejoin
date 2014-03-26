'use strict';

var ModelCreator      = require('./ModelCreator');
var ModelRegistry     = require('./ModelRegistry');
var ValidatorCreator  = require('./ValidatorCreator');
var ValidatorRegistry = require('./ValidatorRegistry');
var Callback          = require('./Callback');
var Errors            = require('./Errors');
var DataType          = require('./DataType');
var Initializer       = require('./Initializer');

var Rejoin = {
  DataType:         DataType,
  Callback:         Callback.Kind,
  Errors:           Errors,
  createModel:      ModelCreator.createModel,
  models:           ModelRegistry.models,
  createValidator:  ValidatorCreator.createValidator,
  validators:       ValidatorRegistry.validators,
  init:             Initializer.init
};

require('counterpart').registerTranslations('en', '../locales/en');

module.exports = Rejoin;
