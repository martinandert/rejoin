'use strict';

var EachValidator   = require('./EachValidator');
var createValidator = require('../ValidatorCreator').createValidator;
var isPresent       = require('../utils/isPresent');

var AbsenceValidator = createValidator('AbsenceValidator', EachValidator, {
  validateEach: function(record, attribute, value, done) {
    if (isPresent(value)) {
      record.getErrors().add(attribute, ':present', this.options);
    }

    done();
  }
});

module.exports = AbsenceValidator;
