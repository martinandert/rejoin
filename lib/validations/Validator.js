'use strict';

var _ = require('lodash-node');

// private constructor
function Validator() {
}

Validator.new = function(options) {
  options = options || {};
  var validator = new this();

  validator.initialize.call(validator, options);
};

Validator.prototype.initialize = function(options) {
  this.options = _.omit(options, 'model');
};

Validator.prototype.validate = function(record, done) {
  throw new Error('Subclasses must implement a validate(record) method.');
};

module.exports = Validator;
