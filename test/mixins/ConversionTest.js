'use strict';

var assert  = require('assert');
var Rejoin  = require('../../');
var Contact = require('../models/Contact');

var SubContact = Rejoin.createModel('SubContact', Contact, function(model) {
  model.instanceMethods({
    isPersisted: function() {
      return true;
    }
  });
});

suite('conversion mixin', function() {
  test('toKey default implementation returns null for new records', function(done) {
    Contact.new(function(err, record) {
      assert.strictEqual(record.toKey(), null);
      done();
    });
  });

  test('toKey default implementation returns the id in an array for persisted records', function(done) {
    Contact.new({ id: 1 }, function(err, record) {
      assert.deepEqual(record.toKey(), [1]);
      done();
    });
  });

  test('toParam default implementation returns null for new records', function(done) {
    Contact.new(function(err, record) {
      assert.strictEqual(record.toParam(), null);
      done();
    });
  });

  test('toParam default implementation returns a string of ids for persisted records', function(done) {
    Contact.new({ id: 1 }, function(err, record) {
      assert.strictEqual(record.toParam(), '1');
      done();
    });
  });

  test('toParam returns null if toKey is null', function(done) {
    SubContact.new(function(err, record) {
      assert.strictEqual(record.toParam(), null);
      done();
    });
  });
});
