'use strict';

var _         = require('lodash-node');
var Inflector = require('inflected');
var sliced    = require('sliced');
var partition = require('../utils/partition');
var isPresent = require('../utils/isPresent');

var MULTI_VALUE_METHODS   = ['includes', 'eager_load', 'preload', 'select', 'group', 'order', 'joins', 'where', 'having', 'bind', 'references', 'extending', 'unscope'];
var SINGLE_VALUE_METHODS  = ['limit', 'offset', 'lock', 'readonly', 'from', 'reordering', 'reverse_order', 'distinct', 'create_with', 'uniq', 'subquery'];

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

Merger.prototype.merge = function() {
  NORMAL_METHODS.forEach(function(method) {
    var value = this.values[method];

    if (typeof this.relation[method] === 'function' && isPresent(value)) {
      this.relation[method].apply(this.relation, value);
    }
  }, this);

  this._mergeMultiValues();
  this._mergeSingleValues();
  this._mergeJoins();

  return this.relation;
};

Merger.prototype._mergeMultiValues = function() {
  var lhsWheres = this.relation.getWhereValues();
  var rhsWheres = this.values.where || [];

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

  if (isPresent(this.values.create_with)) {
    this.relation.setCreateWithValue(_.defaults({}, this.values.create_with, this.relation.getCreateWithValue() || {}));
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

  var seen = _.uniq(nodes.map(function(node) { return node.left; }));

  return partition(lhsWheres, function(node) {
    return node.operator === '=' && seen.indexOf(node.left) > -1;
  });
};



function HashMerger(relation, hash) {
  // TODO: assert all keys of hash are in MULTI_VALUE_METHODS + SINGLE_VALUE_METHODS
  this.relation = relation;
  this.hash     = hash;
}

HashMerger.prototype.merge = function() {
  var merger = new Merger(this.relation, this._getOther());
  return merger.merge();
};

HashMerger.prototype._getOther = function() {
  var other = new this.relation.constructor(this.relation.model, this.relation.table);

  _.forOwn(this.hash, function(value, key) {
    other[key].apply(other, value);
  });

  return other;
};



methods.merge = function(other) {
  var merger;

  if (typeof other === 'function' && !(other instanceof this.constructor)) {
    return other.call(this);
  } else if (other instanceof this.constructor) {
    merger = new Merger(this, other);
    return merger.merge();
  } else if (_.isPlainObject(other)) {
    merger = new HashMerger(this, other);
    return merger.merge();
  } else {
    return this;
  }
};

methods.except = function() {
  var skips = sliced(arguments);

  return this._relationWith(_.without(this.values, skips));
};

methods._relationWith = function(values) {
  return new this.constructor(this.model, this.table, values);
};

module.exports = methods;
