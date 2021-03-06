'use strict';

var _               = require('lodash-node');
var EachValidator   = require('./EachValidator');
var createValidator = require('../ValidatorCreator').createValidator;

var CHECKS = {
  greaterThan: function(a, b) { return a > b; },
  greaterThanOrEqualTo: function(a, b) { return a >= b; },
  equalTo: function(a, b) { return a === b; },
  lessThan: function(a, b) { return a < b; },
  lessThanOrEqualTo: function(a, b) { return a <= b; },
  odd: function(a) { return Math.abs(a) % 2 === 1; },
  even: function(a) { return a % 2 === 0; },
  otherThan: function(a, b) { return a !== b; }
};

var MESSAGES = {
  greaterThan: ':greater_than',
  greaterThanOrEqualTo: ':greater_than_or_equal_to',
  equalTo: ':equal_to',
  lessThan: ':less_than',
  lessThanOrEqualTo: ':less_than_or_equal_to',
  otherThan: ':other_than'
};

var RESERVED_OPTIONS = _.keys(CHECKS).concat('onlyInteger');

var NumericalityValidator = createValidator('NumericalityValidator', EachValidator, {
  checkValidity: function() {
    var keys = _.without(_.keys(CHECKS), 'odd', 'even');
    var options = _.pick(this.options, keys);

    for (var key in options) {
      var value = options[key];

      if (_.isNumber(value) || _.isFunction(value)) {
        continue;
      }

      throw new Error(key + ' must be a number or a function');
    }
  },

  validateEach: function(record, attribute, value, done) {
    if (this.options.allowNull && value === null) {
      done();
      return;
    }

    var rawValue = value;

    value = this._parseAsNumber(rawValue);

    if (value === null) {
      record.getErrors().add(attribute, ':not_a_number', this._getFilteredOptions(rawValue));
      done();
      return;
    }

    if (this.options.onlyInteger) {
      value = this._parseAsInteger(rawValue);

      if (value === null) {
        record.getErrors().add(attribute, ':not_an_integer', this._getFilteredOptions(rawValue));
        done();
        return;
      }
    }

    var options = _.pick(this.options, _.keys(CHECKS));

    for (var key in options) {
      if (key === 'odd' || key === 'even') {
        if (!CHECKS[key](parseInt(value))) {
          record.getErrors().add(attribute, ':' + key, this._getFilteredOptions(value));
        }
      } else {
        var optionValue = options[key];

        if (_.isFunction(optionValue)) {
          optionValue = optionValue(record);
        }

        if (!CHECKS[key](value, optionValue)) {
          record.getErrors().add(attribute, MESSAGES[key], _.defaults({ count: optionValue }, this._getFilteredOptions(value)));
        }
      }
    }

    done();
  },

  _parseAsNumber: function(rawValue) {
    if (rawValue === null || /^\s*$/.test(String(rawValue)) || /^0[xX]/.test(String(rawValue))) {
      return null;
    }

    var value = Number(rawValue);

    return _.isNumber(value) && !_.isNaN(value) ? value : null;
  },

  _parseAsInteger: function(rawValue) {
    return /^[+-]?\d+$/.test(String(rawValue)) ? parseInt(rawValue) : null;
  },

  _getFilteredOptions: function(value) {
    return _.defaults({ value: value }, _.omit(this.options, RESERVED_OPTIONS));
  }
});

module.exports = NumericalityValidator;
