'use strict';

var sliced          = require('sliced');
var CallbackSystem  = require('callbacks');
var ModelCreator    = require('./ModelCreator');

var Core                = require('./mixins/Core');
var Querying            = require('./mixins/Querying');
var Logging             = require('./mixins/Logging');
var Persistence         = require('./mixins/Persistence');
var Schema              = require('./mixins/Schema');
var Inheritance         = require('./mixins/Inheritance');
var Scoping             = require('./mixins/Scoping');
var AttributeAssignment = require('./mixins/AttributeAssignment');
var AttributeMethods    = require('./mixins/AttributeMethods');
var Conversion          = require('./mixins/Conversion');
var Callbacks           = require('./mixins/Callbacks');
var DirtyTracking       = require('./mixins/DirtyTracking');
var Timestamps          = require('./mixins/Timestamps');

// private constructor
function Model() {
}

CallbackSystem.mixInto(Model);

Model.defineCallbackChains('initialize', 'find', 'touch', { only: CallbackSystem.Type.AFTER });
Model.defineCallbackChains('validation', 'save', 'create', 'destroy');

Model.singletonMethods = ['new', 'isModelBase'];
Model.descendants   = [];
Model.defaultScopes = [];
Model.scopes        = {};

Model.new = function() {
  var args    = sliced(arguments);
  var cb      = args.pop();
  var sync    = true;
  var record  = new this();

  record.initialize.apply(record, args.concat(cbWrap));

  sync = false;

  function cbWrap(err, result) {
    if (sync) {
      process.nextTick(function() {
        cb(err, result);
      });
    } else {
      cb(err, result);
    }
  }
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
    Scoping,
    AttributeAssignment,
    AttributeMethods,
    Conversion,
    DirtyTracking,
    Callbacks,
    Timestamps
  ]
});

Base.setInheritanceColumn('type');

module.exports = Base;
