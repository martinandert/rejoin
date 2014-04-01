'use strict';

var assert  = require('assert');
var Rejoin  = require('../../');
var Topic   = require('../models/Topic');

Rejoin.createValidator('EmailValidator', Rejoin.validators.EachValidator, {
  validateEach: function(record, attribute, value, done) {
    if (!/^([^@\s]+)@((?:[-a-z0-9]+\.)+[a-z]{2,})$/i.test(value)) {
      record.getErrors().set(attribute, this.options.message || 'is not an email');
    }

    done();
  }
});

suite('validates', function() {
  teardown(function() {
    Topic.clearValidations();
  });

  test('with messages empty', function(done) {
    Topic.validates('title', { presence: { message: '' } });

    Topic.new(function(err, topic) {
      if (err) { done(err); return; }

      topic.validate(function(err, valid) {
        if (err) { done(err); return; }

        assert(!valid, 'topic should not be valid');

        done();
      });
    });
  });

  test('with built-in validation', function(done) {
    Topic.validates('title', { numericality: true });

    Topic.new(function(err, topic) {
      if (err) { done(err); return; }

      topic.validate(function(err, valid) {
        if (err) { done(err); return; }

        assert.deepEqual(topic.getErrors().get('title'), ['is not a number']);

        topic.setTitle(123);

        topic.validate(function(err, valid) {
          if (err) { done(err); return; }

          assert(valid);

          done();
        });
      });
    });
  });

  test('with built-in validation and options', function(done) {
    Topic.validates('content', { numericality: { message: 'my custom message' } });

    Topic.new(function(err, topic) {
      if (err) { done(err); return; }

      topic.validate(function(err, valid) {
        if (err) { done(err); return; }

        assert.deepEqual(topic.getErrors().get('content'), ['my custom message']);

        done();
      });
    });
  });

  test('with custom validator', function(done) {
    Topic.validates('title', { email: true });

    Topic.new(function(err, topic) {
      if (err) { done(err); return; }

      topic.validate(function(err, valid) {
        if (err) { done(err); return; }

        assert.deepEqual(topic.getErrors().get('title'), ['is not an email']);

        done();
      });
    });
  });

  test('with if as local conditions', function(done) {
    Topic.validates('title', { presence: true, email: { unless: 'getConditionIsTrue' } });

    Topic.new(function(err, topic) {
      if (err) { done(err); return; }

      topic.validate(function(err, valid) {
        if (err) { done(err); return; }

        assert.deepEqual(topic.getErrors().get('title'), ['cannot be blank']);

        done();
      });
    });
  });

  test('with if as shared conditions', function(done) {
    Topic.validates('title', { presence: true, email: true, if: 'getConditionIsTrue' });

    Topic.new(function(err, topic) {
      if (err) { done(err); return; }

      topic.validate(function(err, valid) {
        if (err) { done(err); return; }

        assert.deepEqual(topic.getErrors().get('title').sort(), ['cannot be blank', 'is not an email']);

        done();
      });
    });
  });

  test('with if as shared conditions', function(done) {
    Topic.validates('title', { presence: true, email: true, unless: 'getConditionIsTrue' });

    Topic.new(function(err, topic) {
      if (err) { done(err); return; }

      topic.validate(function(err, valid) {
        if (err) { done(err); return; }

        assert(valid);

        done();
      });
    });
  });

  test('with allowNull shared conditions', function(done) {
    Topic.validates('title', { length: { minimum: 20 }, email: true, allowNull: true });

    Topic.new(function(err, topic) {
      if (err) { done(err); return; }

      topic.validate(function(err, valid) {
        if (err) { done(err); return; }

        assert(valid);

        done();
      });
    });
  });

  test('with regexp', function(done) {
    Topic.validates('title', { format: /positive|negative/ });

    Topic.new(function(err, topic) {
      if (err) { done(err); return; }

      topic.validate(function(err, valid) {
        if (err) { done(err); return; }

        assert(!valid);
        assert.deepEqual(topic.getErrors().get('title'), ['is invalid']);

        topic.setTitle('positive');

        topic.validate(function(err, valid) {
          if (err) { done(err); return; }

          assert(valid);

          done();
        });
      });
    });
  });

  test('with array', function(done) {
    Topic.validates('title', { inclusion: ['m', 'f'] });

    Topic.new(function(err, topic) {
      if (err) { done(err); return; }

      topic.validate(function(err, valid) {
        if (err) { done(err); return; }

        assert(!valid);
        assert.deepEqual(topic.getErrors().get('title'), ['is not included in the list']);

        topic.setTitle('m');

        topic.validate(function(err, valid) {
          if (err) { done(err); return; }

          assert(valid);

          done();
        });
      });
    });
  });

  test('with custom validator and options', function(done) {
    Topic.validates('title', { email: { message: 'my custom message' } });

    Topic.new(function(err, topic) {
      if (err) { done(err); return; }

      topic.validate(function(err, valid) {
        if (err) { done(err); return; }

        assert.deepEqual(topic.getErrors().get('title'), ['my custom message']);

        done();
      });
    });
  });

  test('with custom validator and options', function() {
    assert.throws(function() {
      Topic.validates('title', { unknown: true });
    }, /unknown validator/);
  });

  test('defining extra default keys for validates', function(done) {
    Topic.validates('title', { confirmation: true, message: 'Y U NO CONFIRM' });

    Topic.new(function(err, topic) {
      if (err) { done(err); return; }

      topic.setTitle('What\'s happening');
      topic.setTitleConfirmation('Not this');

      topic.validate(function(err, valid) {
        if (err) { done(err); return; }

        assert(!valid);
        assert.deepEqual(topic.getErrors().get('title_confirmation'), ['Y U NO CONFIRM']);

        done();
      });
    });
  });
});
