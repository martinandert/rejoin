'use strict';

var validators = process.__rejoinValidatorRegistry = process.__rejoinValidatorRegistry || {};

function register(validator) {
  validators[validator.name] = validator;
}

register(require('./validations/Validator'));

module.exports = {
  validators: validators,
  register:   register
};
