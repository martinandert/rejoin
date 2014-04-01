'use strict';

var assert  = require('assert');
var async   = require('async');
var Topic   = require('../models/Topic');

suite('exclusion validator', function() {
  teardown(function() {
    Topic.clearValidations();
  });

  test('default validatesExclusionOf', function(done) {
    Topic.validatesExclusionOf('title', { in: ['ape', 'monkey'] });

    async.parallel([
      tc({ title: 'something', content: 'abc' }, true),
      tc({ title: 'monkey',    content: 'abc' }, false)
    ], done);

    function tc(attrs, result, message) {
      return function(cb) {
        Topic.new(attrs, function(err, topic) {
          if (err) { cb(err); return; }

          topic.validate(function(err, valid) {
            if (err) { cb(err); return; }

            assert.strictEqual(valid, result);

            cb();
          });
        });
      };
    }
  });

  test('validatesExclusionOf with allowNull', function(done) {
    Topic.validatesExclusionOf('title', { in: 'a b c d e f g'.split(' '), allowNull: true });

    async.parallel([
      tc({ title: 'a',  content: 'abc' }, false),
      tc({ title: '',   content: 'abc' }, true),
      tc({ title: null, content: 'abc' }, true)
    ], done);

    function tc(attrs, result, message) {
      return function(cb) {
        Topic.new(attrs, function(err, topic) {
          if (err) { cb(err); return; }

          topic.validate(function(err, valid) {
            if (err) { cb(err); return; }

            assert.strictEqual(valid, result);

            cb();
          });
        });
      };
    }
  });

  test('validatesExclusionOf with custom message', function(done) {
    Topic.validatesExclusionOf('title', { in: ['ape', 'monkey'], message: 'option %(value)s is restricted' });

    Topic.new({ title: 'something', content: 'abc' }, function(err, topic) {
      if (err) { done(err); return; }

      topic.validate(function(err, valid) {
        if (err) { done(err); return; }

        assert(valid);

        topic.setTitle('monkey');

        topic.validate(function(err, valid) {
          if (err) { done(err); return; }

          assert(!valid);
          assert.deepEqual(topic.getErrors().get('title'), ['option monkey is restricted']);

          done();
        });
      });
    });
  });

  test('validatesExclusionOf with within option', function(done) {
    Topic.validatesExclusionOf('title', { within: ['ape', 'monkey'] });

    Topic.new({ title: 'something', content: 'abc' }, function(err, topic) {
      if (err) { done(err); return; }

      topic.validate(function(err, valid) {
        if (err) { done(err); return; }

        assert(valid);

        topic.setTitle('monkey');

        topic.validate(function(err, valid) {
          if (err) { done(err); return; }

          assert(!valid);
          assert(topic.getErrors().get('title').length > 0);

          done();
        });
      });
    });
  });

  test('validatesExclusionOf with function', function(done) {
    Topic.validatesExclusionOf('title', { within: function(topic) { return topic.getAuthorName() === 'sikachu' ? ['monkey', 'elephant'] : ['ape', 'wasabi']; } });

    Topic.new(function(err, topic) {
      if (err) { done(err); return; }

      topic.setAuthorName('sikachu');
      topic.setTitle('elephant');

      topic.validate(function(err, valid) {
        if (err) { done(err); return; }

        assert(!valid);

        topic.setTitle('wasabi');

        topic.validate(function(err, valid) {
          if (err) { done(err); return; }

          assert(valid);

          done();
        });
      });
    });
  });

  test('validatesExclusionOf with invalid args', function() {
    assert.throws(function() { Topic.validatesExclusionOf('title');                 });
    assert.throws(function() { Topic.validatesExclusionOf('title', { in: null });   });
    assert.throws(function() { Topic.validatesExclusionOf('title', { in: 0 });      });
    assert.throws(function() { Topic.validatesExclusionOf('title', { in: 'abc' });  });
  });
});
