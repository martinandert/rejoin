'use strict';

var extend = require('extend');

function Relation(model, table, values) {
  this.model    = model;
  this.table    = table;
  this.values   = values || {};
  this.offsets  = {};
  this.loaded   = false;

  this.primaryKey = model.getPrimaryKey();
}

Relation.prototype.constructor = Relation;

extend(Relation.prototype, require('./relation/core'));
extend(Relation.prototype, require('./relation/values'));
extend(Relation.prototype, require('./relation/query'));
extend(Relation.prototype, require('./relation/finder'));
extend(Relation.prototype, require('./relation/predicate'));

module.exports = Relation;
