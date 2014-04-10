'use strict';

var ModelCreator      = require('./ModelCreator');
var ModelRegistry     = require('./ModelRegistry');
var ValidatorCreator  = require('./ValidatorCreator');
var ValidatorRegistry = require('./ValidatorRegistry');
var Callbacks         = require('./Callbacks');
var Errors            = require('./Errors');
var DataType          = require('./DataType');
var Initializer       = require('./Initializer');

var Rejoin = {
  DataType:         DataType,
  CallbackType:     Callbacks.Type,
  Errors:           Errors,
  createModel:      ModelCreator.createModel,
  models:           ModelRegistry.models,
  createValidator:  ValidatorCreator.createValidator,
  validators:       ValidatorRegistry.validators,
  init:             Initializer.init
};

require('counterpart').registerTranslations('en', require('../locales/en'));

module.exports = Rejoin;
