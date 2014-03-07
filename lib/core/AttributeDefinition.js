'use strict';

var Inflector = require('inflected');

function AttributeDefinition(name, spec) {
  this.name = name;

  var camelizedName = Inflector.camelize(name);

  this.getterMethodName = 'get' + camelizedName;
  this.setterMethodName = 'set' + camelizedName;
  this.queryMethodName  = 'is'  + camelizedName;
}

module.exports = AttributeDefinition;
