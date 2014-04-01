'use strict';

var assert  = require('assert');
var async   = require('async');
var Topic   = require('../models/Topic');

suite('inclusion validator', function() {
  teardown(function() {
    Topic.clearValidations();
  });

  test('default validatesInclusionOf', function(done) {
    Topic.validatesInclusionOf('title', { in: 'a b c d e f g'.split(' ') });

    async.parallel([
      tc({ title: 'a!',   content: 'abc' }, false),
      tc({ title: 'a b',  content: 'abc' }, false),
      tc({ title: null,   content: 'def' }, false)
    ], function(err) {
      if (err) { done(err); return; }

      Topic.new({ title: 'a', content: 'I know you are but what am I?' }, function(err, topic) {
        if (err) { done(err); return; }

        topic.validate(function(err, valid) {
          if (err) { done(err); return; }

          assert.strictEqual(true, valid);

          topic.setTitle('uhoh');

          topic.validate(function(err, valid) {
            if (err) { done(err); return; }

            assert.strictEqual(false, valid);
            assert.deepEqual(topic.getErrors().get('title'), ['is not included in the list']);

            done();
          });
        });
      });
    });

    function tc(attrs, result, message) {
      return function(cb) {
        Topic.new(attrs, function(err, topic) {
          if (err) { cb(err); return; }

          topic.validate(function(err, valid) {
            if (err) { cb(err); return; }

            assert.strictEqual(result, valid);

            cb();
          });
        });
      };
    }
  });

  test('validatesInclusionOf with allowNull', function(done) {
    Topic.validatesInclusionOf('title', { in: 'a b c d e f g'.split(' '), allowNull: true });

    async.parallel([
      tc({ title: 'a!', content: 'abc' }, false),
      tc({ title: '',   content: 'abc' }, false),
      tc({ title: null, content: 'abc' }, true)
    ], done);

    function tc(attrs, result, message) {
      return function(cb) {
        Topic.new(attrs, function(err, topic) {
          if (err) { cb(err); return; }

          topic.validate(function(err, valid) {
            if (err) { cb(err); return; }

            assert.strictEqual(result, valid);

            cb();
          });
        });
      };
    }
  });

  test('validatesInclusionOf with custom message', function(done) {
    Topic.validatesInclusionOf('title', { in: 'a b c d e f g'.split(' '), message: 'option %(value)s is not in the list' });

    Topic.new({ title: 'a', content: 'abc' }, function(err, topic) {
      if (err) { done(err); return; }

      topic.validate(function(err, valid) {
        if (err) { done(err); return; }

        assert(valid);

        topic.setTitle('uhoh');

        topic.validate(function(err, valid) {
          if (err) { done(err); return; }

          assert(!valid);
          assert.deepEqual(topic.getErrors().get('title'), ['option uhoh is not in the list']);

          done();
        });
      });
    });
  });

  test('validatesInclusionOf with within option', function(done) {
    Topic.validatesInclusionOf('title', { within: 'a b c d e f g'.split(' ') });

    Topic.new({ title: 'a', content: 'abc' }, function(err, topic) {
      if (err) { done(err); return; }

      topic.validate(function(err, valid) {
        if (err) { done(err); return; }

        assert(valid);

        topic.setTitle('uhoh');

        topic.validate(function(err, valid) {
          if (err) { done(err); return; }

          assert(!valid);
          assert(topic.getErrors().get('title').length > 0);

          done();
        });
      });
    });
  });

  test('validatesInclusionOf with function', function(done) {
    Topic.validatesInclusionOf('title', { within: function(topic) { return topic.getAuthorName() === 'sikachu' ? ['monkey', 'elephant'] : ['ape', 'wasabi']; } });

    Topic.new(function(err, topic) {
      if (err) { done(err); return; }

      topic.setAuthorName('sikachu');
      topic.setTitle('wasabi');

      topic.validate(function(err, valid) {
        if (err) { done(err); return; }

        assert(!valid);

        topic.setTitle('elephant');

        topic.validate(function(err, valid) {
          if (err) { done(err); return; }

          assert(valid);

          done();
        });
      });
    });
  });

  test('validatesInclusionOf with invalid args', function() {
    assert.throws(function() { Topic.validatesInclusionOf('title');                 });
    assert.throws(function() { Topic.validatesInclusionOf('title', { in: null });   });
    assert.throws(function() { Topic.validatesInclusionOf('title', { in: 0 });      });
    assert.throws(function() { Topic.validatesInclusionOf('title', { in: 'abc' });  });
  });
});
