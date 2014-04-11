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

require('./validators/EachValidator');
require('./validators/FunctionValidator');
require('./validators/PresenceValidator');
require('./validators/AbsenceValidator');
require('./validators/AcceptanceValidator');
require('./validators/ConfirmationValidator');
require('./validators/FormatValidator');
require('./validators/InclusionValidator');
require('./validators/ExclusionValidator');
require('./validators/LengthValidator');
require('./validators/NumericalityValidator');
require('./validators/UniquenessValidator');
require('./validators/WithValidator');
