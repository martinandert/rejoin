'use strict';

function defineMethodWithSuper(model, name, method) {
  var proto     = model.prototype;
  var baseProto = model.baseModel.prototype;

  proto[name] = (typeof method === 'function' && typeof baseProto[name] === 'function' && /\b_super\b/.test(method)) ? (function(name, fn) {
    return function() {
      var tmp = this._super;
      this._super = baseProto[name];
      var result = fn.apply(this, arguments);
      this._super = tmp;
      return result;
    };
  })(name, method) : method;
}

module.exports = defineMethodWithSuper;
