'use strict';

var assert  = require('assert');
var async   = require('async');
var Topic   = require('../models/Topic');

var NULL = [null];
var BLANK = ['', ' ', ' \t \r \n'];
var JUNK = ['not a number', '42 not a number', '0xdeadbeef', '0xinvalidhex', '0Xdeadbeef', '00-1', '--3', '+-3', '+3-1', '-+019.0', '12.12.13.12', '123\nnot a number'];

var INTEGER_STRINGS = '0 +0 -0 10 +10 -10 0090 -090'.split(/\s+/);
var INTEGERS = [0, 10, -10].concat(INTEGER_STRINGS);

var FLOAT_STRINGS = '0.0 +0.0 -0.0 10.0 10.5 -10.5 -0.0001 -090.1 90.1e1 -90.1e5 -90.1e-5 90e-5'.split(/\s+/);
var FLOATS = [0.01, 10.01, 10.5, -10.5, -0.0001].concat(FLOAT_STRINGS);

var INFINITY = [Infinity];

function checkValid(invalids) {
  return invalids.map(function(value) {
    return function(cb) {
      Topic.new({ title: 'numeric test', content: 'whatever' }, function(err, topic) {
        if (err) { cb(err); return; }

        topic.setApproved(value);

        topic.validate(function(err, valid) {
          if (err) { cb(err); return; }

          assert.strictEqual(true, valid, '"' + String(value) + '" not accepted as a number');

          cb();
        });
      });
    };
  });
}

function checkInvalid(invalids, error) {
  return invalids.map(function(value) {
    return function(cb) {
      Topic.new({ title: 'numeric test', content: 'whatever' }, function(err, topic) {
        if (err) { cb(err); return; }

        topic.setApproved(value);

        topic.validate(function(err, valid) {
          if (err) { cb(err); return; }

          assert.strictEqual(false, valid, '"' + String(value) + '" not rejected as a number');
          assert(topic.getErrors().get('approved').length > 0);

          if (error) {
            assert.equal(error, topic.getErrors().get('approved')[0]);
          }

          cb();
        });
      });
    };
  });
}

