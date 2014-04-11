'use strict';

var _               = require('lodash-node');
var Clusivity       = require('../internal/Clusivity');
var EachValidator   = require('./EachValidator');
var createValidator = require('../ValidatorCreator').createValidator;

var proto = {
  validateEach: function(record, attribute, value, done) {
    if (this._includes(record, value)) {
      record.getErrors().add(attribute, ':exclusion', _.defaults({ value: value }, _.omit(this.options, 'in', 'within')));
    }

    done();
  }
};

var ExclusionValidator = createValidator('ExclusionValidator', EachValidator, _.defaults(proto, Clusivity));

module.exports = ExclusionValidator;
