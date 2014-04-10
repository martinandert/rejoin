'use strict';

var _         = require('lodash-node');
var Inflector = require('inflected');
var DataType  = require('../DataType');

function AttributeDefinition(name, spec) {
  this.name = name;

  this.camelizedName    = AttributeDefinition.camelizedNameFor(name);
  this.getterMethodName = AttributeDefinition.getterMethodNameFor(name);
  this.setterMethodName = AttributeDefinition.setterMethodNameFor(name);
  this.queryMethodName  = AttributeDefinition.queryMethodNameFor(name);
  this.queryMethodAlias = AttributeDefinition.queryMethodNameAliasFor(name);

  spec = _.defaults(_.isString(spec) ? { type: spec } : spec || {}, { type: DataType.STRING, allowNull: true });

  this.type       = spec.type;
  this.allowNull  = spec.allowNull;
  this.default    = typeof spec.default !== 'undefined' ? spec.default : null;
}

AttributeDefinition.copy = function(other) {
  return new this(other.name, {
    type:       other.type,
    allowNull:  other.allowNull,
    default:    other.default
  });
};

AttributeDefinition.camelizedNameFor = function(attribute) {
  return Inflector.camelize(attribute);
},

AttributeDefinition.getterMethodNameFor = function(attribute) {
  return 'get' + this.camelizedNameFor(attribute);
};

AttributeDefinition.setterMethodNameFor = function(attribute) {
  return 'set' + this.camelizedNameFor(attribute);
};

AttributeDefinition.queryMethodNameFor = function(attribute) {
  return 'is' + this.camelizedNameFor(attribute);
};

AttributeDefinition.queryMethodNameAliasFor = function(attribute) {
  return 'has' + this.camelizedNameFor(attribute);
};

AttributeDefinition.prototype.isNumeric = function() {
  return [DataType.PRIMARY_KEY, DataType.INTEGER, DataType.FLOAT, DataType.DECIMAL].indexOf(this.type) > -1;
};

AttributeDefinition.prototype.typeCast = function(value) {
  if (value === null) {
    return value;
  }

  switch (this.type) {
    case DataType.STRING:
    case DataType.TEXT:
      return _.isString(value) ? value : String(value);

    case DataType.PRIMARY_KEY:
    case DataType.INTEGER:
    case DataType.FLOAT:
    case DataType.DECIMAL:
      return _.isNumber(value) ? value : Number(value);

    case DataType.DATETIME:
    case DataType.TIMESTAMP:
    case DataType.DATE:
    case DataType.TIME:
      return _.isDate(value) ? value : new Date(value);

    case DataType.BOOLEAN:
      return _.isBoolean(value) ? value : ['1', 't', 'true', 'y', 'yes'].indexOf(String(value).toLowerCase()) > -1;

    default: // DataType.BINARY
      return value;
  }
};

module.exports = AttributeDefinition;
