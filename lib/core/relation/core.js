'use strict';

var extend    = require('extend');
var unique    = require('../../utils/unique');
var blank     = require('../../utils/blank');
var isString  = require('../../utils/isString');

module.exports = {
  clone: function() {
    var Relation = this.constructor;
    var cloned = new Relation(this.model, this.table, extend({}, this.values));
    return cloned.reset();
  },

  spawn: function() {
    return this.clone();
  },

  reset: function() {
    return this;
  },

  scoping: function(fn) {
    var previous = this.model.getCurrentScope();
    this.model.setCurrentScope(this);
    var result = fn.call(this);
    this.model.setCurrentScope(previous);
    return result;
  },

  unscoped: function() {
    return this.model._getRelation();
  },

  getScopeForCreate: function() {
    // TODO: whereValuesHash is not implemented yet
    return this.whereValuesHash.merge(this.getCreateWithValue());
  },

  toSQL: function() {
    return this.buildSQL();
  },

  inspect: function() {
    return '#<' + this.constructor.name + ' query: ' + this.toSQL().toString() + '>';
  },

  fetch: function(cb) {
    this.model.findBySQL(this.toSQL(), function(err, records) {
      if (err) {
        cb(err);
      } else {
        // TODO: load associations and stuff
        cb(null, records);
      }
    });
  },

  buildSQL: function() {
    var sql = this._buildSelect();

    if (this.getWhereValues().length) {
      sql.where.apply(sql, this.getWhereValues());
    }

    this._buildGroup(sql);

    if (this.getHavingValues().length) {
      sql.having.apply(sql, this.getHavingValues());
    }

    this._buildOrder(sql);

    if (this.getLimitValue()) {
      sql.limit(this._sanitizeLimit(this.getLimitValue()));
    }

    if (this.getOffsetValue()) {
      sql.offset(parseInt(this.getOffsetValue(), 10));
    }

    return sql;
  },

  _buildSelect: function() {
    var fields   = unique(this.getSelectValues());
    var distinct = this.getDistinctValue();
    var table    = this.table;

    var selects = fields.map(function(field) {
      var select = isString(field) && this.table.hasColumn(field) ? this.table[field] : field;

      if (distinct) {
        select = select.distinct();
      }

      return select;
    }, this);

    if (this.getSubqueryValue()) {
      table = table.subQuery(this.getSubqueryValue());
    }

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

    orders = orders.filter(function(order) { return !blank(order); });

    if (this.getReverseOrderValue()) {
      orders = this._reverseSqlOrder(orders);
    }

    if (orders.length) {
      builder.order.apply(builder, orders);
    }
  }
};
