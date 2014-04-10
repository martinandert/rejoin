'use strict';

var _         = require('lodash-node');
var sliced    = require('sliced');
var Inflector = require('inflected');
var Callbacks = require('../Callbacks');
var wrap      = require('../utils/wrap');

function CallbacksMixin(model) {
  model.classMethods({
    beforeValidation: function() {
      var args = sliced(arguments);
      var options = _.isPlainObject(_.last(args)) ? args.pop() : {};

      if (_.has(options, 'on')) {
        options.if = wrap(options.if);
        options.on = wrap(options.on);

        options.if.unshift(function(record) {
          return _.contains(options.on, record.getValidationContext());
        });
      }

      args.push(options);
      args.unshift(Callbacks.Type.BEFORE);
      args.unshift('validation');

      this.setCallback.apply(this, args);
    },

    afterValidation: function() {
      var args = sliced(arguments);
      var options = _.isPlainObject(_.last(args)) ? args.pop() : {};

      options.prepend = true;

      if (_.has(options, 'on')) {
        options.if = wrap(options.if);
        options.on = wrap(options.on);

        options.if.unshift(function(record) {
          return _.contains(options.on, record.getValidationContext());
        });
      }

      args.push(options);
      args.unshift(Callbacks.Type.AFTER);
      args.unshift('validation');

      this.setCallback.apply(this, args);
    },

    defineModelCallbacks: function() {
      var callbacks = sliced(arguments);
      var options   = _.isPlainObject(_.last(callbacks)) ? callbacks.pop() : {};

      _.defaults(options, {
        skipAfterCallbacksIfHalted: true,
        scope: ['type', 'name'],
        only: Callbacks.Type._ALL
      });

      var types = wrap(options.only);
      delete options.only;

      _.forEach(callbacks, function(callback) {
        this.defineCallbacks(callback, options);

        _.forEach(types, function(type) {
          this['_' + Inflector.camelize('define_' + type + '_model_callback', false)](this, callback);
        }, this);
      }, this);
    },

    _defineBeforeModelCallback: function(model, callback) {
      model[Inflector.camelize('before_' + callback, false)] = function() {
        var args = sliced(arguments);

        args.unshift(Callbacks.Type.BEFORE);
        args.unshift(callback);

        this.setCallback.apply(this, args);
      };
    },

    _defineAfterModelCallback: function(model, callback) {
      model[Inflector.camelize('after_' + callback, false)] = function() {
        var args    = sliced(arguments);
        var options = _.isPlainObject(_.last(args)) ? args.pop() : {};

        options.prepend = true;

        var ifs = wrap(options.if);
        ifs.push(new Callbacks.ResultFilter(function(result) { return result !== false; }));
        options.if = ifs;

        args.push(options);
        args.unshift(Callbacks.Type.AFTER);
        args.unshift(callback);

        this.setCallback.apply(this, args);
      };
    }
  });

  model.instanceMethods({
    initialize: function() {
      this.runCallbacks('initialize', this._super, arguments);
    },

    populate: function() {
      var args  = sliced(arguments);
      var cb    = args.pop();
      var self  = this;

      // TODO: find a better way
      this._super.apply(this, args.concat(function(err, result) {
        self.runCallbacks('find', function(err, result) {
          if (err) {
            cb(err);
          } else {
            result.runCallbacks('initialize', function(err, result) {
              if (err) { cb(err); return; }

              cb(null, self);
            });
          }
        });
      }));
    },

    touch: function() {
      this.runCallbacks('touch', this._super, arguments);
    },

    destroy: function() {
      this.runCallbacks('destroy', this._super, arguments);
    },

    _createOrUpdate: function() {
      this.runCallbacks('save', this._super, arguments);
    },

    _createRecord: function() {
      this.runCallbacks('create', this._super, arguments);
    },

    _updateRecord: function() {
      this.runCallbacks('update', this._super, arguments);
    },

    _runValidations: function() {
      this.runCallbacks('validation', this._super, arguments);
    }
  });
}

CallbacksMixin.mixedIn = function(model) {
  model.defineCallbacks('validation', {
    skipAfterCallbacksIfHalted: true,
    scope: ['kind', 'name']
  });

  model.defineModelCallbacks('initialize', 'find', 'touch', { only: Callbacks.Type.AFTER });
  model.defineModelCallbacks('save', 'create', 'update', 'destroy');
};

module.exports = CallbacksMixin;
