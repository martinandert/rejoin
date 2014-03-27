'use strict';

var _         = require('lodash-node');
var Inflector = require('inflected');
var translate = require('counterpart');
var all       = require('../utils/all');
var wrap      = require('../utils/wrap');
var isBlank   = require('../utils/isBlank');

function Errors(record) {
  this.record = record;
  this.messages = {};
}

Errors.prototype.clear = function() {
  this.messages = {};
};

Errors.prototype.hasKey = function(key) {
  return this.get(key).length > 0;
};

Errors.prototype.get = function(key) {
  if (_.isUndefined(this.messages[key])) {
    this.messages[key] = [];
  }

  return this.messages[key];
};

Errors.prototype.set = function(key, value) {
  this.get(key).push(value);
};

Errors.prototype.remove = function(key) {
  this.messages = _.omit(this.messages, key);
};

Errors.prototype.each = function(cb, context) {
  _.forOwn(this.messages, function(errors, key) {
    _.forEach(errors, function(error) {
      cb.call(context, key, error);
    });
  });
};

Errors.prototype.map = function(cb, context) {
  var result = [];

  this.each(function(key, error) {
    result.push(cb.call(context, key, error));
  });

  return result;
};

Errors.prototype.getKeys = function() {
  return _.keys(this.messages);
};

Errors.prototype.getValues = function() {
  return _.values(this.messages);
};

Errors.prototype.getSize = function() {
  return _.flatten(this.getValues()).length;
};

Errors.prototype.toArray = function() {
  return this.getFullMessages();
};

Errors.prototype.getCount = function() {
  return this.toArray.length;
};

Errors.prototype.isEmpty = function() {
  return all(this.getValues(), _.isEmpty);
};

Errors.prototype.toJSON = function(options) {
  _.defaults(options, { fullMessages: false });

  return JSON.stringify(this.toHash(options.fullMessages));
};

Errors.prototype.toHash = function(fullMessages) {
  if (fullMessages) {
    var messages = {};

    _.forOwn(this.messages, function(errors, key) {
      messages[key] = _.map(errors, function(error) {
        return this.getFullMessage(key, error);
      }, this);
    }, this);

    return messages;
  } else {
    return _.clone(this.messages);
  }
};

Errors.prototype.inspect = function() {
  return this.toHash();
};

Errors.prototype.add = function(key, error, options) {
  error   = error || ':invalid';
  options = options || {};

  error = this._normalizeError(key, error, options);

  this.set(key, error);
};

Errors.prototype.addOnEmpty = function(keys, options) {
  _.forEach(wrap(keys), function(key) {
    var value = this.record.readAttributeForValidation(key);

    if (_.isEmpty(value)) {
      this.add(key, ':empty', options);
    }
  });
};

Errors.prototype.addOnBlank = function(keys, options) {
  _.forEach(wrap(keys), function(key) {
    var value = this.record.readAttributeForValidation(key);

    if (isBlank(value)) {
      this.add(key, ':blank', options);
    }
  });
};

Errors.prototype.added = function(key, error, options) {
  error   = error || ':invalid';
  options = options || {};

  error = this._normalizeError(key, error, options);

  return this.get(key).indexOf(error) > -1;
};

Errors.prototype.getFullMessages = function() {
  return this.map(function(key, error) {
    return this.getFullMessage(key, error);
  }, this);
};

Errors.prototype.getFullMessagesFor = function(key) {
  return _.map(this.get(key), function(error) {
    return this.getFullMessage(key, error);
  }, this);
};

Errors.prototype.getFullMessage = function(key, error) {
  if (key === ':base') {
    return error;
  }

  var attribute = Inflector.humanize(key.replace(/\./g, '_'));
  attribute = this.record.constructor.getHumanAttributeName(key, { fallback: attribute });

  return translate('rejoin.errors.format', {
    fallback:   '%(attribute)s %(message)s',
    attribute:  attribute,
    message:    error
  });
};

Errors.prototype.generateMessage = function(attribute, type, options) {
  type = type || ':invalid';
  options = options || {};

  if (_.isString(options.message) && options.message[0] === ':') {
    type = options.message;
    options = _.omit(options, 'message');
  }

  type = type.substr(1);

  var scope = this.record.constructor.getI18nScope();

  var defaults = _.map(this.record.constructor.lookupAncestors(), function(model) {
    return [
      ':' + scope + '.errors.models.' + model.getI18nKey() + '.attributes.' + attribute + '.' + type,
      ':' + scope + '.errors.models.' + model.getI18nKey() + '.' + type
    ];
  });

  if (_.has(options, 'message')) {
    defaults.push(options.message);
    options = _.omit(options, 'message');
  }

  defaults.push(':' + scope + '.errors.messages.' + type);

  defaults = _.flatten(_.compact(defaults));

  var key = defaults.shift();
  var value = (attribute !== ':base') ? this.record.readAttributeForValidation(attribute) : null;

  options = _.defaults({}, options, {
    fallback: defaults,
    model: Inflector.humanize(this.record.constructor.name),
    attribute: this.record.constructor.getHumanAttributeName(attribute),
    value: value
  });

  return translate(key, options);
};

Errors.prototype._normalizeError = function(key, error, options) {
  if (_.isString(error) && error[0] === ':') {
    return this.generateMessage(key, error, _.omit(options, 'if', 'unless', 'on', 'allowNull', 'allowBlank'));
  }

  if (_.isFunction(error)) {
    return error();
  }

  return error;
};

module.exports = Errors;
