'use strict';

var _         = require('lodash-node');
var sliced    = require('sliced');
var Inflector = require('inflected');

var CallbackChain = require('../callbacks/CallbackChain');
var Callback      = require('../callbacks/Callback');
var Type          = require('../callbacks/Type');

var wrap            = require('../utils/wrap');
var extend          = require('../utils/extend');
var extractOptions  = require('../utils/extractOptions');

function CallbackSystemMixin(model) {
  model.classMethods({
    defineCallbacks: function() {
      var names = sliced(arguments);
      var options = extractOptions(names);

      _.forEach(names, function(name) {
        this.classAccessor(name + '_callbacks');
        this._setCallbacks(name, new CallbackChain(name, options));
      }, this);
    },

    _getCallbacks: function(name) {
      return this['get' + Inflector.camelize(name + '_callbacks')]();
    },

    _setCallbacks: function(name, callbacks) {
      this['set' + Inflector.camelize(name + '_callbacks')](callbacks);
    },

    _updateCallbacks: function(name, fn) {
      _.forEach([this].concat(this.descendants).reverse(), function(target) {
        var chain = target._getCallbacks(name);
        fn(target, CallbackChain.copy(chain));
      });
    },

    setCallback: function() {
      var filters = sliced(arguments);
      var name    = filters.shift();
      var type    = _.contains(Type._ALL, filters[0]) ? filters.shift() : Type.BEFORE;
      var options = {};
      var chain   = this._getCallbacks(name);

      if (filters.length > 1 && _.isPlainObject(_.last(filters))) {
        extend(options, filters.pop());
      }

      var callbacks = _.map(filters, function(filter) {
        return Callback.build(chain, type, filter, options);
      });

      this._updateCallbacks(name, function(target, chain) {
        chain[options.prepend ? 'prepend' : 'append'](callbacks);
        target._setCallbacks(name, chain);
      });
    },

    skipCallback: function() {
      var filters = sliced(arguments);
      var name    = filters.shift();
      var type    = _.contains(Type._ALL, filters[0]) ? filters.shift() : Type.BEFORE;
      var options = {};

      if (filters.length > 1 && _.isPlainObject(_.last(filters))) {
        extend(options, filters.pop());
      }

      this._updateCallbacks(name, function(target, chain) {
        _.forEach(filters, function(filter) {
          var callback = chain.find(function(callback) {
            return callback.matches(type, filter);
          });

          if (callback && _.size(options) > 0) {
            var newCallback = callback.merge(chain, options);
            chain.insert(chain.indexOf(callback), newCallback);
          }

          chain.remove(callback);
        });

        target._setCallbacks(name, chain);
      });
    },

    resetCallbacks: function(name) {
      var chain = this._getCallbacks(name);

      _.forEach(this.descendants, function(target) {
        var targetChain = CallbackChain.copy(target._getCallbacks(name));

        chain.forEach(function(callback) {
          targetChain.remove(callback);
        });

        target._setCallbacks(name, targetChain);
      });

      this._setCallbacks(name, CallbackChain.copy(chain).clear());
    }
  });

  model.instanceMethods({
    runCallbacks: function(name, fn, args) {
      var chain = this.constructor._getCallbacks(name);
      var sync = true;
      var self = this;

      if (!args) {
        args = fn;
        fn = null;
      }

      if (_.isArguments(args)) {
        args = sliced(args);
      } else {
        args = wrap(args);
      }

      var done = args.pop();

      var wrappedDone = function(err, result) {
        if (sync) {
          process.nextTick(function() {
            done(err, result);
          });
        } else {
          done(err, result);
        }
      };

      if (chain.isEmpty()) {
        if (fn) {
          fn.apply(this, args.concat(wrappedDone));
        } else {
          wrappedDone.call(this, null, this);
        }

        sync = false;
      } else {
        chain.compile(function(run) {
          var env = { target: self, halted: false, error: null, fn: fn, args: args };

          run(env, function(env) {
            wrappedDone.call(env.target, env.error, _.has(env, 'result') ? env.result : env.halted ? false : env.target);
          });

          sync = false;
        });
      }
    },

    _haltedCallbackHook: function(filter) {
      // A hook invoked every time a before callback is halted.
      // This can be overridden in callback implementors in order
      // to provide better debugging/logging.
    }
  });
}

module.exports = CallbackSystemMixin;
