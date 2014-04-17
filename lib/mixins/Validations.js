'use strict';

var _               = require('lodash-node');
var Inflector       = require('inflected');
var translate       = require('counterpart');
var sliced          = require('sliced');
var RecordInvalid   = require('../Errors').RecordInvalid;
var Errors          = require('../internal/Errors');
var validators      = require('../ValidatorRegistry').validators;
var wrap            = require('../utils/wrap');
var extractOptions  = require('../utils/extractOptions');

var helpers = {
  _mergeAttributes: function() {
    var args = sliced(arguments);
    var options = extractOptions(args);

    if (_.isFunction(args[args.length - 1])) {
      options.with = args.pop();
    }

    var attributeNames = _.flatten(args);

    options.attributes = attributeNames;

    return options;
  },

  validatesEach: function() {
    return this.validatesWith(validators.FunctionValidator, this._mergeAttributes.apply(this, sliced(arguments)));
  },

  validatesPresenceOf: function() {
    return this.validatesWith(validators.PresenceValidator, this._mergeAttributes.apply(this, sliced(arguments)));
  },

  validatesAbsenceOf: function() {
    return this.validatesWith(validators.AbsenceValidator, this._mergeAttributes.apply(this, sliced(arguments)));
  },

  validatesAcceptanceOf: function() {
    return this.validatesWith(validators.AcceptanceValidator, this._mergeAttributes.apply(this, sliced(arguments)));
  },

  validatesConfirmationOf: function() {
    return this.validatesWith(validators.ConfirmationValidator, this._mergeAttributes.apply(this, sliced(arguments)));
  },

  validatesLengthOf: function() {
    return this.validatesWith(validators.LengthValidator, this._mergeAttributes.apply(this, sliced(arguments)));
  },

  validatesSizeOf: function() {
    return this.validatesLengthOf.apply(this, arguments);
  },

  validatesNumericalityOf: function() {
    return this.validatesWith(validators.NumericalityValidator, this._mergeAttributes.apply(this, sliced(arguments)));
  },

  validatesFormatOf: function() {
    return this.validatesWith(validators.FormatValidator, this._mergeAttributes.apply(this, sliced(arguments)));
  },

  validatesInclusionOf: function() {
    return this.validatesWith(validators.InclusionValidator, this._mergeAttributes.apply(this, sliced(arguments)));
  },

  validatesExclusionOf: function() {
    return this.validatesWith(validators.ExclusionValidator, this._mergeAttributes.apply(this, sliced(arguments)));
  },

  validatesUniquenessOf: function() {
    return this.validatesWith(validators.UniquenessValidator, this._mergeAttributes.apply(this, sliced(arguments)));
  }
};

