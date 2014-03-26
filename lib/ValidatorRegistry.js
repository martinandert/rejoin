'use strict';

var validators = process.__rejoinValidatorRegistry = process.__rejoinValidatorRegistry || {};

function register(validator) {
  validators[validator.name] = validator;
}

register(require('./validations/EachValidator'));
register(require('./validations/FunctionValidator'));
register(require('./validations/PresenceValidator'));
register(require('./validations/AbsenceValidator'));
register(require('./validations/AcceptanceValidator'));
register(require('./validations/ConfirmationValidator'));
register(require('./validations/FormatValidator'));
register(require('./validations/InclusionValidator'));
register(require('./validations/ExclusionValidator'));
register(require('./validations/LengthValidator'));
register(require('./validations/NumericalityValidator'));
register(require('./validations/UniquenessValidator'));

module.exports = {
  validators: validators,
  register:   register
};
