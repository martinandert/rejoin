'use strict';

var Registry = require('./ValidatorRegistry');
var subclass = require('./utils/subclass');

function createValidator(name, parent, proto) {
  var validator = subclass(parent, name, proto);

  Registry.register(validator);

  return validator;
}

module.exports = {
  createValidator: createValidator
};

require('./validations/EachValidator');
require('./validations/FunctionValidator');
require('./validations/PresenceValidator');
require('./validations/AbsenceValidator');
require('./validations/AcceptanceValidator');
require('./validations/ConfirmationValidator');
require('./validations/FormatValidator');
require('./validations/InclusionValidator');
require('./validations/ExclusionValidator');
require('./validations/LengthValidator');
require('./validations/NumericalityValidator');
require('./validations/UniquenessValidator');
require('./validations/WithValidator');
