'use strict';

var _               = require('lodash-node');
var EachValidator   = require('./EachValidator');
var createValidator = require('../ValidatorCreator').createValidator;

var FormatValidator = createValidator('FormatValidator', EachValidator, {
  checkValidity: function() {
    if (_.has(this.options, 'with') === _.has(this.options, 'without')) {
      throw new Error('Either with or without must be supplied (but not both)');
    }

    _.forEach(['with', 'without'], function(name) {
      if (_.has(this.options, name) && !(_.isRegExp(this.options[name]) || _.isFunction(this.options[name]))) {
        throw new Error('A regular expression or a function must be supplied as ' + name);
      }
    }, this);
  },

  validateEach: function(record, attribute, value, done) {
    var regexp;

    if (this.options.with) {
      regexp = this._optionCall(record, 'with');

      if (!regexp.test(value)) {
        this._recordError(record, attribute, 'with', value);
      }
    } else if (this.options.without) {
      regexp = this._optionCall(record, 'without');

      if (regexp.test(value)) {
        this._recordError(record, attribute, 'without', value);
      }
    }

    done();
  },

  _optionCall: function(record, name) {
    var option = this.options[name];

    return _.isFunction(option) ? option(record) : option;
  },

  _recordError: function(record, attribute, name, value) {
    record.getErrors().add(attribute, ':invalid', _.defaults({ value: value }, _.omit(this.options, name)));
  }
});

module.exports = FormatValidator;
