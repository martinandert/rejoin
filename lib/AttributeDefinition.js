'use strict';

var _         = require('lodash-node');
var Inflector = require('inflected');
var DataType  = require('./DataType');

function AttributeDefinition(name, spec) {
  this.name = name;

  var camelizedName = Inflector.camelize(name);

  this.getterMethodName = 'get' + camelizedName;
  this.setterMethodName = 'set' + camelizedName;
  this.queryMethodName  = 'is'  + camelizedName;
  this.queryMethodAlias = 'has' + camelizedName;

  spec = _.defaults(_.isString(spec) ? { type: spec } : spec, { type: DataType.STRING });

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