'use strict';

var Inflector     = require('inflected');
var extend        = require('extend');
var slice         = Array.prototype.slice;
var flatten       = require('../utils/flatten');
var compact       = require('../utils/compact');
var unique        = require('../utils/unique');
var blank         = require('../utils/blank');
var isString      = require('../utils/isString');
var isNumber      = require('../utils/isNumber');
var isPlainObject = require('../utils/isPlainObject');
var objEach       = require('../utils/objEach');
var objMap        = require('../utils/objMap');

var MULTI_VALUE_METHODS   = ['includes', 'eager_load', 'preload', 'select', 'group', 'order', 'joins', 'where', 'having', 'bind', 'references', 'extending', 'unscope'];
var SINGLE_VALUE_METHODS  = ['limit', 'offset', 'lock', 'readonly', 'from', 'reordering', 'reverse_order', 'distinct', 'create_with', 'uniq'];
var VALUE_METHODS         = MULTI_VALUE_METHODS.concat(SINGLE_VALUE_METHODS);
var VALID_DIRECTIONS      = ['asc', 'desc', 'ASC', 'DESC'];

function buildPredicatesFromHash(model, attributes, defaultTable) {
  var queries = [];

  objEach(attributes, function(column, value) {
    var table = defaultTable;

    // TODO: handle value is plain object
    if (!isPlainObject(value)) {
      // TODO: handle other table references
      queries = queries.concat(expandPredicate(model, table, column, value));
    }
  });

  return queries;
}

function expandPredicate(model, table, column, value) {
  var queries = [];

  // TODO: handle polymorphic associations
  queries.push(buildPredicate(table[column], value));

  return queries;
}

function buildPredicate(attribute, value) {
  if (Array.isArray(value)) {
    // TODO
  } else if (value instanceof Relation) {
    // TODO
  } else if (typeof value.getID === 'function') {
    return attribute.equals(value.getID());
  } else if (typeof value.name === 'string') {
    return attribute.equals(value.name);
  } else {
    return attribute.equals(value);
  }
}

function Relation(model, table, values) {
  this.model    = model;
  this.table    = table;
  this.values   = values || {};
  this.offsets  = {};
  this.loaded   = false;

  this.primaryKey = model.getPrimaryKey();
}

MULTI_VALUE_METHODS.forEach(function(method) {
  var name = Inflector.camelize(method + '_values');

  Relation.prototype['get' + name] = function(values) {
    if (typeof this.values[method] === 'undefined') {
      this.values[method] = [];
    }

    return this.values[method];
  };

  Relation.prototype['set' + name] = function(values) {
    if (this.loaded) {
      throw new Error('a loaded relation is immutable');
    }

    this.values[method] = values;
    return this.values[method];
  };
});

SINGLE_VALUE_METHODS.forEach(function(method) {
  var name = Inflector.camelize(method + '_value');

  if (method !== 'create_with') {
    Relation.prototype['get' + name] = function(values) {
      return this.values[method];
    };
  }

  Relation.prototype['set' + name] = function(values) {
    if (this.loaded) {
      throw new Error('a loaded relation is immutable');
    }

    this.values[method] = values;
    return this.values[method];
  };
});

