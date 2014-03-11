'use strict';

var Typed = {
  getObjectType: function(value) {
    return Object.prototype.toString.call(value);
  },

  getType: function(value) {
    var result = 'object';
    var types = ['Array', 'RegExp', 'Date', 'Function', 'Boolean', 'Number', 'Error', 'String', 'Null', 'Undefined'];

    for (var i = 0, ii = types.length; i < ii; i++) {
      var type = types[i];

      if (Typed['is' + type](value)) {
        result = type.toLowerCase();
        break;
      }
    }

    return result;
  },

  isPlainObject: function(value) {
    return Typed.isObject(value) &&
      value.__proto__ === Object.prototype;  // jshint ignore:line
  },

  isObject: function(value) {
    return value && typeof value === 'object';
  },

  isError: function(value) {
    return value instanceof Error;
  },

  isDate: function(value) {
    return Typed.getObjectType(value) === '[object Date]';
  },

  isArguments: function(value) {
    return Typed.getObjectType(value) === '[object Arguments]';
  },

  isFunction: function(value) {
    return Typed.getObjectType(value) === '[object Function]';
  },

  isRegExp: function(value) {
    return Typed.getObjectType(value) === '[object RegExp]';
  },

  isArray: function(value) {
    if (typeof Array.isArray === 'function') {
      return Array.isArray(value);
    } else {
      return Typed.getObjectType(value) === '[object Array]';
    }
  },

  isNumber: function(value) {
    return typeof value === 'number' || Typed.getObjectType(value) === '[object Number]';
  },

  isString: function(value) {
    return typeof value === 'string' || Typed.getObjectType(value) === '[object String]';
  },

  isBoolean: function(value) {
    return value === true || value === false || Typed.getObjectType(value) === '[object Boolean]';
  },

  isNull: function(value) {
    return value === null;
  },

  isUndefined: function(value) {
    return typeof value === 'undefined';
  }
};

module.exports = Typed;
