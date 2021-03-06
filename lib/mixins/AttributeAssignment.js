'use strict';

var _ = require('lodash-node');

function AttributeAssignmentMixin(model) {
  model.instanceMethods({
    setAttributes: function(attributes) {
      if (!_.isPlainObject(attributes)) {
        throw new TypeError('when assigning attributes, you must pass a plain object as argument');
      }

      if (Object.keys(attributes).length === 0) {
        return;
      }

      var multiParameterAttributes = [];
      var nestedParameterAttributes = [];

      // TODO
      //attributes = this._sanitizeForMassAssignment(attributes);

      for (var name in attributes) {
        var value = attributes[name];

        if (name.indexOf('(') > -1) {
          multiParameterAttributes.push([name, value]);
        } else if (_.isPlainObject(value)) {
          nestedParameterAttributes.push([name, value]);
        } else {
          this._assignAttribute(name, value);
        }
      }

      this._assignNestedParameterAttributes(nestedParameterAttributes);
      this._assignMultiParameterAttributes(multiParameterAttributes);
    },

    _assignAttribute: function(name, value) {
      var definition = this.constructor.attributeDefinitions[name];

      if (definition) {
        this[definition.setterMethodName](value);
      } else {
        throw new Error('unknown attribute: ' + name);
      }
    },

    _assignNestedParameterAttributes: function(pairs) {
      for (var i = 0, ii = pairs.length; i < ii; i++) {
        var pair = pairs[i];

        this._assignAttribute(pair[0], pair[1]);
      }
    },

    _assignMultiParameterAttributes: function(pairs) {
      // TODO
    }
  });
}

module.exports = AttributeAssignmentMixin;
