'use strict';

var _       = require('lodash-node');
var sliced  = require('sliced');

function ScopeRegistry() {
  this._registry = {};
}

ScopeRegistry.getInstance = function() {
  process.__rejoin_ScopeRegistry = process.__rejoin_ScopeRegistry || new this();
  return process.__rejoin_ScopeRegistry;
};

ScopeRegistry.prototype.getValueFor = function(type, name) {
  this._registry[type] = this._registry[type] || {};
  return this._registry[type][name];
};

ScopeRegistry.prototype.setValueFor = function(type, name, value) {
  this._registry[type] = this._registry[type] || {};
  this._registry[type][name] = value;
  return value;
};

module.exports = {
  name: 'Scoping',

  singleton: {
    getCurrentScope: function() {
      return ScopeRegistry.getInstance().getValueFor('current_scope', this.getBaseModel().name);
    },

    setCurrentScope: function(scope) {
      return ScopeRegistry.getInstance().setValueFor('current_scope', this.getBaseModel().name, scope);
    },

    getIgnoreDefaultScope: function() {
      return ScopeRegistry.getInstance().getValueFor('ignore_default_scope', this);
    },

    setIgnoreDefaultScope: function(ignore) {
      return ScopeRegistry.getInstance().setValueFor('ignore_default_scope', this, ignore);
    },

    all: function() {
      var currentScope = this.getCurrentScope();

      if (currentScope) {
        return currentScope.clone();
      } else {
        return this.getDefaultScoped();
      }
    },

    getDefaultScoped: function() {
      return this._getRelation().merge(this._buildDefaultScope());
    },

    getScopeAttributes: function() {
      return this.all().getScopeForCreate();
    },

    hasScopeAttributes: function() {
      return this.getCurrentScope() || this.defaultScopes.length;
    },

    establishScope: function(name, fn) {
      if (name === 'default') {
        this.defaultScopes.push(fn);
      } else {
        this[name] = function() {
          var relation = this.all();
          var args = sliced(arguments);

          return relation.scoping(function() {
            return fn.apply(relation, args);
          });
        };

        this._getRelation().constructor.prototype[name] = function() {
          var args = sliced(arguments);

          return this.scoping(function() {
            return fn.apply(this, args);
          });
        };
      }
    },

    unscoped: function(fn) {
      return fn ? this._getRelation().scoping(fn) : this._getRelation();
    },

    _buildDefaultScope: function() {
      var self = this;

      if (this.defaultScopes.length) {
        return this._evaluateDefaultScope(function() {
          return self.defaultScopes.reduce(function(relation, scope) {
            return relation.merge(self.unscoped(scope));
          }, self._getRelation());
        });
      } else {
        return this._getRelation();
      }
    },

    _evaluateDefaultScope: function(fn) {
      if (this.getIgnoreDefaultScope()) {
        return null;
      }

      this.setIgnoreDefaultScope(true);
      var result = fn();
      this.setIgnoreDefaultScope(false);
      return result;
    }
  },

  prototype: {
    _initializeInternalsCallback: function() {
      this._super();
      this._populateWithCurrentScopeAttributes();
    },

    _populateWithCurrentScopeAttributes: function() {
      if (!this.constructor.hasScopeAttributes()) {
        return null;
      }

      _.forOwn(this.constructor.getScopeAttributes(), function(value, attribute) {
        var definition = this.constructor.attributeDefinitions(attribute);

        if (definition) {
          this[definition.setterMethodName](value);
        }
      });
    }
  }
};
