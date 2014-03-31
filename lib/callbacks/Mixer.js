'use strict';

var _       = require('lodash-node');
var sliced  = require('sliced');

var CallbackChain = require('./CallbackChain');
var Callback      = require('./Callback');
var Filters       = require('./Filters');
var Type          = require('./Type');

var extend  = require('../utils/extend');
var wrap    = require('../utils/wrap');

var toString  = Object.prototype.toString;

var Mixer = {
  mixInto: function(ctorFunc, copyFromCtorFunc) {
    ctorFunc.callbackChains = {};

    if (copyFromCtorFunc) {
      for (var name in copyFromCtorFunc.callbackChains) {
        ctorFunc.callbackChains[name] = CallbackChain.copy(copyFromCtorFunc.callbackChains[name]);
      }
    }

    ctorFunc.defineCallbackChains = function() {
      var names = sliced(arguments);

      var options = {
        skipAfterCallbacksIfHalted: true,
        only: [Type.BEFORE, Type.AROUND, Type.AFTER]
      };

      if (toString.call(names[names.length - 1]) === '[object Object]') {
        extend(options, names.pop());
      }

      options.only = wrap(options.only);

      names.forEach(function(name) {
        this.callbackChains[name] = new CallbackChain(name, options);
      }, this);
    };

    ctorFunc.defineCallbackChain = ctorFunc.defineCallbackChains;

    ctorFunc.registerCallback = function() {
      var filters = sliced(arguments);
      var name    = filters.shift();
      var chain   = this.callbackChains[name];
      var type    = _.contains(Type._ALL, filters[0]) ? filters.shift() : Type.BEFORE;
      var options = {};

      if (!_.contains(chain.getConfig().only, type)) {
        throw new Error('ctorFunc#registerCallback: chain "' + chain.getName() + '" does not allow `' + type + '` as callback type');
      }

      if (type === Type.AFTER) {
        options.prepend = true;

        if (chain.getConfig().skipOnFalseResult !== false) {
          var ifs = wrap(options.if);
          ifs.push(new Filters.Result(function(result) { return result !== false; }));
          options.if = ifs;
        }
      }

      if (toString.call(filters[filters.length - 1]) === '[object Object]') {
        extend(options, filters.pop());
      }

      var callbacks = filters.map(function(filter) {
        return Callback.build(chain, type, filter, options);
      });

      options.prepend ? chain.prepend(callbacks) : chain.append(callbacks);

      this.callbackChains[name] = chain;
    };

    ctorFunc.resetCallbacks = function(name) {
      var chain = this.callbackChains[name];

      if (Array.isArray(this.descendants)) {
        this.descendants.forEach(function(target) {
          var targetChain = CallbackChain.copy(target.callbackChains[name]);

          chain.forEach(function(callback) {
            targetChain.remove(callback);
          });

          target.callbackChains[name] = targetChain;
        });
      }

      this.callbackChains[name] = CallbackChain.copy(chain).clear();
    };

    var proto = ctorFunc.prototype;

    proto.runCallbacks = function(name, fn, args) {
      var chain = ctorFunc.callbackChains[name];
      var done;

      if (!args) {
        args = [fn];
        fn = null;
      }

      args = sliced(args);

      if (chain.isEmpty()) {
        if (fn) {
          fn.apply(this, args);
        } else {
          done = args.pop();
          done.call(this, null, this);
        }
      } else {
        var self = this;

        done = args.pop();

        chain.compile(function(run) {
          var env = { target: self, halted: false, error: null, fn: fn, args: args };

          run(env, function(env) {
            done.call(env.target, env.error, _.has(env, 'result') ? env.result : env.target);
          });
        });
      }
    };

    proto._haltedCallbackHook = function(filter) {
      // A hook invoked every time a before callback is halted.
      // This can be overridden in callback implementors in order
      // to provide better debugging/logging.
    };
  }
};

module.exports = Mixer;
