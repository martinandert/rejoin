'use strict';

var _               = require('lodash-node');
var EachValidator   = require('./EachValidator');
var createValidator = require('../ValidatorCreator').createValidator;

var ExclusionValidator = createValidator('ExclusionValidator', EachValidator, {
  validateEach: function(record, attribute, value, done) {
    var array = this.options.in || this.options.within;

    if (_.contains(array, value)) {
      record.getErrors().add(attribute, ':exclusion', _.defaults({ value: value }, _.omit(this.options, 'in', 'within')));
    }

    done();
  }
});

module.exports = ExclusionValidator;
