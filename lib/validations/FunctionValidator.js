'use strict';

var EachValidator   = require('./EachValidator');
var createValidator = require('../ValidatorCreator').createValidator;

var FunctionValidator = createValidator('FunctionValidator', EachValidator, {
  initialize: function(options) {
    this.fn = options.with;
    this._super(options);
  },

  validateEach: function(record, attribute, value, done) {
    this.fn(record, attribute, value, done);
  }
});

module.exports = FunctionValidator;
