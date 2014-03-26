'use strict';

var EachValidator   = require('./EachValidator');
var createValidator = require('../ValidatorCreator').createValidator;

var UniquenessValidator = createValidator('UniquenessValidator', EachValidator, {
  validateEach: function(record, attribute, value, done) {
    // TODO: provide implementation
    done();
  }
});

module.exports = UniquenessValidator;
