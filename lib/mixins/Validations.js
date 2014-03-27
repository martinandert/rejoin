'use strict';

var _             = require('lodash-node');
var Inflector     = require('inflected');
var translate     = require('counterpart');
var RecordInvalid = require('../Errors').RecordInvalid;
var Errors        = require('../validations/Errors');
var validators    = require('../ValidatorRegistry').validators;
var wrap          = require('../utils/wrap');

var VALIDATE = 'validate';

module.exports = {
  name: 'Validations',

  singleton: {
    validates: function(attributes, defaults) {
      var validations = _.omit(defaults, 'if', 'unless', 'on', 'allowBlank', 'allowNull');

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

        if (options === null) {
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

    validatesWith: function(Validator, options) {
      options = options || {};
      options.model = this;

      var validator = Validator.new(options);

      if (_.has(validator, 'attributes') && !_.isEmpty(validator.attributes)) {
        _.forEach(validator.attributes, function(attribute) {
          this.validations[attribute] = this.validations[attribute] || [];
          this.validations[attribute].push(validator);
        }, this);
      } else {
        var baseKey = '__base';

        this.validations[baseKey] = this.validations[baseKey] || [];
        this.validations[baseKey].push(validator);
      }

      this.validate(validator, options);
    },

    validate: function(validator, options) {
      options = options || {};

      if (_.has(options, 'on')) {
        options = _.clone(options);
        options.if = wrap(options.if);

        options.if.unshift(function(record) {
          return record.getValidationContext() === options.on;
        });
      }

      this.registerCallback.apply(this, [VALIDATE, validator, options]);
    }
  },

  prototype: {
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
        this.isValid(options.context, function(err, result) {
          if (err) { cb(err); return; }

          if (valid) {
            self._super(cb);
          } else {
            var errors  = self.getErrors().getFullMessages().join(', ');
            var scope   = self.constructor.getI18nScope();
            var message = translate('errors.messages.record_invalid', { scope: scope, errors: errors });

            cb(new RecordInvalid(message, this));
          }
        })
      }
    },

    isValid: function(context, cb) {
      if (_.isFunction(context)) {
        cb = context;
        context = null;
      }

      context = context || (this.isNew() ? 'create' : 'update');

      var self = this;
      var currentContext = this.getValidationContext();

      this.setValidationContext(context);
      this.getErrors().clear();

      this._runValidations(function(err, result) {
        self.setValidationContext(currentContext);
        cb(err, result);
      });
    },

    _runValidations: function(cb) {
      var self = this;
      var sync = true;

      this.runCallbacks(VALIDATE, function(err, _) {
        if (sync) {
          process.nextTick(function() {
            cb(err, self.getErrors().isEmpty());
          });
        } else {
          cb(err, self.getErrors().isEmpty());
        }
      });

      sync = false;
    }
  }
};