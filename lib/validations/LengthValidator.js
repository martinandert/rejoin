'use strict';

var _               = require('lodash-node');
var EachValidator   = require('./EachValidator');
var createValidator = require('../ValidatorCreator').createValidator;

var MESSAGES = {
  is:       'wrong_length',
  minimum:  'too_short',
  maximum:  'too_long'
};

var CHECKS = {
  is:       function(a, b) { return a === b; },
  minimum:  function(a, b) { return a >= b; },
  maximum:  function(a, b) { return a <= b; }
};

var RESERVED_OPTIONS = ['minimum', 'maximum', 'is', 'tokenizer', 'too_short', 'too_long', 'wrong_length'];

var LengthValidator = createValidator('LengthValidator', EachValidator, {
  initialize: function(options) {
    if (options.allowBlank === false && !_.isNumber(options.minimum) && !_.isNumber(options.is)) {
      options.minimum = 1;
    }

    this._super(options);
  },

  checkValidity: function() {
    var keys = _.intersection(_.keys(CHECKS), _.keys(this.options));

    if (_.isEmpty(keys)) {
      throw new Error('specify the maximum, minimum, or is option');
    }

    _.forEach(keys, function(key) {
      var value = this.options[key];

      if (!_.isNumber(value) || value < 0 || _.isNaN(value)) {
        throw new Error(key + ' must be a nonnegative Integer');
      }
    }, this);
  },

  validateEach: function(record, attribute, value, done) {
    value = this.tokenize(value);

    var valueLength = _.has(value, 'length') ? value.length : String(value).length;
    var errorsOptions = _.omit(this.options, RESERVED_OPTIONS);

    for (var key in CHECKS) {
      var checkValue = this.options[key];

      if (typeof checkValue === 'undefined' || checkValue === null) {
        continue;
      }

      if (value !== null || this._skipNullCheck(key)) {
        if (CHECKS[key](valueLength, checkValue)) {
          continue;
        }
      }

      errorsOptions.count = checkValue;

      var defaultMessage = this.options[MESSAGES[key]];

      if (defaultMessage) {
        errorsOptions.message = errorsOptions.message || defaultMessage;
      }

      record.getErrors().add(attribute, ':' + MESSAGES[key], errorsOptions);
    }

    done();
  },

  _tokenize: function(value) {
    if (_.isFunction(this.options.tokenizer)) {
      return this.options.tokenizer(value);
    } else {
      value;
    }
  },

  _skipNullCheck: function(key) {
    return key === 'maximum' && !_.isBoolean(this.options.allowNull) && !_.isBoolean(this.options.allowBlank);
  }
});

module.exports = LengthValidator;
