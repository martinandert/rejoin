'use strict';

var Inflector = require('inflected');
var Type      = require('./Type');
var Filters   = require('./Filters');
var wrap      = require('../utils/wrap');

function Callback(name, type, filter, options, chainConfig) {
  this._name   = name;
  this._type   = type;
  this._filter = filter;
  this._if     = wrap(options.if);
  this._unless = wrap(options.unless);
  this._chainConfig = chainConfig;
}

Callback.build = function(chain, type, filter, options) {
  return new Callback(chain.getName(), type, filter, options, chain.getConfig());
};

Callback.prototype.getType = function() {
  return this._type;
};

Callback.prototype.getName = function() {
  return this._name;
};

Callback.prototype.getChainConfig = function() {
  return this._chainConfig;
};

Callback.prototype.getFilter = function() {
  return this._filter;
};

Callback.prototype.merge = function(chain, newOptions) {
  var options = {
    if:     this._if.slice(),
    unless: this._unless.slice()
  };

  options.if      = options.if.concat(wrap(newOptions.unless));
  options.unless  = options.unless.concat(wrap(newOptions.if));

  return Callback.build(chain, this._filter, this._type, options);
};

Callback.prototype.matches = function(type, filter) {
  if (this._type !== type) {
    return false;
  }

  if (this._filter.toString() !== filter.toString()) {
    return false;
  }

  if (Object.prototype.toString.call(this._filter) === '[object Object]' && Object.prototype.toString.call(filter) === '[object Object]') {
    return this._filter.kind === filter.kind;
  }

  return false;
};

Callback.prototype.duplicates = function(other) {
  if (Object.prototype.toString.call(this._filter) === '[object String]') {
    return this.matches(other.getType(), other.getFilter());
  } else {
    return false;
  }
};

Callback.prototype.apply = function(nextCallback) {
  var userCallback   = this._getFilterFunction();
  var userConditions = this._getConditionsFunctions();

  switch (this.getType()) {
    case Type.BEFORE:
      return Filters.Before(nextCallback, userCallback, userConditions, this.getChainConfig(), this._filter);
    case Type.AFTER:
      return Filters.After(nextCallback, userCallback, userConditions, this.getChainConfig());
    default:
      throw new Error('Callback#apply: unknown callback type: ' + this.getType());
  }
};

Callback.prototype._getFilterFunction = function() {
  var filter = this._filter;

  switch (Object.prototype.toString.call(filter)) {
    case '[object String]':
      return function(env, cb) {
        env.target[filter](function(err, halt) {
          if (err) {
            env.error = err;
          } else {
            env.halted = halt;
          }

          cb(env);
        });
      };

    case '[object Function]':
      return function(env, cb) {
        filter.call(env.target, function(err, halt) {
          if (err) {
            env.error = err;
          } else {
            env.halted = halt;
          }

          cb(env);
        });
      };

    case '[object Object]':
      var scopes = wrap(this.getChainConfig().scope);
      var method = Inflector.camelize(scopes.map(function(scope) { return this['_' + scope]; }, this).join('_'), false);

      return function(env, cb) {
        filter[method](env.target, function(err, halt) {
          if (err) {
            env.error = err;
          } else {
            env.halted = halt;
          }

          cb(env);
        });
      };

    default:
      return filter;
  }
};

Callback.prototype._getConditionsFunctions = function() {
  return this._if.map(function(c) {
    return this._makeConditionFunction(c);
  }, this).concat(this._unless.map(function(c) {
    return this._invertConditionFunction(this._makeConditionFunction(c));
  }, this));
};

Callback.prototype._makeConditionFunction = function(condition) {
  switch (Object.prototype.toString.call(condition)) {
    case '[object String]':
      return function(target, _) {
        return target[condition](target);
      };

    case '[object Function]':
      if (condition instanceof Filters.Result) {
        return condition.fn;
      } else {
        return function(target, _) {
          return condition.call(target, target);
        };
      }

      break;

    default:
      return condition.fn;
  }
};

Callback.prototype._invertConditionFunction = function(fn) {
  var self = this;

  return function() {
    return !fn.apply(self, arguments);
  };
};

module.exports = Callback;