extend(Relation.prototype, {
  clone: function() {
    var cloned = new Relation(this.model, this.table, extend({}, this.values));
    return cloned.reset();
  },

  spawn: function() {
    return this.clone();
  },

  reset: function() {
    this._query       = undefined;
    this._sqlBuilder  = undefined;
    this._loaded      = undefined;
    return this;
  },

  toQuery: function() {
    if (typeof this._query === 'undefined') {
      this._query = this.getSqlBuilder().toQuery();
    }

    return this._query;
  },

  fetch: function(cb) {
    this.model.query(this.toQuery(), cb);
  },

  getSqlBuilder: function() {
    if (typeof this._sqlBuilder === 'undefined') {
      this._sqlBuilder = this._constructSqlBuilder();
    }

    return this._sqlBuilder;
  },

  _constructSqlBuilder: function() {
    var builder = this._buildSelect(this.table, unique(this.getSelectValues()));

    if (this.getWhereValues().length) {
      builder.where.apply(builder, this.getWhereValues());
    }

    this._buildGroup(builder);

    if (this.getHavingValues().length) {
      builder.having.apply(builder, this.getHavingValues());
    }

    this._buildOrder(builder);

    if (this.getLimitValue()) {
      builder.limit(this._sanitizeLimit(this.getLimitValue()));
    }

    if (this.getOffsetValue()) {
      builder.offset(parseInt(this.getOffsetValue(), 10));
    }

    return builder;
  },

  _buildSelect: function(table, fields) {
    var distinct = this.getDistinctValue();

    var selects = fields.map(function(field) {
      var select = table[field];

      if (distinct) {
        select = select.distinct();
      }

      return select;
    });

    return table.select.apply(table, selects);
  },

  _buildGroup: function(builder) {
    var groups = unique(this.getGroupValues());
    groups.filter(function(group) { return !blank(group); });

    if (groups.length) {
      groups = groups.map(function(group) { return this.table[group]; }, this);
      builder.group.apply(builder, groups);
    }
  },

  _buildOrder: function(builder) {
    var orders = unique(this.getOrderValues());
    orders.filter(function(order) { return !blank(order); });

    if (this.getReverseOrderValue()) {
      orders = this._reverseSqlOrder(orders);
    }

    if (orders.length) {
      builder.order.apply(builder, orders);
    }
  },

  _buildWhere: function(opts, other) {
    other = other || [];

    if (isString(opts) || Array.isArray(opts)) {
      // TODO
    } else if (isPlainObject(opts)) {
      // TODO: handle aggregations
      var attributes = opts;
      // TODO: handle Relation values

      return buildPredicatesFromHash(this.model, attributes, this.table);
    } else {
      return [opts];
    }
  },

  select: function() {
    var fields = flatten(slice.call(arguments));

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
    var args = slice.call(arguments);
    this._checkIfMethodHasArguments('order', args);
    args = this._preprocessOrderArgs(args);
    this.setOrderValues(this.getOrderValues().concat(args));
    return this;
  },

  reorder: function() {
    var args = slice.call(arguments);
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
    var args = flatten(slice.call(arguments));
    this._checkIfMethodHasArguments('group', args);
    this.setGroupValues(this.getGroupValues().concat(args));
    return this;
  },

  where: function() {
    var args = slice.call(arguments);
    var opts = args[0];

    if (opts === 'chain') {
      return new WhereChain(this);
    } else if (blank(opts)) {
      return this;
    } else {
      // TODO: handle references

      this.setWhereValues(this.getWhereValues().concat(this._buildWhere.apply(this, arguments)));
      return this;
    }
  },

  having: function() {
    var args = slice.call(arguments);
    var opts = args[0];

    if (blank(opts)) {
      return this;
    } else {
      // TODO: handle references

      this.setHavingValues(this.getHavingValues().concat(this._buildWhere.apply(this, arguments)));
      return this;
    }
  },

  _sanitizeLimit: function(value) {
    if (isNumber(value)) {
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
    if (blank(args)) {
      throw new Error('the method ' + method + '() must contain arguments');
    }
  },

  _validateOrderArgs: function(args) {
    for (var i = 0, ii = args.length; i < ii; i++) {
      var arg = args[i];

      if (isPlainObject(arg)) {
        objEach(arg, function(field, dir) {
          if (VALID_DIRECTIONS.indexOf(dir) === -1) {
            throw new Error('direction "' + dir + '" is invalid');
          }
        });
      }
    }
  },

  _preprocessOrderArgs: function(args) {
    var result = flatten(args);

    this._validateOrderArgs(result);

    // TODO: handle references

    result = result.map(function(arg) {
      if (isString(arg)) {
        return this.table[arg].asc;
      } else if (isPlainObject(arg)) {
        return objMap(arg, function(field, dir) {
          return this.table[field][dir.toLowerCase()];
        }, this);
      } else {
        return arg;
      }
    }, this);

    return flatten(result);
  },

  _reverseSqlOrder: function(orders) {
    if (orders.length === 0) {
      orders = [this.table[this.primaryKey].asc];
    }

    return flatten(orders).map(function(order) {
      if (order.desc) {
        return order.desc;
      } else {
        return this.table[order.value.name].asc;
      }
    }, this);
  }




/*,

  find: function() {
    this._findWithIDs.apply(this, arguments);
  },

  _findWithIDs: function() {
    var ids = slice.call(arguments);
    var cb  = ids.pop();

    if (!this.primaryKey) {
      cb(new Error(this.model.name + ' has no primary key defined'));
    }

    ids = unique(compact(flatten(ids)));

    switch (ids.length) {
      case 0:
        cb(new Error('could not find ' + this.model.name + ' without an ID'));
        break;

      case 1:
        this._findOne(ids[0], cb);
        break;

      default:
        this._findSome(ids, cb);
        break;
    }
  },

  _findOne: function(id, cb) {
    if (id.getID) {
      id = id.getID();
    }

    this.where(this.table[this.primaryKey].equals(id)).take(function(err, record) {
      if (err) {
        cb(err);
      } else if (record) {
        cb(null, record);
      } else {
        cb(new Error('could not find record with ID=' + id));
      }
    });
  },

  take: function(limit, cb) {
    if (!cb) {
      cb = limit;
      limit = null;
    }

    if (limit) {
      this.limit(limit).toArray(cbWrap);
    } else {
      this._findTake(cbWrap);
    }

    function cbWrap(err, record) {
      if (err) {
        cb(err);
      } else if (record) {
        cb(null, record);
      } else {
        cb(new Error('record not found'));
      }
    }
  },

  _findTake: function(cb) {
    this.limit(1).toArray(cbWrap);

    function cbWrap(err, records) {
      if (err) {
        cb(err);
      } else {
        cb(null, records[0])
      }
    }
  }
  */
});

module.exports = Relation;
