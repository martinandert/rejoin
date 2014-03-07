'use strict';

var isFunc  = require('../utils/isFunc');
var hasProp = require('../utils/hasProp');
var slice   = Array.prototype.slice;

function defineMethodWithSuper(model, name, method) {
  var prototype   = model.prototype;
  var otherMethod = hasProp(prototype, name) ? prototype[name] : model.baseModel.prototype[name];
  var needsSuper  = typeof method === 'function' && typeof otherMethod === 'function' && /\b_super\b/.test(method);

  prototype[name] = needsSuper ? (function(name, fn) {
    return function() {
      var args  = slice.call(arguments);
      var tmp   = this._super;

      this._super = otherMethod;

      if (isFunc(args[args.length - 1])) {
        var self  = this;
        var cb    = args.pop();

        args.push(function(err, result) {
          self._super = tmp;
          cb.call(self, err, result);
        });

        fn.apply(this, args);
      } else {
        var result = fn.apply(this, args);
        this._super = tmp;
        return result;
      }
    };
  })(name, method) : method;
}

module.exports = defineMethodWithSuper;
