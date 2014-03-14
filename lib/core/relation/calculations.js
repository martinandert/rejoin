'use strict';

var isFunction  = require('../../utils/isFunction');
var blank       = require('../../utils/blank');

module.exports = {
  count: function(columnName, cb) {
    if (isFunction(columnName)) {
      cb          = columnName;
      columnName  = null;
    }

    return this.calculate('count', columnName, cb);
  },

  calculate: function(operation, columnName, cb) {
    // TODO: handle associations
    return this._performCalculation(operation, columnName, cb);
  },

  _performCalculation: function(operation, columnName, cb) {
    operation = operation.toLowerCase();

    var distinct = this.getDistinctValue();

    if (operation === 'count') {
      columnName = columnName || this._getSelectForCount();

      // TODO: handle joins
      distinct = false;

      if (columnName === '*' && distinct) {
        columnName = this.pk;
      }

      if (/\s*DISTINCT[\s(]+/i.test(columnName)) {
        distinct = null;
      }
    }

    if (blank(this.getGroupValues())) {
      return this._executeSimpleCalculation(operation, columnName, distinct, cb);
    } else {
      return this._executeGroupedCalculation(operation, columnName, distinct, cb);
    }
  },

  _executeSimpleCalculation: function(operation, columnName, distinct, cb) {
    var relation  = this.reorder(null);
    var limit     = relation.getLimitValue();
    var offset    = relation.getOffsetValue();
    var alias     = columnName;
    var sql;

    if (operation === 'count' && (!blank(limit) || !blank(offset))) {
      if (limit === 0) {
        process.nextTick(function() { cb(null, 0); });
        return;
      }

      // TODO: not implemented yet
      sql = this._buildCountSubquery(relation, columnName, distinct);
    } else {
      var column = this._getAggregateColumn(columnName);
      var selectValue = this._getOperationOverAggregateColumn(column, operation, distinct);
      alias = selectValue.alias;
      relation.setSelectValues([selectValue]);

      sql = relation.toSQL();
    }

    if (cb) {
      this.model.query(sql, function(err, result) {
        if (err) {
          cb(err);
        } else {
          var row   = result.rows[0];
          var value = row[alias];

          cb(null, Number(value));
        }
      });
    } else {
      return sql.toString();
    }
  },

  _getSelectForCount: function() {
    if (blank(this.getSelectValues())) {
      return '*';
    } else {
      return this.getSelectValues().join(', ');
    }
  },

  _getAggregateColumn: function(columnName) {
    if (columnName === '*') {
      return this.table.star();
    } else if (this.table.hasColumn(columnName)) {
      return this.table[columnName];
    } else {
      this.table.addColumn(columnName);
      return this.table[columnName];
    }
  },

  _getOperationOverAggregateColumn: function(column, operation, distinct) {
    if (operation === 'count') {
      column = column.count();

      if (distinct) {
        column = column.distinct();
      }

      return column;
    } else {
      return column[operation]();
    }
  }
};
