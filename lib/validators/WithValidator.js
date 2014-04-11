'use strict';

var EachValidator   = require('./EachValidator');
var createValidator = require('../ValidatorCreator').createValidator;

var WithValidator = createValidator('WithValidator', EachValidator, {
  validateEach: function(record, attribute, value, done) {
    record[this.options.with](attribute);
    done();
  }
});

module.exports = WithValidator;
