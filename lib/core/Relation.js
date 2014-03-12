'use strict';

var extend    = require('extend');
var slice     = Array.prototype.slice;
var flatten   = require('../utils/flatten');
var compact   = require('../utils/compact');
var unique    = require('../utils/unique');
var blank     = require('../utils/blank');
var isString  = require('../utils/isString');

function Relation(model, table, values) {
  this.model    = model;
  this.table    = table;
  this.values   = values || {};
  this.offsets  = {};
  this.loaded   = false;

  this.primaryKey = model.getPrimaryKey();
}

extend(Relation.prototype, {
  clone: function() {
    var cloned = new Relation();

    cloned.model      = this.model;
    cloned.table      = this.table;
    cloned.values     = this.values;
    cloned.offsets    = this.offsets;
    cloned.loaded     = this.loaded;
    cloned.primaryKey = this.primaryKey;

    return cloned;
  },

  spawn: function() {
    return this.clone();
  },

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

  limit: function(value) {
    return this.table.limit(value);
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
  },

  where: function() {
    var args = slice.call(arguments);
    var opts = args[0];

    if (opts === 'chain') {
      return new WhereChain(this.spawn());
    } else if (blank(opts)) {
      return this;
    } else {
      var spawned = spawn();
      return spawned._where.apply(spawned, arguments);
    }
  },

  _where: function() {
    var args = slice.call(arguments);
    var opts = args[0];

    if (opts === 'chain') {
      return new WhereChain(this);
    } else {
      //if (isPlainObject(opts)) {
      //  this._references(PredicateBuilder.references(opts));
      //}

      this.whereValues.push(this._buildWhere(opts, args.slice(1)));
      return this;
    }
  },

  _buildWhere: function(opts, other) {
    other = other || [];

    if (isString(opts) || Array.isArray(opts)) {
      // TODO
    } else if (isPlainObject(opts)) {
      // TODO
    } else {
      return [opts];
    }
  }
});

module.exports = Relation;
