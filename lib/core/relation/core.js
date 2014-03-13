'use strict';

var extend        = require('extend');
var unique        = require('../../utils/unique');
var blank         = require('../../utils/blank');

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
    this.model.query(this.toQuery(), function(err, records) {
      if (err) {
        cb(err);
      } else {
        // TODO: load associations and stuff
        cb(null, records);
      }
    });
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
  }
};