suite('numericality validator', function() {
  teardown(function() {
    Topic.clearValidations();
  });

  test('default validatesNumericalityOf', function(done) {
    Topic.validatesNumericalityOf('approved');

    var invalids  = checkInvalid(NULL.concat(BLANK).concat(JUNK), 'is not a number');
    var valids    = checkValid(FLOATS.concat(INTEGERS).concat(INFINITY));

    async.parallel(invalids.concat(valids), done);
  });

  test('validatesNumericalityOf with allowNull', function(done) {
    Topic.validatesNumericalityOf('approved', { allowNull: true });

    var invalids  = checkInvalid(BLANK.concat(JUNK));
    var valids    = checkValid(NULL.concat(FLOATS).concat(INTEGERS).concat(INFINITY));

    async.parallel(invalids.concat(valids), done);
  });

  test('validatesNumericalityOf with onlyInteger', function(done) {
    Topic.validatesNumericalityOf('approved', { onlyInteger: true });

    var invalids  = checkInvalid(NULL.concat(BLANK).concat(JUNK).concat(FLOATS).concat(INFINITY));
    var valids    = checkValid(INTEGERS);

    async.parallel(invalids.concat(valids), done);
  });

  test('validatesNumericalityOf with onlyInteger and allowNull', function(done) {
    Topic.validatesNumericalityOf('approved', { allowNull: true, onlyInteger: true });

    var invalids  = checkInvalid(BLANK.concat(JUNK).concat(FLOATS).concat(INFINITY));
    var valids    = checkValid(NULL.concat(INTEGERS));

    async.parallel(invalids.concat(valids), done);
  });

  test('validatesNumericalityOf with greaterThan', function(done) {
    Topic.validatesNumericalityOf('approved', { greaterThan: 10 });

    var invalids  = checkInvalid([-10, 10], 'must be greater than 10');
    var valids    = checkValid([11]);

    async.parallel(invalids.concat(valids), done);
  });

  test('validatesNumericalityOf with greaterThanOrEqualTo', function(done) {
    Topic.validatesNumericalityOf('approved', { greaterThanOrEqualTo: 10 });

    var invalids  = checkInvalid([-9, 9], 'must be greater than or equal to 10');
    var valids    = checkValid([10]);

    async.parallel(invalids.concat(valids), done);
  });

  test('validatesNumericalityOf with equalTo', function(done) {
    Topic.validatesNumericalityOf('approved', { equalTo: 10 });

    var invalids  = checkInvalid([-10, 11], 'must be equal to 10');
    var valids    = checkValid([10]);

    async.parallel(invalids.concat(valids), done);
  });

  test('validatesNumericalityOf with lessThan', function(done) {
    Topic.validatesNumericalityOf('approved', { lessThan: 10 });

    var invalids  = checkInvalid([10], 'must be less than 10');
    var valids    = checkValid([-9, 9]);

    async.parallel(invalids.concat(valids), done);
  });

  test('validatesNumericalityOf with lessThanOrEqualTo', function(done) {
    Topic.validatesNumericalityOf('approved', { lessThanOrEqualTo: 10 });

    var invalids  = checkInvalid([11], 'must be less than or equal to 10');
    var valids    = checkValid([-10, 10]);

    async.parallel(invalids.concat(valids), done);
  });

  test('validatesNumericalityOf with odd', function(done) {
    Topic.validatesNumericalityOf('approved', { odd: true });

    var invalids  = checkInvalid([0, -2, 2, -4, 4], 'must be odd');
    var valids    = checkValid([-1, 1, -3, 3]);

    async.parallel(invalids.concat(valids), done);
  });

  test('validatesNumericalityOf with even', function(done) {
    Topic.validatesNumericalityOf('approved', { even: true });

    var invalids  = checkInvalid([-1, 1, -3, 3], 'must be even');
    var valids    = checkValid([0, -2, 2, -4, 4]);

    async.parallel(invalids.concat(valids), done);
  });

  test('validatesNumericalityOf with greaterThan, lessThan, and even', function(done) {
    Topic.validatesNumericalityOf('approved', { greaterThan: 1, lessThan: 4, even: true });

    var invalids  = checkInvalid([1, 3, 4]);
    var valids    = checkValid([2]);

    async.parallel(invalids.concat(valids), done);
  });

  test('validatesNumericalityOf with other than', function(done) {
    Topic.validatesNumericalityOf('approved', { otherThan: 0 });

    var invalids  = checkInvalid([0, '0.0']);
    var valids    = checkValid([-1, 42]);

    async.parallel(invalids.concat(valids), done);
  });

  test('validatesNumericalityOf with function', function(done) {
    Topic.prototype.minApproved = function() { return 5; };
    Topic.validatesNumericalityOf('approved', { greaterThanOrEqualTo: function(topic) { return topic.minApproved(); } });

    var invalids  = checkInvalid([3, 4]);
    var valids    = checkValid([5, 6]);

    async.parallel(invalids.concat(valids), function(err) {
      delete Topic.prototype.minApproved;
      done(err);
    });
  });

  test('validatesNumericalityOf with lessThan and custom message', function(done) {
    Topic.validatesNumericalityOf('approved', { lessThan: 4, message: 'smaller than %(count)s' });

    Topic.new({ title: 'numeric test', approved: 10 }, function(err, topic) {
      if (err) { done(err); return; }

      topic.validate(function(err, valid) {
        if (err) { done(err); return; }

        assert(!valid);
        assert.deepEqual(['smaller than 4'], topic.getErrors().get('approved'));

        done();
      });
    });
  });

  test('validatesNumericalityOf with greaterThan and custom message', function(done) {
    Topic.validatesNumericalityOf('approved', { greaterThan: 4, message: 'greater than %(count)s' });

    Topic.new({ title: 'numeric test', approved: 1 }, function(err, topic) {
      if (err) { done(err); return; }

      topic.validate(function(err, valid) {
        if (err) { done(err); return; }

        assert(!valid);
        assert.deepEqual(['greater than 4'], topic.getErrors().get('approved'));

        done();
      });
    });
  });

  test('validatesNumericalityOf with invalid args', function() {
    assert.throws(function() { Topic.validatesNumericalityOf('approved', { greaterThanOrEqualTo: 'foo' });  });
    assert.throws(function() { Topic.validatesNumericalityOf('approved', { lessThanOrEqualTo: 'foo' });     });
    assert.throws(function() { Topic.validatesNumericalityOf('approved', { greaterThan: 'foo' });           });
    assert.throws(function() { Topic.validatesNumericalityOf('approved', { lessThan: 'foo' });              });
    assert.throws(function() { Topic.validatesNumericalityOf('approved', { equalTo: 'foo' });               });
  });
});
