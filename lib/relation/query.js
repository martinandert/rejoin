'use strict';

var _       = require('lodash-node');
var sliced  = require('sliced');
var objMap  = require('../utils/objMap');

var VALID_DIRECTIONS = ['asc', 'desc', 'ASC', 'DESC'];

module.exports = {
  select: function() {
    var fields = _.flatten(sliced(arguments));

    this.setSelectValues(this.getSelectValues().concat(fields));
    return this;
  },

  distinct: function(value) {
    if (typeof value === 'undefined' || value === null) {
      value = true;
    }

    this.setDistinctValue(value);
    return this;
  },

  unique: function(value) {
    return this.distinct(value);
  },

  limit: function(value) {
    this.setLimitValue(value);
    return this;
  },

  offset: function(value) {
    this.setOffsetValue(value);
    return this;
  },

  order: function() {
    var args = sliced(arguments);
    this._checkIfMethodHasArguments('order', args);
    args = this._preprocessOrderArgs(args);
    this.setOrderValues(this.getOrderValues().concat(args));
    return this;
  },

  reorder: function() {
    var args = sliced(arguments);
    this._checkIfMethodHasArguments('reorder', args);
    args = this._preprocessOrderArgs(args);
    this.setReorderingValue(true);
    this.setOrderValues(args);
    return this;
  },

  reverseOrder: function() {
    this.setReverseOrderValue(!this.getReverseOrderValue());
    return this;
  },

  group: function() {
    var args = _.flatten(sliced(arguments));
    this._checkIfMethodHasArguments('group', args);
    this.setGroupValues(this.getGroupValues().concat(args));
    return this;
  },

  where: function(opts) {
    this._checkIfMethodHasArguments('where', opts);

    // TODO: handle references

    this.setWhereValues(this.getWhereValues().concat(this._buildWhere(opts, false)));
    return this;
  },

  whereNot: function(opts) {
    this._checkIfMethodHasArguments('whereNot', opts);

    // TODO: handle references

    this.setWhereValues(this.getWhereValues().concat(this._buildWhere(opts, true)));
    return this;
  },

  having: function(opts) {
    this._checkIfMethodHasArguments('whereNot', opts);

    // TODO: handle references

    this.setHavingValues(this.getHavingValues().concat(this._buildWhere(opts, false)));
    return this;
  },

  _buildWhere: function(opts, not) {
    if (_.isString(opts) || Array.isArray(opts)) {
      // TODO
    } else if (_.isPlainObject(opts)) {
      // TODO: handle aggregations
      var attributes = opts;
      // TODO: handle Relation values

      return this._buildPredicatesFromHash(this.model, attributes, this.table, not);
    } else {
      return [opts];
    }
  },

  _sanitizeLimit: function(value) {
    if (_.isNumber(value)) {
      return value;
    } else {
      var number = parseInt(value, 10);

      if (isNaN(number)) {
        throw new Error('limit value must be a number');
      }

      return number;
    }
  },

  _checkIfMethodHasArguments: function(method, args) {
    if (_.isEmpty(args)) {
      throw new Error('the method ' + method + '() must contain arguments');
    }
  },

  _validateOrderArgs: function(args) {
    for (var i = 0, ii = args.length; i < ii; i++) {
      var arg = args[i];

      if (_.isPlainObject(arg)) {
        _.forOwn(arg, check);
      }
    }

    function check(direction, field) {
      if (VALID_DIRECTIONS.indexOf(direction) === -1) {
        throw new Error('direction "' + direction + '" is invalid');
      }
    }
  },

  _preprocessOrderArgs: function(args) {
    var result = _.flatten(args);

    this._validateOrderArgs(result);

    // TODO: handle references

    result = result.map(function(arg) {
      if (_.isString(arg)) {
        return this.table[arg].asc;
      } else if (_.isPlainObject(arg)) {
        return objMap(arg, function(field, dir) {
          return this.table[field][dir.toLowerCase()];
        }, this);
      } else {
        return arg;
      }
    }, this);

    return _.flatten(result);
  },

  _reverseSqlOrder: function(orders) {
    if (orders.length === 0) {
      orders = [this.table[this.pk].asc];
    }

    return _.flatten(orders).map(function(order) {
      if (order.desc) {
        return order.desc;
      } else {
        return this.table[order.value.name].asc;
      }
    }, this);
  }
};
