'use strict';

var _         = require('lodash-node');
var Inflector = require('inflected');
var translate = require('counterpart');

function NamingMixin(model) {
  model.classMethods({
    getI18nKey: function() {
      return Inflector.underscore(this.name);
    },

    getI18nScope: function() {
      return 'rejoin';
    },

    getHumanName: function(options) {
      options = _.clone(options || {});
      _.defaults(options, { count: 1 });

      var defaults = _.map(this.lookupAncestors(), function(model) {
        return ':' + this.getI18nScope() + '.models.' + model.getI18nKey();
      }, this);

      if (_.has(options, 'fallback')) {
        defaults.push(options.fallback);
        options = _.omit(options, 'fallback');
      }

      defaults.push(Inflector.humanize(this.getI18nKey()));
      defaults = _.flatten(_.compact(defaults));
      var key = defaults.shift();
      options.fallback = defaults;

      return translate(key, options);
    },

    getHumanAttributeName: function(attribute, options) {
      options = _.clone(options || {});
      _.defaults(options, { count: 1 });

      var defaults = _.map(this.lookupAncestors(), function(model) {
        return [
          ':' + this.getI18nScope() + '.attributes.' + model.getI18nKey() + '.' + attribute,
          ':' + this.getI18nScope() + '.attributes.' + attribute
        ];
      }, this);

      if (_.has(options, 'fallback')) {
        defaults.push(options.fallback);
        options = _.omit(options, 'fallback');
      }

      defaults.push(Inflector.humanize(attribute));
      defaults = _.flatten(_.compact(defaults));
      var key = defaults.shift();
      options.fallback = defaults;

      return translate(key, options);
    },

    lookupAncestors: function() {
      var model = this;
      var result = [model];

      while (!model.isModelBase()) {
        model = model.parentModel;
        result.push(model);
      }

      return result;
    }
  });
}

module.exports = NamingMixin;
