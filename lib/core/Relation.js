'use strict';

var extend  = require('extend');
var slice   = Array.prototype.slice;
var flatten = require('../utils/flatten');
var compact = require('../utils/compact');
var unique  = require('../utils/uniq');

function Relation(model, table, values) {
  this.model    = model;
  this.table    = table;
  this.values   = values || {};
  this.offsets  = {};
  this.loaded   = false;

  this.primaryKey = model.getPrimaryKey();
}

extend(Relation.prototype, {
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
  }
});

module.exports = Relation;
