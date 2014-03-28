var assert  = require('assert');
var Rejoin  = require('../../');
var Topic   = require('../models/Topic');
var Person  = require('../models/Person');
var _       = require('lodash-node');

suite('presence validator', function() {
  teardown(function() {
    Topic.clearValidations();
    Person.clearValidations();
  });

  test('validate presences', function(done) {
    Topic.validatesPresenceOf('title', 'content');

    Topic.new(function(err, topic) {
      if (err) { done(err); return; }

      topic.isValid(function(err, result) {
        if (err) { done(err); return; }

        assert.strictEqual(false, result);

        assert.deepEqual(['cannot be blank'], topic.getErrors().get('title'));
        assert.deepEqual(['cannot be blank'], topic.getErrors().get('content'));

        topic.setTitle('something');
        topic.setContent('    ');

        topic.isValid(function(err, result) {
          if (err) { done(err); return; }

          assert.strictEqual(false, result);

          assert.deepEqual(['cannot be blank'], topic.getErrors().get('content'));

          topic.setContent('like stuff');

          topic.isValid(function(err, result) {
            if (err) { done(err); return; }

            assert.strictEqual(true, result);

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

      topic.isValid(function(err, result) {
        if (err) { done(err); return; }

        assert.strictEqual(false, result);

        assert.deepEqual(['cannot be blank'], topic.getErrors().get('title'));
        assert.deepEqual(['cannot be blank'], topic.getErrors().get('content'));

        done();
      });
    });
  });

  test('validates with custom error using quotes', function(done) {
    Person.validatesPresenceOf('karma', { message: 'This string contains \'single\' and "double" quotes' });

    Person.new(function(err, person) {
      if (err) { done(err); return; }

      person.isValid(function(err, result) {
        if (err) { done(err); return; }

        assert(!result);

        assert.equal('This string contains \'single\' and "double" quotes', _.last(person.getErrors().get('karma')));

        done();
      });
    });
  });
});


/*
  */
