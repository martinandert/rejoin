'use strict';

var db = require('any-db');
var conn = db.createConnection(process.env.DATABASE_URL);

var METHODS = ['select', 'distinct', 'unique', 'limit', 'offset', 'order', 'reorder', 'reverseOrder', 'group', 'where', 'having'];

var singletonMethods = {
  all: function() {
    // TODO: respect scopes
    return this._getRelation();
  },

  query: function(query, cb) {
    var self = this;

    conn.query(query.text, query.values, function(err, result) {
      if (err) {
        cb(err);
      } else {
        cb(null, result.rows.map(function(record) {
          return self.instantiate(record);
        }));
      }
    });
  }
};

METHODS.forEach(function(method) {
  singletonMethods[method] = function() {
    return this.all()[method].apply(this.all(), arguments);
  };
})

module.exports = {
  name: 'Querying',
  singleton: singletonMethods
};
