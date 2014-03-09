'use strict';

var isFunc  = require('../utils/isFunc');
var hasProp = require('../utils/hasProp');
var slice   = Array.prototype.slice;

function defineMethodWithSuper(object, baseObject, name, method) {
  var superMethod = hasProp(object, name) ? object[name] : baseObject[name];
  var needsSuper  = typeof method === 'function' && typeof superMethod === 'function' && /\b_super\b/.test(method);

  object[name] = needsSuper ? (function(name, fn) {
    return function() {
      var args  = slice.call(arguments);
      var tmp   = this._super;

      this._super = superMethod;

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
