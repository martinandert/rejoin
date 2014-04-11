'use strict';

var _               = require('lodash-node');
var EachValidator   = require('./EachValidator');
var createValidator = require('../ValidatorCreator').createValidator;
var Attribute       = require('../internal/AttributeDefinition');
var DataType        = require('../DataType');

var ConfirmationValidator = createValidator('ConfirmationValidator', EachValidator, {
  initialize: function(options) {
    this._super(options);
    this._setup(options.model);
  },

  validateEach: function(record, attribute, value, done) {
    var confirmed = record[Attribute.getterMethodNameFor(attribute + '_confirmation')]();

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

      if (!_.isFunction(proto[getter]) && !_.isFunction(proto[setter])) {
        model.attribute(attribute, DataType.BOOLEAN);
      }
    });
  }
});

module.exports = ConfirmationValidator;
