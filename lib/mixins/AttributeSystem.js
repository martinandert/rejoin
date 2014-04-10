'use strict';

var _           = require('lodash-node');
var sliced      = require('sliced');
var DataType    = require('../DataType');
var Definition  = require('../internal/AttributeDefinition');

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

  _.forEach(model.attributeMethodMatchers, function(matcher) {
    proto[matcher.prefix + definition.camelizedName + matcher.suffix] = function(options) {
      return this[matcher.prefix + 'Attribute' + matcher.suffix](definition.name, options);
    };
  });
}

function AttributeSystemMixin(model) {
  model.classMethods({
    attributes: function(specs) {
      for (var name in specs) {
        this._registerAttribute(name, specs[name]);
      }
    },

    attribute: function(name, spec) {
      this._registerAttribute(name, spec);
    },

    _registerAttribute: function(name, spec, skipMethodCreation) {
      var definition = new Definition(name, spec);

      addAttributeDefinitionToModel(this, definition);

      if (!skipMethodCreation) {
        addAttributeMethodsToModel(this, definition);
      }
    },

    attributeMethodPrefix: function() {
      var prefixes = _.flatten(sliced(arguments));

      _.forEach(prefixes, function(prefix) {
        this.attributeMethodMatchers.push({ prefix: prefix, suffix: '' });
      }, this);
    },

    attributeMethodSuffix: function() {
      var suffixes = _.flatten(sliced(arguments));

      _.forEach(suffixes, function(suffix) {
        this.attributeMethodMatchers.push({ prefix: '', suffix: suffix });
      }, this);
    },

    attributeMethodAffix: function() {
      var affixes = _.flatten(sliced(arguments));

      _.forEach(affixes, function(affix) {
        this.attributeMethodMatchers.push({ prefix: affix.prefix, suffix: affix.suffix });
      }, this);
    }
  });
}

AttributeSystemMixin.mixedIn = function(model) {
  model.attributeNames = [];
  model.attributeDefinitions = {};
  model.attributeDefaults = {};
  model.attributeMethodMatchers = [];
};

AttributeSystemMixin.inherited = function(model) {
  model.attributeNames = [];
  model.attributeDefinitions = {};
  model.attributeDefaults = {};
  model.attributeMethodMatchers = model.parentModel.attributeMethodMatchers.slice();

  var parentDefinitions = model.parentModel.attributeDefinitions;

  for (var name in parentDefinitions) {
    addAttributeDefinitionToModel(model, Definition.copy(parentDefinitions[name]));
  }

  if (model.attributeNames.length === 0) {
    var primaryKey = model.getPrimaryKey();

    if (primaryKey) {
      model._registerAttribute(primaryKey, DataType.PRIMARY_KEY, true);
    }
  }
};

module.exports = AttributeSystemMixin;
