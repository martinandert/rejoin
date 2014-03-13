'use strict';

module.exports = {

};

/*
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
