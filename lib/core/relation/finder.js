'use strict';

var Inflector = require('inflected');
var sliced    = require('sliced');
var wrap      = require('../../utils/wrap');
var flatten   = require('../../utils/flatten');
var compact   = require('../../utils/compact');
var unique    = require('../../utils/unique');

module.exports = {
  find: function() {
    this._findWithIDs.apply(this, arguments);
  },

  findBy: function(opts, cb) {
    this.where(opts).take(cb);
  },

  take: function(limit, cb) {
    if (!cb) {
      cb = limit;
      limit = null;
    }

    if (limit) {
      this.limit(limit).fetch(function(err, records) {
        if (err) {
          cb(err);
        } else if (records.length) {
          cb(null, records);
        } else {
          cb(new Error('record not found'));
        }
      });
    } else {
      this._findTake(function(err, record) {
        if (err) {
          cb(err);
        } else if (record) {
          cb(null, record);
        } else {
          cb(new Error('record not found'));
        }
      });
    }
  },

  first: function(limit, cb) {
    if (!cb) {
      cb = limit;
      limit = null;
    }

    if (limit) {
      this._findNthWithLimit(this.getOffsetValue(), limit, cb);
    } else {
      this._findNth('first', this.getOffsetValue(), function(err, record) {
        if (err) {
          cb(err);
        } else if (record) {
          cb(null, record);
        } else {
          cb(new Error('record not found'));
        }
      });
    }
  },

  last: function(limit, cb) {
    if (!cb) {
      cb = limit;
      limit = null;
    }

    if (limit) {
      if (this.getOrderValues().length === 0 && this.pk) {
        this.order(this.table[this.pk].desc).limit(limit).fetch(function(err, records) {
          if (err) {
            cb(err);
          } else {
            cb(null, records.reverse());
          }
        });
      } else {
        this.fetch(function(err, records) {
          if (err) {
            cb(err);
          } else {
            cb(null, records.slice(Math.max(0, records.length - limit)));
          }
        });
      }
    } else {
      this._findLast(function(err, record) {
        if (err) {
          cb(err);
        } else if (record) {
          cb(null, record);
        } else {
          cb(new Error('record not found'));
        }
      });
    }
  },

  _findWithIDs: function() {
    var ids = sliced(arguments);
    var cb  = ids.pop();

    if (!this.pk) {
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
    var self = this;

    if (typeof id.getID === 'function') {
      id = id.getID();
    }

    this.where(this.table[this.pk].equals(id)).take(function(err, record) {
      if (err) {
        cb(err);
      } else if (record) {
        cb(null, record);
      } else {
        cb(self._buildRecordNotFoundError(id, 0, 1));
      }
    });
  },

  _findSome: function(ids, cb) {
    var self = this;

    this.where(this.table[this.pk].in(ids)).fetch(function(err, records) {
      if (err) {
        cb(err);
      } else {
        var limitValue  = self.getLimitValue();
        var offsetValue = self.getOffsetValue();

        var expectedSize = (limitValue && ids.length > limitValue) ? limitValue : ids.length;

        if (offsetValue && ids.length - offsetValue < expectedSize) {
          expectedSize = ids.length - offsetValue;
        }

        if (records.length === expectedSize) {
          cb(null, records);
        } else {
          cb(self._buildRecordNotFoundError(ids, records.length, expectedSize));
        }
      }
    });
  },

  _findTake: function(cb) {
    this.limit(1).fetch(function(err, records) {
      if (err) {
        cb(err);
      } else {
        cb(null, records[0]);
      }
    });
  },

  _buildRecordNotFoundError: function(ids, actual, expected) {
    var message;

    if (wrap(ids).length === 1) {
      message = 'could not find ' + this.model.name + ' with ' + this.pk + '=' + ids;
    } else {
      message = 'couldn not find all ' + Inflector.pluralize(this.model.name) + ' with ' + this.pk + ': ';
      message += '[' + ids.join(', ') + '] (found ' + actual + ' results, but was looking for ' + expected + ')';
    }

    return new Error(message);
  },

  _findNth: function(ordinal, offset, cb) {
    this._findNthWithLimit(offset, 1, function(err, records) {
      if (err) {
        cb(err);
      } else {
        cb(null, records[0]);
      }
    });
  },

  _findNthWithLimit: function(offset, limit, cb) {
    if (this.getOrderValues().length === 0 && this.pk) {
      this.order(this.table[this.pk].asc).limit(limit).offset(offset).fetch(cb);
    } else {
      this.limit(limit).offset(offset).fetch(cb);
    }
  },

  _findLast: function(cb) {
    if (this.getLimitValue()) {
      this.fetch(function(err, records) {
        if (err) {
          cb(err);
        } else {
          cb(null, records[records.length - 1]);
        }
      });
    } else {
      this.reverseOrder().limit(1).fetch(function(err, records) {
        if (err) {
          cb(err);
        } else {
          cb(null, records[0]);
        }
      });
    }
  }
};
