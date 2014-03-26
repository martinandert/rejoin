'use strict';

var _           = require('lodash-node');
var Inflector   = require('inflected');
var Errors      = require('../validations/Errors');
var validators  = require('../validations/ValidatorRegistry').validators;
var wrap        = require('../utils/wrap');

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

        options.if.unshift(function(o) {
          return o.validationContext === options.on;
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

    validationContext: null,

    isValid: function(context, cb) {
      if (_.isFunction(context)) {
        cb = context;
        context = null;
      }

      var self = this;
      var currentContext = this.validationContext;

      this.validationContext = context;
      this.getErrors().clear();

      this._runValidations(function(err, result) {
        self.validationContext = currentContext;
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
