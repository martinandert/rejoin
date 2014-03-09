'use strict';

var Inflector = require('inflected');

var isString = require('../utils/isString');

function AttributeDefinition(name, spec) {
  this.name = name;

  var camelizedName = Inflector.camelize(name);

  this.getterMethodName = 'get' + camelizedName;
  this.setterMethodName = 'set' + camelizedName;
  this.queryMethodName  = 'is'  + camelizedName;
  this.queryMethodAlias = 'has' + camelizedName;

  if (isString(spec)) {
    spec = { type: spec, column: name };
  }

  this.type     = spec.type;
  this.column   = Inflector.underscore(spec.column || name);
  this.default  = spec.default;
}

AttributeDefinition.copy = function(other) {
  return new this(other.name, {
    type:     other.type,
    column:   other.column,
    default:  other.default
  });
};

module.exports = AttributeDefinition;
