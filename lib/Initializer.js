'use strict';

var _       = require('lodash-node');
var sliced  = require('sliced');
var isBlank = require('./utils/isBlank');

function init() {
  var args = sliced(arguments);
  var dbClientOrUrl = args.shift();
  var db;

  if (isBlank(dbClientOrUrl)) {
    dbClientOrUrl = process.env.DATABASE_URL;
  }

  if (_.isString(dbClientOrUrl)) {
    db = require('any-db').createConnection(dbClientOrUrl);
  } else {
    db = dbClientOrUrl;
  }

  process.__rejoin_DB = db;

  return db;
}

module.exports = {
  init: init
};
