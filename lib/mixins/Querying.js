'use strict';

var db = require('any-db');
var client = db.createConnection(process.env.DATABASE_URL);

var METHODS = [
  'select', 'distinct', 'unique', 'limit', 'offset', 'order', 'reorder',
  'reverseOrder', 'group', 'where', 'whereNot', 'having', 'find', 'take',
  'findBy', 'first', 'last'
];

var singletonMethods = {
  findBySQL: function(sql, cb) {
    var self = this;

    client.query(sql.text, sql.values, function(err, result) {
      var records = [];
      var error   = false;
      var lock;

      if (err) {
        cb(err);
      } else {
        lock = result.rows.length;

        for (var i = 0, ii = lock; i < ii; i++) {
          if (error) {
            break;
          }

          self.instantiate(result.rows[i], done);
        }
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
  }
};

METHODS.forEach(function(method) {
  singletonMethods[method] = function() {
    var relation = this.all();
    return relation[method].apply(relation, arguments);
  };
});

module.exports = {
  name: 'Querying',
  singleton: singletonMethods
};
