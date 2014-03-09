'use strict';

var AttributeDefinition = require('./AttributeDefinition');

function addAttributeDefinitionToModel(model, definition) {
  model.attributeNames.push(definition.name);
  model.attributeDefinitions[definition.name] = definition;
  model.attributeDefaults[definition.name] = definition.default;
}

function addAttributeMethodsToModel(model, definition) {
  var proto = model.prototype;

  proto[definition.getterMethodName] = function() {
    return this.getAttribute(definition.name);
  };

  proto[definition.setterMethodName] = function(value) {
    return this.setAttribute(definition.name, value);
  };

  proto[definition.queryMethodName] = function() {
    return this.queryAttribute(definition.name);
  };

  proto[definition.queryMethodAlias] = proto[definition.queryMethodName];
}

var Attributes = {
  mixInto: function(model, baseModel) {
    model.attributeNames = [];
    model.attributeDefinitions = {};
    model.attributeDefaults = {};

    if (baseModel) {
      for (var name in baseModel.attributeDefinitions) {
        addAttributeDefinitionToModel(model, AttributeDefinition.copy(baseModel.attributeDefinitions[name]));
      }
    }

    model.registerAttribute = function(name, spec) {
      var definition = new AttributeDefinition(name, spec);

      addAttributeDefinitionToModel(this, definition);
      addAttributeMethodsToModel(this, definition);
    };
  }
};

module.exports = Attributes;
