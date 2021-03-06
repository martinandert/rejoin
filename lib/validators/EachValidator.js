'use strict';

var _               = require('lodash-node');
var Validator       = require('./Validator');
var createValidator = require('../ValidatorCreator').createValidator;
var wrap            = require('../utils/wrap');
var isBlank         = require('../utils/isBlank');

var EachValidator = createValidator('EachValidator', Validator, {
  initialize: function(options) {
    this.attributes = wrap(options.attributes).slice();

    if (_.isEmpty(this.attributes)) {
      throw new Error('attributes cannot be empty');
    }

    delete options.attributes;

    this._super(options);
    this.checkValidity();
  },

  checkValidity: function() {
  },

  validate: function(record, done) {
    var lock  = this.attributes.length;
    var error = false;

    for (var i = 0, ii = lock; i < ii; i++) {
      if (error) {
        break;
      }

      var attribute = this.attributes[i];
      var value = record.readAttributeForValidation(attribute);

      if (value === null && this.options.allowNull || isBlank(value) && this.options.allowBlank) {
        cb();
      } else {
        try {
          this.validateEach(record, attribute, value, cb);
        } catch (err) {
          cb(err);
        }
      }
    }

    function cb(err, result) {
      if (err && !error) {
        error = true;
        done(err);
      } else {
        lock--;

        if (lock === 0) {
          done();
        }
      }
    }
  },

  validateEach: function(record, attribute, value, done) {
    throw new Error('Subclasses must implement a validateEach(record, attribute, value) method');
  }
});

module.exports = EachValidator;
