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
    return this.readAttribute(definition.name);
  };

  proto[definition.setterMethodName] = function(value) {
    return this.writeAttribute(definition.name, value);
  };

  proto[definition.queryMethodName] = function() {
    return this.queryAttribute(definition.name);
  };

  proto[definition.queryMethodAlias] = proto[definition.queryMethodName];
}

var Attributes = {
  mixInto: function(model, parentModel) {
    model.attributeNames = [];
    model.attributeDefinitions = {};
    model.attributeDefaults = {};

    if (parentModel) {
      for (var name in parentModel.attributeDefinitions) {
        addAttributeDefinitionToModel(model, AttributeDefinition.copy(parentModel.attributeDefinitions[name]));
      }
    }

    model.registerAttribute = function(name, spec, skipMethodCreation) {
      var definition = new AttributeDefinition(name, spec);

      addAttributeDefinitionToModel(this, definition);

      if (!skipMethodCreation) {
        addAttributeMethodsToModel(this, definition);
      }
    };
  }
};

module.exports = Attributes;
