'use strict';

var assert  = require('assert');
var Topic   = require('../models/Topic');
var _       = require('lodash-node');

suite('presence validator', function() {
  teardown(function() {
    Topic.clearValidations();
  });

  test('validate presences', function(done) {
    Topic.validatesPresenceOf('title', 'content');

    Topic.new(function(err, topic) {
      if (err) { done(err); return; }

      topic.validate(function(err, valid) {
        if (err) { done(err); return; }

        assert.strictEqual(false, valid);

        assert.deepEqual(['cannot be blank'], topic.getErrors().get('title'));
        assert.deepEqual(['cannot be blank'], topic.getErrors().get('content'));

        topic.setTitle('something');
        topic.setContent('    ');

        topic.validate(function(err, valid) {
          if (err) { done(err); return; }

          assert.strictEqual(false, valid);

          assert.deepEqual(['cannot be blank'], topic.getErrors().get('content'));

          topic.setContent('like stuff');

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
    Topic.validatesPresenceOf(['title', 'content']);

    Topic.new(function(err, topic) {
      if (err) { done(err); return; }

      topic.validate(function(err, valid) {
        if (err) { done(err); return; }

        assert.strictEqual(false, valid);

        assert.deepEqual(['cannot be blank'], topic.getErrors().get('title'));
        assert.deepEqual(['cannot be blank'], topic.getErrors().get('content'));

        done();
      });
    });
  });

  test('validates with custom error using quotes', function(done) {
    Topic.validatesPresenceOf('title', { message: 'This string contains \'single\' and "double" quotes' });

    Topic.new(function(err, topic) {
      if (err) { done(err); return; }

      topic.validate(function(err, valid) {
        if (err) { done(err); return; }

        assert(!valid);

        assert.equal('This string contains \'single\' and "double" quotes', _.last(topic.getErrors().get('title')));

        done();
      });
    });
  });

  test('validatesPresenceOf with allowNull option', function(done) {
    Topic.validatesPresenceOf('title', { allowNull: true });

    Topic.new({ title: 'something' }, function(err, topic) {
      if (err) { done(err); return; }

      topic.validate(function(err, valid) {
        if (err) { done(err); return; }

        assert(valid, topic.getErrors().getFullMessages().join(', '));

        topic.setTitle('');

        topic.validate(function(err, valid) {
          if (err) { done(err); return; }

          assert(!valid);
          assert.deepEqual(['cannot be blank'], topic.getErrors().get('title'));

          topic.setTitle('  ');

          topic.validate(function(err, valid) {
            if (err) { done(err); return; }

            assert(!valid);
            assert.deepEqual(['cannot be blank'], topic.getErrors().get('title'));

            topic.setTitle(null);

            topic.validate(function(err, valid) {
              if (err) { done(err); return; }

              assert(valid, topic.getErrors().getFullMessages().join(', '));

              done();
            });
          });
        });
      });
    });
  });

  test('validatesPresenceOf with allowBlank option', function(done) {
    Topic.validatesPresenceOf('title', { allowBlank: true });

    Topic.new({ title: 'something' }, function(err, topic) {
      if (err) { done(err); return; }

      topic.validate(function(err, valid) {
        if (err) { done(err); return; }

        assert(valid, topic.getErrors().getFullMessages().join(', '));

        topic.setTitle('');

        topic.validate(function(err, valid) {
          if (err) { done(err); return; }

          assert(valid, topic.getErrors().getFullMessages().join(', '));

          topic.setTitle('  ');

          topic.validate(function(err, valid) {
            if (err) { done(err); return; }

            assert(valid, topic.getErrors().getFullMessages().join(', '));

            topic.setTitle(null);

            topic.validate(function(err, valid) {
              if (err) { done(err); return; }

              assert(valid, topic.getErrors().getFullMessages().join(', '));

              done();
            });
          });
        });
      });
    });
  });
});
