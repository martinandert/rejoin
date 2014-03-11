'use strict';

var CallbackSystem  = require('callbacks');
var ModelCreator    = require('./ModelCreator');

var Core                = require('../mixins/Core');
var Querying            = require('../mixins/Querying');
var Logging             = require('../mixins/Logging');
var Persistence         = require('../mixins/Persistence');
var Schema              = require('../mixins/Schema');
var Inheritance         = require('../mixins/Inheritance');
var AttributeAssignment = require('../mixins/AttributeAssignment');
var AttributeMethods    = require('../mixins/AttributeMethods');
var Callbacks           = require('../mixins/Callbacks');
var Timestamps          = require('../mixins/Timestamps');

// private constructor
function Model() {
}

CallbackSystem.mixInto(Model);

Model.defineCallbackChains('initialize', 'find', 'touch', { only: CallbackSystem.Type.AFTER });
Model.defineCallbackChains('validation', 'save', 'create', 'destroy');

Model.singletonMethods = ['new', 'isModelBase'];
Model.descendants = [];

Model.new = function() {
  var record = new this();
  record.initialize.apply(record, arguments);
};

Model.prototype.initialize = function(cb) {
  cb(null, this);
};

Model.inspect = function() {
  return this.name;
};

Model.isModelBase = function() {
  return this.name === 'Base';
};

var Base = ModelCreator.createModel('Base', {
  extends: Model,

  mixins: [,
    Core,
    Querying,
    Logging,
    Persistence,
    Schema,
    Inheritance,
    AttributeAssignment,
    AttributeMethods,
    Callbacks,
    Timestamps
  ]
});

Base.setInheritanceColumn('type');

module.exports = Base;
