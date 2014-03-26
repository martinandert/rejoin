'use strict';

var _               = require('lodash-node');
var EachValidator   = require('./EachValidator');
var createValidator = require('../ValidatorCreator').createValidator;

var FormatValidator = createValidator('FormatValidator', EachValidator, {
  validateEach: function(record, attribute, value, done) {
    var regexp = this.options.with;

    if (!regexp.test(value)) {
      record.getErrors().add(attribute, ':invalid', _.defaults({ value: value }, _.omit(this.options, 'with')));
    }

    done();
  }
});

module.exports = FormatValidator;
