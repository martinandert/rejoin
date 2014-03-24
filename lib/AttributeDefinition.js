'use strict';

var Inflector = require('inflected');
var extend    = require('extend');
var DataType  = require('./DataType');
var isString  = require('./utils/isString');

function AttributeDefinition(name, spec) {
  this.name = name;

  var camelizedName = Inflector.camelize(name);

  this.getterMethodName = 'get' + camelizedName;
  this.setterMethodName = 'set' + camelizedName;
  this.queryMethodName  = 'is'  + camelizedName;
  this.queryMethodAlias = 'has' + camelizedName;

  spec = extend({ type: DataType.STRING }, isString(spec) ? { type: spec } : spec);

  this.type     = spec.type;
  this.default  = typeof spec.default !== 'undefined' ? spec.default : null;
}

AttributeDefinition.copy = function(other) {
  return new this(other.name, {
    type:     other.type,
    default:  other.default
  });
};

module.exports = AttributeDefinition;
