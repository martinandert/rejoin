'use strict';

var Result  = require('./filters/Result.js');
var Before  = require('./filters/Before.js');
var After   = require('./filters/After.js');
var End     = require('./filters/End.js');

var Filters = {
  Result:   Result,
  Before:   Before,
  After:    After,
  End:      End
};

module.exports = Filters;