function ValidationsMixin(model) {
  model.classMethods(_.defaults({}, {
    validates: function() {
      var attributes = sliced(arguments);
      var defaults = extractOptions(attributes);

      var validations = _.omit(defaults, 'if', 'unless', 'on', 'allowBlank', 'allowNull', 'message', 'strict');

      defaults = _.omit(defaults, _.keys(validations));

      if (_.isEmpty(attributes)) {
        throw new Error('you need to supply at least one attribute');
      }

      if (_.isEmpty(validations)) {
        throw new Error('you need to supply at least one validation');
      }

      defaults.attributes = attributes;

      for (var key in validations) {
        var options = validations[key];
        var validator = null;

        if (options === null || options === false) {
          continue;
        }

        key = Inflector.camelize(key) + 'Validator';

        if (_.has(validators, key)) {
          validator = validators[key];
        } else if (_.isFunction(options)) {
          validator = validators.FunctionValidator;
          options.validates = key;
        } else {
          throw new Error('unknown validator: "' + key + '"');
        }

        this.validatesWith(validator, _.defaults(this._parseValidatesOptions(options), defaults));
      }
    },

    validatesStrict: function() {
      var attributes = sliced(arguments);
      var options = extractOptions(attributes);

      options.strict = true;

      this.validates.apply(this, attributes.concat(options));
    },

    _parseValidatesOptions: function(options) {
      if (options === true) {
        return {};
      } else if (_.isPlainObject(options)) {
        return options;
      } else if (_.isArray(options)) {
        return { in: options };
      } else {
        return { with: options };
      }
    },

    validatesWith: function() {
      var validators = sliced(arguments);
      var options = extractOptions(validators);

      options.model = this;

      _.forEach(validators, function(Validator) {
        var validator = Validator.new(options);

        if (_.has(validator, 'attributes') && !_.isEmpty(validator.attributes)) {
          _.forEach(validator.attributes, function(attribute) {
            this.getValidators()[attribute] = this.getValidators()[attribute] || [];
            this.getValidators()[attribute].push(validator);
          }, this);
        } else {
          var baseKey = '__base';

          this.getValidators()[baseKey] = this.getValidators()[baseKey] || [];
          this.getValidators()[baseKey].push(validator);
        }

        this.validate(validator, options);
      }, this);
    },

    validate: function(validator, options) {
      options = options || {};

      if (_.has(options, 'on')) {
        options = _.clone(options);
        options.if = wrap(options.if);

        options.if.unshift(function(record) {
          return _.contains(wrap(options.on), record.getValidationContext());
        });
      }

      this.setCallback.apply(this, ['validate', validator, options]);
    },

    clearValidations: function() {
      this.resetCallbacks('validate');
      this.setValidators({});
    },

    getAllValidators: function() {
      return _.uniq(_.flatten(_.values(this.getValidators())));
    },
  }, helpers));

  model.instanceMethods(_.defaults({}, {
    readAttributeForValidation: function(name) {
      var definition = this.constructor.attributeDefinitions[name];

      return this[definition.getterMethodName](name);
    },

    getErrors: function() {
      if (_.isUndefined(this._errors)) {
        this._errors = new Errors(this);
      }

      return this._errors;
    },

    getValidationContext: function() {
      return this._validationContext;
    },

    setValidationContext: function(value) {
      this._validationContext = value;
    },

    save: function(options, cb) {
      if (_.isFunction(options)) {
        cb = options;
        options = null;
      }

      options = options || {};

      var self = this;

      if (options.validate === false) {
        this._super(cb);
      } else {
        this.validate(options.context, function(err, valid) {
          if (err) { cb(err); return; }

          if (valid) {
            self._super(cb);
          } else {
            var errors  = self.getErrors().getFullMessages().join(', ');
            var scope   = self.constructor.getI18nScope();
            var message = translate('errors.messages.record_invalid', { scope: scope, errors: errors });

            cb(new RecordInvalid(message, this));
          }
        });
      }
    },

    validate: function(context, cb) {
      if (_.isFunction(context)) {
        cb = context;
        context = null;
      }

      context = context || (this.isNew() ? 'create' : 'update');

      var self = this;
      var currentContext = this.getValidationContext();

      this.setValidationContext(context);
      this.getErrors().clear();

      this._runValidations(function(err, valid) {
        self.setValidationContext(currentContext);
        cb(err, valid);
      });
    },

    _runValidations: function(cb) {
      var self = this;

      this.runCallbacks('validate', function(err, _) {
        cb(err, self.getErrors().isEmpty());
      });
    },

    validatesWith: function(Validator, options) {
      options = options || {};
      options.model = this.constructor;

      var validator = Validator.new(options);
      var self = this;

      return function(done) {
        validator.validate(self, done);
      };
    }
  }, helpers));
}

ValidationsMixin.mixedIn = function(model) {
  model.classAccessor('validators', {});
  model.defineCallbacks('validate', { scope: 'name' });
};

ValidationsMixin.inherited = function(model) {
  model.setValidators(_.clone(model.getValidators()));
};

module.exports = ValidationsMixin;
