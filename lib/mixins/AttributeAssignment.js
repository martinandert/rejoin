'use strict';

var isPlainObject = require('../utils/isPlainObject');

module.exports = {
  name: "AttributeAssignment",

  prototype: {
    setAttributes: function(attributes) {
      if (!isPlainObject(attributes)) {
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
        } else if (isPlainObject(value)) {
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
  }
};
