'use strict';

var assert  = require('assert');
var async   = require('async');
var Topic   = require('../models/Topic');

suite('format validator', function() {
  teardown(function() {
    Topic.clearValidations();
  });

  test('default validatesFormatOf', function(done) {
    Topic.validatesFormatOf('title', 'content', { with: /^Validation\smacros \w+!$/, message: 'is bad data' });

    Topic.new({ title: 'i\'m incorrect', content: 'Validation macros rule!' }, function(err, topic) {
      if (err) { done(err); return; }

      topic.validate(function(err, valid) {
        if (err) { done(err); return; }

        assert.strictEqual(valid, false);
        assert.deepEqual(topic.getErrors().get('title'), ['is bad data']);
        assert(topic.getErrors().get('content').length === 0);

        topic.setTitle('Validation macros rule!');

        topic.validate(function(err, valid) {
          if (err) { done(err); return; }

          assert.strictEqual(valid, true);
          assert(topic.getErrors().get('title').length === 0);

          done();
        });
      });
    });
  });

  test('validatesFormatOf with allowBlank', function(done) {
    Topic.validatesFormatOf('title', { with: /^Validation\smacros \w+!$/, allowBlank: true });

    async.parallel([
      tc({ title: 'Shouldn\'t be valid'     }, false),
      tc({ title: ''                        }, true),
      tc({ title: null                      }, true),
      tc({ title: 'Validation macros rule!' }, true)
    ], done);

    function tc(attrs, result) {
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

  test('validatesFormatOf with numeric', function(done) {
    Topic.validatesFormatOf('title', 'content', { with: /^[1-9][0-9]*$/, message: 'is bad data' });

    Topic.new({ title: '72x', content: '6789' }, function(err, topic) {
      if (err) { done(err); return; }

      topic.validate(function(err, valid) {
        if (err) { done(err); return; }

        assert(!valid);
        assert.deepEqual(topic.getErrors().get('title'), ['is bad data']);
        assert(topic.getErrors().get('content').length === 0);

        async.series([ tc('-11'), tc('03'), tc('z44'), tc('5v7')], function(err) {
          if (err) { done(err); return; }

          topic.setTitle('1');

          topic.validate(function(err, valid) {
            if (err) { done(err); return; }

            assert.strictEqual(valid, true);
            assert(topic.getErrors().get('title').length === 0);

            done();
          });
        });

        function tc(title) {
          return function(cb) {
            topic.setTitle(title);

            topic.validate(function(err, valid) {
              if (err) { cb(err); return; }
              assert(!valid);
              cb();
            });
          };
        }
      });
    });
  });

  test('validatesFormatOf with custom message', function(done) {
    Topic.validatesFormatOf('title', 'content', { with: /^Valid Title$/, message: 'can\'t be %(value)s' });

    Topic.new({ title: 'Invalid title' }, function(err, topic) {
      if (err) { done(err); return; }

      topic.validate(function(err, valid) {
        if (err) { done(err); return; }

        assert(!valid);
        assert.deepEqual(topic.getErrors().get('title'), ['can\'t be Invalid title']);

        done();
      });
    });
  });

  test('validatesFormatOf with invalid args', function() {
    assert.throws(function() { Topic.validatesFormatOf('title');                                      });
    assert.throws(function() { Topic.validatesFormatOf('title', { with: /this/, without: /that/ });   });
    assert.throws(function() { Topic.validatesFormatOf('title', { with: 'clearly not a regexp' });    });
    assert.throws(function() { Topic.validatesFormatOf('title', { without: 'clearly not a regexp' }); });
  });

  test('validatesFormatOf with without option', function(done) {
    Topic.validatesFormatOf('title', { without: /foo/, message: 'should not contain foo' });

    Topic.new(function(err, topic) {
      if (err) { done(err); return; }

      topic.setTitle('foobar');

      topic.validate(function(err, valid) {
        if (err) { done(err); return; }

        assert(!valid);
        assert.deepEqual(topic.getErrors().get('title'), ['should not contain foo']);

        topic.setTitle('something else');

        topic.validate(function(err, valid) {
          if (err) { done(err); return; }

          assert(valid);
          assert.deepEqual([], topic.getErrors().get('title'));

          done();
        });
      });
    });
  });

  test('validatesFormatOf with function', function(done) {
    Topic.validatesFormatOf('content', { with: function(topic) { return topic.getTitle() === 'digit' ? /^\d+$/ : /^\S+$/; } });

    Topic.new(function(err, topic) {
      if (err) { done(err); return; }

      topic.setTitle('digit');
      topic.setContent('Pixies');

      topic.validate(function(err, valid) {
        if (err) { done(err); return; }

        assert(!valid);

        topic.setContent('1234');

        topic.validate(function(err, valid) {
          if (err) { done(err); return; }

          assert(valid);

          done();
        });
      });
    });
  });

  test('validatesFormatOf without function', function(done) {
    Topic.validatesFormatOf('content', { without: function(topic) { return topic.getTitle() === 'characters' ? /^\d+$/ : /^\S+$/; } });

    Topic.new(function(err, topic) {
      if (err) { done(err); return; }

      topic.setTitle('characters');
      topic.setContent('1234');

      topic.validate(function(err, valid) {
        if (err) { done(err); return; }

        assert(!valid);

        topic.setContent('Pixies');

        topic.validate(function(err, valid) {
          if (err) { done(err); return; }

          assert(valid);

          done();
        });
      });
    });
  });
});
