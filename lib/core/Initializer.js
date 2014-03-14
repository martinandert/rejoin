'use strict';

var sliced    = require('sliced');
var isString  = require('../utils/isString');
var blank     = require('../utils/blank');

function init() {
  var args = sliced(arguments);
  var dbClientOrUrl = args.shift();
  var db;

  if (blank(dbClientOrUrl)) {
    dbClientOrUrl = process.env.DATABASE_URL;
  }

  if (isString(dbClientOrUrl)) {
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
