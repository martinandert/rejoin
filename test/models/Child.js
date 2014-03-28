'use strict';

var Rejoin = require('../../');
var Person = require('./Person');

module.exports = Rejoin.createModel('Child', {
  extends: Person
});
