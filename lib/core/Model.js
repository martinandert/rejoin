'use strict';

var ModelBase = require('./ModelBase');
var ModelCreator = require('./ModelCreator');

var Core = require('../mixins/Core');
var Persistence = require('../mixins/Persistence');

var Model = ModelCreator.createModel({
  extends: ModelBase,

  mixins: [
    Core,
    Persistence
  ]
});

module.exports = Model;
