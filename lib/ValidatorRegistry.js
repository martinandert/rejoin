'use strict';

var validators = process.__rejoinValidatorRegistry = process.__rejoinValidatorRegistry || {};

function register(validator) {
  validators[validator.name] = validator;
}

register(require('./validators/Validator'));

module.exports = {
  validators: validators,
  register:   register
};
