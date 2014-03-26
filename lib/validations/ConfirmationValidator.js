'use strict';

var _               = require('lodash-node');
var EachValidator   = require('./EachValidator');
var createValidator = require('../ValidatorCreator').createValidator;
var Attribute       = require('../AttributeDefinition');

var ConfirmationValidator = createValidator('ConfirmationValidator', EachValidator, {
  initialize: function(options) {
    this._super(options);
    this._setup(options.model);
  },

  validateEach: function(record, attribute, value, done) {
    var confirmed = record[Attribute.getterMethodNameFor(attribute + '_confirmation')];

    if (value !== confirmed) {
      var human = record.constructor.getHumanAttributeName(attribute);

      record.getErrors().add(attribute + '_confirmation', ':confirmation', _.defaults({ attribute: human }, this.options));
    }

    done();
  },

  _setup: function(model) {
    var proto = model.prototype;

    _.forEach(this.attributes, function(attribute) {
      attribute = attribute + '_confirmation';

      var getter = Attribute.getterMethodNameFor(attribute);
      var setter = Attribute.setterMethodNameFor(attribute);

      if (!_.isFunction(proto[getter])) {
        proto[getter] = function() {
          return this['_' + attribute] || null;
        };
      }

      if (!_.isFunction(proto[setter])) {
        proto[setter] = function(value) {
          this['_' + attribute] = value;
          return value;
        };
      }
    });
  }
});

module.exports = ConfirmationValidator;
