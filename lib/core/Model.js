'use strict';

var ModelBase = require('./ModelBase');
var ModelCreator = require('./ModelCreator');

var Core                = require('../mixins/Core');
var Logging             = require('../mixins/Logging');
var Persistence         = require('../mixins/Persistence');
var Schema              = require('../mixins/Schema');
var AttributeAssignment = require('../mixins/AttributeAssignment');
var AttributeMethods    = require('../mixins/AttributeMethods');
var Callbacks           = require('../mixins/Callbacks');

var Model = ModelCreator.createModel('Model', {
  extends: ModelBase,
  abstract: true,

  mixins: [
    Core,
    Logging,
    Persistence,
    Schema,
    AttributeAssignment,
    AttributeMethods,
    Callbacks
  ]
});

module.exports = Model;
