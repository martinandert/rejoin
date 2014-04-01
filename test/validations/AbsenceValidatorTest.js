'use strict';

var assert  = require('assert');
var Topic   = require('../models/Topic');
var _       = require('lodash-node');

suite('absence validator', function() {
  teardown(function() {
    Topic.clearValidations();
  });

  test('validate absences', function(done) {
    Topic.validatesAbsenceOf('title', 'content');

    Topic.new(function(err, topic) {
      if (err) { done(err); return; }

      topic.setTitle('foo');
      topic.setContent('bar');

      topic.validate(function(err, valid) {
        if (err) { done(err); return; }

        assert.strictEqual(false, valid);

        assert.deepEqual(topic.getErrors().get('title'), ['must be blank']);
        assert.deepEqual(topic.getErrors().get('content'), ['must be blank']);

        topic.setTitle('');
        topic.setContent('something');

        topic.validate(function(err, valid) {
          if (err) { done(err); return; }

          assert.strictEqual(false, valid);

          assert.deepEqual(topic.getErrors().get('content'), ['must be blank']);

          topic.setContent('');

          topic.validate(function(err, valid) {
            if (err) { done(err); return; }

            assert.strictEqual(true, valid);

            done();
          });
        });
      });
    });
  });

  test('accepts array arguments', function(done) {
    Topic.validatesAbsenceOf(['title', 'content']);

    Topic.new(function(err, topic) {
      if (err) { done(err); return; }

      topic.setTitle('foo');
      topic.setContent('bar');

      topic.validate(function(err, valid) {
        if (err) { done(err); return; }

        assert.strictEqual(false, valid);

        assert.deepEqual(topic.getErrors().get('title'), ['must be blank']);
        assert.deepEqual(topic.getErrors().get('content'), ['must be blank']);

        done();
      });
    });
  });

  test('validates with custom error using quotes', function(done) {
    Topic.validatesAbsenceOf('title', { message: 'This string contains \'single\' and "double" quotes' });

    Topic.new(function(err, topic) {
      if (err) { done(err); return; }

      topic.setTitle('good');

      topic.validate(function(err, valid) {
        if (err) { done(err); return; }

        assert(!valid);

        assert.equal('This string contains \'single\' and "double" quotes', _.last(topic.getErrors().get('title')));

        done();
      });
    });
  });
});
