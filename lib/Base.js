'use strict';

var Model       = require('./Model');
var createModel = require('./ModelCreator').createModel;

var Core                = require('./mixins/Core');
var Naming              = require('./mixins/Naming');
var CallbackSystem      = require('./mixins/CallbackSystem');
var AttributeSystem     = require('./mixins/AttributeSystem');
var Querying            = require('./mixins/Querying');
var Logging             = require('./mixins/Logging');
var Persistence         = require('./mixins/Persistence');
var Schema              = require('./mixins/Schema');
var Inheritance         = require('./mixins/Inheritance');
var Scoping             = require('./mixins/Scoping');
var AttributeAssignment = require('./mixins/AttributeAssignment');
var Validations         = require('./mixins/Validations');
var AttributeMethods    = require('./mixins/AttributeMethods');
var Conversion          = require('./mixins/Conversion');
var Callbacks           = require('./mixins/Callbacks');
var DirtyTracking       = require('./mixins/DirtyTracking');
var Timestamps          = require('./mixins/Timestamps');

var Base = createModel('Base', Model, function(model) {
  model.mixin(
    Core,
    Naming,
    CallbackSystem,
    AttributeSystem,
    Querying,
    Logging,
    Persistence,
    Schema,
    Inheritance,
    Scoping,
    AttributeAssignment,
    Validations,
    AttributeMethods,
    Conversion,
    DirtyTracking,
    Callbacks,
    Timestamps
  );
});

module.exports = Base;
