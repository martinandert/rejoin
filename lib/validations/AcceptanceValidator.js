'use strict';

var _               = require('lodash-node');
var EachValidator   = require('./EachValidator');
var createValidator = require('../ValidatorCreator').createValidator;
var Attribute       = require('../internal/AttributeDefinition');
var DataType        = require('../DataType');

var AcceptanceValidator = createValidator('AcceptanceValidator', EachValidator, {
  initialize: function(options) {
    _.defaults(options, { allowNull: true, accept: '1' });

    this._super(options);
    this._setup(options.model);
  },

  validateEach: function(record, attribute, value, done) {
    if (value !== this.options.accept) {
      record.getErrors().add(attribute, ':accepted', _.omit(this.options, 'accept', 'allowNull'));
    }

    done();
  },

  _setup: function(model) {
    var proto = model.prototype;

    _.forEach(this.attributes, function(attribute) {
      var getter = Attribute.getterMethodNameFor(attribute);
      var setter = Attribute.setterMethodNameFor(attribute);

      if (!_.isFunction(proto[getter]) && !_.isFunction(proto[setter])) {
        model.attribute(attribute, DataType.BOOLEAN);
      }
    });
  }
});

module.exports = AcceptanceValidator;
