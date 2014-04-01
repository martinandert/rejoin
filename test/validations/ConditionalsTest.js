'use strict';

var assert  = require('assert');
var Topic   = require('../models/Topic');

suite('validation conditionals', function() {
  teardown(function() {
    Topic.clearValidations();
  });

  test('test if validation using method true', function(done) {
    Topic.validatesLengthOf('title', { maximum: 5, tooLong: 'hoo %(count)s', if: 'getConditionIsTrue' });

    Topic.new({ title: 'uhohuhoh', content: 'whatever' }, function(err, topic) {
      if (err) { done(err); return; }

      topic.validate(function(err, valid) {
        if (err) { done(err); return; }

        assert(!valid);
        assert(topic.getErrors().get('title').length > 0);
        assert.deepEqual(['hoo 5'], topic.getErrors().get('title'));

        done();
      });
    });
  });

  test('test unless validation using method true', function(done) {
    Topic.validatesLengthOf('title', { maximum: 5, tooLong: 'hoo %(count)s', unless: 'getConditionIsTrue' });

    Topic.new({ title: 'uhohuhoh', content: 'whatever' }, function(err, topic) {
      if (err) { done(err); return; }

      topic.validate(function(err, valid) {
        if (err) { done(err); return; }

        assert(valid);
        assert(topic.getErrors().get('title').length === 0);

        done();
      });
    });
  });

  test('test if validation using method false', function(done) {
    Topic.validatesLengthOf('title', { maximum: 5, tooLong: 'hoo %(count)s', if: 'getConditionIsTrueButItsNot' });

    Topic.new({ title: 'uhohuhoh', content: 'whatever' }, function(err, topic) {
      if (err) { done(err); return; }

      topic.validate(function(err, valid) {
        if (err) { done(err); return; }

        assert(valid);
        assert(topic.getErrors().get('title').length === 0);

        done();
      });
    });
  });

  test('test unless validation using method false', function(done) {
    Topic.validatesLengthOf('title', { maximum: 5, tooLong: 'hoo %(count)s', unless: 'getConditionIsTrueButItsNot' });

    Topic.new({ title: 'uhohuhoh', content: 'whatever' }, function(err, topic) {
      if (err) { done(err); return; }

      topic.validate(function(err, valid) {
        if (err) { done(err); return; }

        assert(!valid);
        assert(topic.getErrors().get('title').length > 0);
        assert.deepEqual(['hoo 5'], topic.getErrors().get('title'));

        done();
      });
    });
  });

  test('test if validation using function true', function(done) {
    Topic.validatesLengthOf('title', { maximum: 5, tooLong: 'hoo %(count)s', if: function(topic) { return topic.getContent().length > 4; } });

    Topic.new({ title: 'uhohuhoh', content: 'whatever' }, function(err, topic) {
      if (err) { done(err); return; }

      topic.validate(function(err, valid) {
        if (err) { done(err); return; }

        assert(!valid);
        assert(topic.getErrors().get('title').length > 0);
        assert.deepEqual(['hoo 5'], topic.getErrors().get('title'));

        done();
      });
    });
  });

  test('test unless validation using function true', function(done) {
    Topic.validatesLengthOf('title', { maximum: 5, tooLong: 'hoo %(count)s', unless: function(topic) { return topic.getContent().length > 4; } });

    Topic.new({ title: 'uhohuhoh', content: 'whatever' }, function(err, topic) {
      if (err) { done(err); return; }

      topic.validate(function(err, valid) {
        if (err) { done(err); return; }

        assert(valid);
        assert(topic.getErrors().get('title').length === 0);

        done();
      });
    });
  });

  test('test if validation using function false', function(done) {
    Topic.validatesLengthOf('title', { maximum: 5, tooLong: 'hoo %(count)s', if: function(topic) { return topic.getTitle() !== 'uhohuhoh'; } });

    Topic.new({ title: 'uhohuhoh', content: 'whatever' }, function(err, topic) {
      if (err) { done(err); return; }

      topic.validate(function(err, valid) {
        if (err) { done(err); return; }

        assert(valid);
        assert(topic.getErrors().get('title').length === 0);

        done();
      });
    });
  });

  test('test unless validation using function false', function(done) {
    Topic.validatesLengthOf('title', { maximum: 5, tooLong: 'hoo %(count)s', unless: function(topic) { return topic.getTitle() !== 'uhohuhoh'; } });

    Topic.new({ title: 'uhohuhoh', content: 'whatever' }, function(err, topic) {
      if (err) { done(err); return; }

      topic.validate(function(err, valid) {
        if (err) { done(err); return; }

        assert(!valid);
        assert(topic.getErrors().get('title').length > 0);
        assert.deepEqual(['hoo 5'], topic.getErrors().get('title'));

        done();
      });
    });
  });
});
