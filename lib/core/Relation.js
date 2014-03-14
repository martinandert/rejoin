'use strict';

var extend = require('extend');

var registry = process.__rejoin_Relations = process.__rejoin_Relations || {};

function Relation(model, table, values) {
  this.model  = model;
  this.table  = table;
  this.values = values || {};
  this.pk     = model.getPrimaryKey();
}

Relation.create = function(model, table, values) {
  var ModelRelation = registry[model.name] = registry[model.name] || createRelationFor(model, table, values);

  return new ModelRelation(model, table, values);
};

extend(Relation.prototype, require('./relation/core'));
extend(Relation.prototype, require('./relation/values'));
extend(Relation.prototype, require('./relation/query'));
extend(Relation.prototype, require('./relation/finder'));
extend(Relation.prototype, require('./relation/predicate'));
extend(Relation.prototype, require('./relation/calculations'));

function createRelationFor(model) {
  var name  = model.name + '_Relation';
  var child = new Function('return function ' + name + '(){ return ' + name + '.__parent.apply(this, arguments); }')(); // jshint ignore:line

  function Prototype() {
    this.constructor = child;
  }

  Prototype.prototype = Relation.prototype;
  child.prototype = new Prototype();
  child.__parent = Relation;

  return child;
}

module.exports = Relation;
