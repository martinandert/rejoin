'use strict';

var ModelBase = require('./ModelBase');
var ModelCreator = require('./ModelCreator');

var Core              = require('../mixins/Core');
var Logging           = require('../mixins/Logging');
var Persistence       = require('../mixins/Persistence');
var AttributeMethods  = require('../mixins/AttributeMethods');
var Callbacks         = require('../mixins/Callbacks');

var Model = ModelCreator.createModel('RejoinModel', {
  extends: ModelBase,

  mixins: [
    Core,
    Logging,
    Persistence,
    AttributeMethods,
    Callbacks
  ]
});

module.exports = Model;
