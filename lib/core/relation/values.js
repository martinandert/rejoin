'use strict';

var Inflector     = require('inflected');
var extend        = require('extend');
var blank         = require('../../utils/blank');
var unique        = require('../../utils/unique');
var partition     = require('../../utils/partition');
var objEach       = require('../../utils/objEach');
var isPlainObject = require('../../utils/isPlainObject');

var MULTI_VALUE_METHODS   = ['includes', 'eager_load', 'preload', 'select', 'group', 'order', 'joins', 'where', 'having', 'bind', 'references', 'extending', 'unscope'];
var SINGLE_VALUE_METHODS  = ['limit', 'offset', 'lock', 'readonly', 'from', 'reordering', 'reverse_order', 'distinct', 'create_with', 'uniq'];

var methods = {};

MULTI_VALUE_METHODS.forEach(function(method) {
  var name = Inflector.camelize(method + '_values');

  methods['get' + name] = function(values) {
    if (typeof this.values[method] === 'undefined') {
      this.values[method] = [];
    }

    return this.values[method];
  };

  methods['set' + name] = function(values) {
    if (this.loaded) {
      throw new Error('a loaded relation is immutable');
    }

    this.values[method] = values;
    return this.values[method];
  };
});

SINGLE_VALUE_METHODS.forEach(function(method) {
  var name = Inflector.camelize(method + '_value');

  if (method !== 'create_with') {
    methods['get' + name] = function(values) {
      return this.values[method];
    };
  }

  methods['set' + name] = function(values) {
    if (this.loaded) {
      throw new Error('a loaded relation is immutable');
    }

    this.values[method] = values;
    return this.values[method];
  };
});

var NORMAL_METHODS = ['includes', 'eager_load', 'preload', 'select', 'group', 'having', 'references', 'extending', 'unscope', 'limit', 'offset', 'readonly', 'distinct', 'uniq'];

function Merger(relation, other) {
  this.relation = relation;
  this.values   = other.values;
  this.other    = other;
}

Merger.prototype.constructor = Merger;

Merger.prototype.merge = function() {
  NORMAL_METHODS.forEach(function(method) {
    var value = this.values[method];

    if (typeof this.relation[method] === 'function' && !blank(value)) {
      this.relation[method].apply(this.relation, value);
    }
  });

  this._mergeMultiValues();
  this._mergeSingleValues();
  this._mergeJoins();

  return this.relation;
};

Merger.prototype._mergeMultiValues = function() {
  var lhsWheres = this.relation.getWhereValues();
  var rhsWheres = this.values.where | [];

  var parted  = this._partitionOverwrites(lhsWheres, rhsWheres);
  var kept    = parted[1];

  var whereValues = kept.concat(rhsWheres);

  this.relation.setWhereValues(whereValues);

  if (this.values.reordering) {
    this.relation.reorder(this.values.order);
  } else if (this.values.order) {
    this.relation.order(this.values.order);
  }
};

Merger.prototype._mergeSingleValues = function() {
  if (!this.relation.getFromValue()) {
    this.relation.setFromValue(this.values.from);
  }

  if (!this.relation.getLockValue()) {
    this.relation.setLockValue(this.values.lock);
  }

  this.relation.setReverseOrderValue(this.values.reverse_order);

  if (!blank(this.values.create_with)) {
    this.relation.setCreateWithValue(extend({}, this.relation.getCreateWithValue() || {}, this.values.create_with));
  }
};

Merger.prototype._mergeJoins = function() {
  // TODO
};

Merger.prototype._partitionOverwrites = function(lhsWheres, rhsWheres) {
  if (lhsWheres.length === 0 ||rhsWheres.length === 0) {
    return [[], lhsWheres];
  }

  var nodes = rhsWheres.filter(function(node) {
    return node.operator === '=';
  });

  var seen = unique(nodes.map(function(node) { return node.left; }));

  return partition(lhsWheres, function(node) {
    return node.operator === '=' && seen.indexOf(node.left) > -1;
  });
};



function HashMerger(relation, hash) {
  // TODO: assert all keys of hash are in MULTI_VALUE_METHODS + SINGLE_VALUE_METHODS
  this.relation = relation;
  this.hash     = hash;
}

HashMerger.prototype.constructor = HashMerger;

HashMerger.prototype.merge = function() {
  var merger = new Merger(this.relation, this._getOther());
  return merger.merge();
};

HashMerger.prototype._getOther = function() {
  var other = new this.relation.constructor(this.relation.model, this.relation.table);

  objEach(this.hash, function(key, value) {
    other[key].apply(other, value);
  });

  return other;
};



methods.merge = function(other) {
  var merger;

  if (typeof other === 'function' && !(other instanceof this.constructor)) {
    return other.call(this);
  } else if (isPlainObject(other)) {
    merger = new HashMerger(this, other);
    return merger.merge();
  } else {
    merger = new Merger(this, other);
    return merger.merge();
  }
};

module.exports = methods;
