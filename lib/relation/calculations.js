'use strict';

var _       = require('lodash-node');
var sliced  = require('sliced');
var isBlank = require('../utils/isBlank');

module.exports = {
  count: function(columnName, cb) {
    if (_.isFunction(columnName)) {
      cb          = columnName;
      columnName  = null;
    }

    this.calculate('count', columnName, cb);
  },

  average: function(columnName, cb) {
    this.calculate('avg', columnName, cb);
  },

  minimum: function(columnName, cb) {
    this.calculate('min', columnName, cb);
  },

  maximum: function(columnName, cb) {
    this.calculate('max', columnName, cb);
  },

  sum: function(columnName, cb) {
    this.calculate('sum', columnName, cb);
  },

  calculate: function(operation, columnName, cb) {
    // TODO: handle associations
    this._performCalculation(operation, columnName, cb);
  },

  pluck: function() {
    var args      = sliced(arguments);
    var cb        = args.pop();
    var fields    = _.uniq(_.compact(_.flatten(args)));
    var relation  = this;

    // TODO: handle associations

    relation.setSelectValues(fields);

    this.model.query(relation.toSQL(), function(err, result) {
      if (err) { cb(err); return; }

      var columns = result.rows.map(function(row) {
        return fields.reduce(function(items, field) {
          return items.concat(row[field]);
        }, []);
      });

      if (fields.length === 1) {
        columns = columns.map(function(column) { return column[0]; });
      }

      cb(null, columns);
    });
  },

  ids: function(cb) {
    this.pluck(this.pk, cb);
  },

  _performCalculation: function(operation, columnName, cb) {
    operation = operation.toLowerCase();

    var distinct = this.getDistinctValue();

    if (operation === 'count') {
      columnName = columnName || this._getSelectForCount();

      // TODO: handle joins
      //distinct = false;

      if (columnName === '*' && distinct) {
        columnName = this.pk;
      }

      if (/\s*DISTINCT[\s(]+/i.test(columnName)) {
        distinct = null;
      }
    }

    if (isBlank(this.getGroupValues())) {
      this._executeSimpleCalculation(operation, columnName, distinct, cb);
    } else {
      this._executeGroupedCalculation(operation, columnName, distinct, cb);
    }
  },

  _executeSimpleCalculation: function(operation, columnName, distinct, cb) {
    var relation  = this.reorder(null);
    var limit     = relation.getLimitValue();
    var offset    = relation.getOffsetValue();
    var alias     = null;
    var sql;

    if (operation === 'count' && (_.isNumber(limit) || _.isNumber(offset))) {
      if (limit === 0) {
        process.nextTick(function() { cb(null, 0); });
        return;
      }

      sql = this._buildCountSubquery(relation, columnName, distinct);
    } else {
      var column = this._getAggregateColumn(columnName);
      var selectValue = this._getOperationOverAggregateColumn(column, operation, distinct);
      alias = selectValue.alias;
      relation.setSelectValues([selectValue]);

      sql = relation.toSQL();
    }

    this.model.query(sql, function(err, result) {
      if (err) { cb(err); return; }

      var row   = result.rows[0];
      var value = row[alias || operation];

      cb(null, Number(value));
    });
  },

  _executeGroupedCalculation: function(operation, columnName, distinct, cb) {
    // TODO: handle associations

    function getGroupAlias(field) {
      return field.replace(/[^a-z0-9]/g, '_');
    }

    var groupFields = this.getGroupValues();
    var groupAliases = groupFields.map(getGroupAlias);

    var group = groupFields;
    var aggregateAlias;

    if (operation === 'count' && columnName === '*') {
      aggregateAlias = 'count_all';
    } else {
      aggregateAlias = getGroupAlias(operation + '_' + columnName);
    }

    var selectValues = [this._getOperationOverAggregateColumn(this._getAggregateColumn(columnName), operation, distinct).as(aggregateAlias)];

    if (!isBlank(this.getHavingValues())) {
      selectValues = selectValues.concat(selectValues);
    }

    selectValues = selectValues.concat(_.zip(groupFields, groupAliases).map(function(pair) {
      var field = pair[0];
      var alias = pair[1];

      if (field.as) {
        return field.as(alias);
      } else {
        return this.table[field].as(alias);
      }
    }, this));

    var relation = this.except('group');
    relation.setGroupValues(group);
    relation.setSelectValues(selectValues);

    this.model.query(relation.toSQL(), function(err, result) {
      if (err) { cb(err); return; }

      // TODO: handle associations

      var counts = {};

      result.rows.map(function(row) {
        var key = groupAliases.map(function(alias) {
          return row[alias];
        });

        if (key.length === 1) {
          key = key[0];
        }

        counts[key] = Number(row[aggregateAlias]);
      });

      cb(null, counts);
    });
  },

  _getSelectForCount: function() {
    if (isBlank(this.getSelectValues())) {
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
      return columnName;
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
  },

  _buildCountSubquery: function(relation, columnName, distinct) {
    var columnAlias   = 'count_column';
    var subqueryAlias = 'subquery_for_count';
    var aliasedColumn;

    if (columnName === '*') {
      aliasedColumn = '1 AS ' + columnAlias;
    } else {
      aliasedColumn = this._getAggregateColumn(columnName).as(columnAlias);
    }

    relation.setSelectValues([aliasedColumn]);
    relation.setSubqueryValue(subqueryAlias);

    var subquery = relation.toSQL();
    var selectValue = columnAlias;

    if (distinct) {
      selectValue = 'DISTINCT(' + selectValue + ')';
    }

    selectValue = 'COUNT(' + selectValue + ')';

    return this.table.select(selectValue).from(subquery);
  }
};
