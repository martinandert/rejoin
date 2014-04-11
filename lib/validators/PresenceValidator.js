'use strict';

var EachValidator   = require('./EachValidator');
var createValidator = require('../ValidatorCreator').createValidator;
var isBlank         = require('../utils/isBlank');

var PresenceValidator = createValidator('PresenceValidator', EachValidator, {
  validateEach: function(record, attribute, value, done) {
    if (isBlank(value)) {
      record.getErrors().add(attribute, ':blank', this.options);
    }

    done();
  }
});

module.exports = PresenceValidator;
