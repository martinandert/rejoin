'use strict';

var _     = require('lodash-node');
var debug = require('debug')('rejoin:query');

var singletonMethods = {
  findBySQL: function(sql, cb) {
    var self  = this;

    this.query(sql, function(err, result) {
      var records = [];
      var error   = false;
      var lock;

      if (err) { cb(err); return; }

      lock = result.rows.length;

      if (lock > 0) {
        for (var i = 0, ii = lock; i < ii; i++) {
          if (error) {
            break;
          }

          self.instantiate(result.rows[i], done);
        }
      } else {
        cb(null, []);
      }

      function done(err, record) {
        if (err && !error) {
          error = true;
          cb(err);
        } else {
          records.push(record);
          lock--;

          if (lock === 0) {
            cb(null, records);
          }
        }
      }
    });
  },

  countBySQL: function(sql, cb) {
    this.query(sql, function(err, result) {
      if (err) { cb(err); return; }

      var row   = result.rows[0];
      var alias = result.fields[0].name;
      var count = row[alias];

      cb(null, parseInt(count, 10));
    });
  },

  query: function(sql, cb) {
    debug('%s: %s', this.name, sql.toString());

    var qry = _.isString(sql) ? { text: sql, values: [] } : sql.toQuery();
    var db  = process.__rejoin_DB;

    db.query(qry.text, qry.values, cb);
  }
};

var METHODS = [
  'select', 'distinct', 'unique', 'limit', 'offset', 'order', 'reorder',
  'reverseOrder', 'group', 'where', 'whereNot', 'having', 'find', 'take',
  'findBy', 'first', 'last', 'count', 'average', 'minimum', 'maximum',
  'sum', 'pluck', 'ids'
];

METHODS.forEach(function(method) {
  singletonMethods[method] = function() {
    var relation = this.all();
    return relation[method].apply(relation, arguments);
  };
});

function QueryingMixin(model) {
  model.classMethods(singletonMethods);
}

module.exports = QueryingMixin;
