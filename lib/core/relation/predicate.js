'use strict';

var Relation      = require('../Relation');
var isPlainObject = require('../../utils/isPlainObject');
var objEach       = require('../../utils/objEach');
var compact       = require('../../utils/compact');

var BINARY_OPERATIONS = {
  '=':        { op: 'equals',     no: 'notEquals' },
  '<>':       { op: 'notEquals',  no: 'equals'    },
  '!=':       { op: 'notEquals',  no: 'equals'    },
  '>':        { op: 'gt',         no: 'lte'       },
  '<=':       { op: 'lte',        no: 'gt'        },
  '<':        { op: 'lt',         no: 'gte'       },
  '>=':       { op: 'gte',        no: 'lt'        },
  'LIKE':     { op: 'like',       no: 'notLike'   },
  'NOT LIKE': { op: 'notLike',    no: 'like'      }
};

var BINARY_OPERATORS = Object.keys(BINARY_OPERATIONS);

function buildPredicatesFromHash(model, attributes, defaultTable, not) {
  var queries = [];

  objEach(attributes, function(column, value) {
    var table = defaultTable;

    // TODO: handle value is plain object
    if (!isPlainObject(value)) {
      // TODO: handle other table references
      queries = queries.concat(expand(model, table, column, value, not));
    }
  });

  return queries;
}

function expand(model, table, column, value, not) {
  var queries = [];

  // TODO: handle polymorphic associations
  queries.push(build(table[column], value, not));

  return queries;
}

function build(attribute, value, not) {
  if (value === null) {
    return attribute[not ? 'isNotNull' : 'isNull']();
  } else if (Array.isArray(value)) {
    return handleArray(attribute, value, not);
  } else if (typeof value === 'function' && value instanceof Relation) {
    // TODO
  } else if (typeof value.getID === 'function') {
    return attribute[not ? 'notEquals' : 'equals'](value.getID());
  } else if (typeof value.name === 'string') {
    return attribute[not ? 'notEquals' : 'equals'](value.name);
  } else {
    return attribute[not ? 'notEquals' : 'equals'](value);
  }
}

function handleArray(attribute, value, not) {
  var values = value.map(function(val) {
    if (val) {
      if (typeof val.getID === 'function') {
        return val.getID();
      } else if (typeof val.name === 'string') {
        return val.name;
      } else {
        return val;
      }
    } else {
      return val;
    }
  });

  if (values.length === 2 && BINARY_OPERATORS.indexOf(values[0]) > -1) {
    return attribute[BINARY_OPERATIONS[values[0]][not ? 'no' : 'op']](values[1]);
  }

  var node;

  if (values.length === 3) {
    if (values[0] === 'BETWEEN') {
      node = attribute.between(values[1], values[2]);

      if (not) {
        // hack: node-sql has no notBetween ternary method
        node.operator = 'NOT BETWEEN';
      }

      return node;
    } else if (values[0] === 'NOT BETWEEN') {
      node = attribute.between(values[1], values[2]);

      if (!not) {
        node.operator = 'NOT BETWEEN';
      }

      return node;
    }
  }

  var predicate;

  if (values.indexOf(null) > -1) {
    values = compact(values);

    switch (values.length) {
      case 0:
        predicate = attribute[not ? 'isNotNull' : 'isNull']();
        break;

      case 1:
        predicate = not ?
          attribute.notEquals(values[0]).and(attribute.isNotNull()) :
          attribute.equals(values[0]).or(attribute.isNull());
        break;

      default:
        predicate = not ? 
          attribute.notIn(values).and(attribute.isNotNull()) :
          attribute.in(values).or(attribute.isNull());
        break;
    }
  } else {
    switch (values.length) {
      case 0:
        predicate = not ? '1=1' : '1=0';
        break;

      case 1:
        predicate = attribute[not ? 'notEquals' : 'equals'](values[0]);
        break;

      default:
        predicate = attribute[not ? 'notIn' : 'in'](values);
        break;
    }
  }

  return predicate;
}

module.exports = {
  _buildPredicatesFromHash: buildPredicatesFromHash
};
