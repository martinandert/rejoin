'use strict';

var _       = require('lodash-node');
var assert  = require('assert');
var Rejoin  = require('../../');
var Topic   = require('../models/Topic');

var ERROR_MESSAGE = 'Validation error from validator';
var OTHER_ERROR_MESSAGE = 'Validation error from other validator';

var Validator = Rejoin.validators.Validator;
var EachValidator = Rejoin.validators.EachValidator;

var ValidatorThatAddsErrors = Rejoin.createValidator('ValidatorThatAddsErrors', Validator, {
  validate: function(record, done) {
    record.getErrors().set(':base', ERROR_MESSAGE);
    done();
  }
});

var OtherValidatorThatAddsErrors = Rejoin.createValidator('OtherValidatorThatAddsErrors', Validator, {
  validate: function(record, done) {
    record.getErrors().set(':base', OTHER_ERROR_MESSAGE);
    done();
  }
});

var ValidatorThatDoesNotAddErrors = Rejoin.createValidator('ValidatorThatDoesNotAddErrors', Validator, {
  validate: function(record, done) {
    done();
  }
});

var ValidatorThatValidatesOptions = Rejoin.createValidator('ValidatorThatValidatesOptions', Validator, {
  validate: function(record, done) {
    if (this.options.field === 'first_name') {
      record.getErrors().set(':base', ERROR_MESSAGE);
    }

    done();
  }
});

var ValidatorPerEachAttribute = Rejoin.createValidator('ValidatorPerEachAttribute', EachValidator, {
  validateEach: function(record, attribute, value, done) {
    record.getErrors().set(attribute, 'Value is ' + value);
    done();
  }
});

var ValidatorCheckValidity = Rejoin.createValidator('ValidatorCheckValidity', EachValidator, {
  checkValidity: function() {
    throw new Error('boom!');
  }
});

suite('validatesWith', function() {
  teardown(function() {
    Topic.clearValidations();
  });

  test('with a validator that adds errors', function(done) {
    Topic.validatesWith(ValidatorThatAddsErrors);

    Topic.new(function(err, topic) {
      if (err) { done(err); return; }

      topic.validate(function(err, valid) {
        if (err) { done(err); return; }

        assert(!valid, 'A validator that adds errors causes the record to be invalid');
        assert(_.contains(topic.getErrors().get(':base'), ERROR_MESSAGE));

        done();
      });
    });
  });

  test('with a validator that returns valid', function(done) {
    Topic.validatesWith(ValidatorThatDoesNotAddErrors);

    Topic.new(function(err, topic) {
      if (err) { done(err); return; }

      topic.validate(function(err, valid) {
        if (err) { done(err); return; }

        assert(valid, 'A validator that does not add errors does not cause the record to be invalid');

        done();
      });
    });
  });

  test('with multiple validators', function(done) {
    Topic.validatesWith(ValidatorThatAddsErrors, OtherValidatorThatAddsErrors);

    Topic.new(function(err, topic) {
      if (err) { done(err); return; }

      topic.validate(function(err, valid) {
        if (err) { done(err); return; }

        assert(!valid);
        assert(_.contains(topic.getErrors().get(':base'), ERROR_MESSAGE));
        assert(_.contains(topic.getErrors().get(':base'), OTHER_ERROR_MESSAGE));

        done();
      });
    });
  });

  test('with if option that returns false', function(done) {
    Topic.validatesWith(ValidatorThatAddsErrors, { if: function() { return 1 === 2; } });

    Topic.new(function(err, topic) {
      if (err) { done(err); return; }

      topic.validate(function(err, valid) {
        if (err) { done(err); return; }

        assert(valid);

        done();
      });
    });
  });

  test('with if option that returns true', function(done) {
    Topic.validatesWith(ValidatorThatAddsErrors, { if: function() { return 1 === 1; } });

    Topic.new(function(err, topic) {
      if (err) { done(err); return; }

      topic.validate(function(err, valid) {
        if (err) { done(err); return; }

        assert(!valid);
        assert(_.contains(topic.getErrors().get(':base'), ERROR_MESSAGE));

        done();
      });
    });
  });

  test('with unless option that returns true', function(done) {
    Topic.validatesWith(ValidatorThatAddsErrors, { unless: function() { return 1 === 1; } });

    Topic.new(function(err, topic) {
      if (err) { done(err); return; }

      topic.validate(function(err, valid) {
        if (err) { done(err); return; }

        assert(valid);

        done();
      });
    });
  });

  test('with unless option that returns false', function(done) {
    Topic.validatesWith(ValidatorThatAddsErrors, { unless: function() { return 1 === 2; } });

    Topic.new(function(err, topic) {
      if (err) { done(err); return; }

      topic.validate(function(err, valid) {
        if (err) { done(err); return; }

        assert(!valid);
        assert(_.contains(topic.getErrors().get(':base'), ERROR_MESSAGE));

        done();
      });
    });
  });

  test('passes all configuration options to the validator', function(done) {
    Topic.new(function(err, topic) {
      if (err) { done(err); return; }

      var ifFunc = function() { return 1 === 1; };
      var validatorArgs = null;
      var validatedRecord = null;

      var TestValidator = Rejoin.createValidator('TestValidator', Validator, {
        initialize: function(options) {
          validatorArgs = options;
        },

        validate: function(record, done) {
          validatedRecord = record;
          done();
        }
      });

      Topic.validatesWith(TestValidator, { if: ifFunc, foo: 'bar' });

      assert.deepEqual({ foo: 'bar', if: ifFunc, model: Topic }, validatorArgs);

      topic.validate(function(err, valid) {
        if (err) { done(err); return; }

        assert(valid);
        assert(topic, validatedRecord);

        done();
      });
    });
  });

  test('with custom options', function(done) {
    Topic.validatesWith(ValidatorThatValidatesOptions, { field: 'first_name' });

    Topic.new(function(err, topic) {
      if (err) { done(err); return; }

      topic.validate(function(err, valid) {
        if (err) { done(err); return; }

        assert(!valid);
        assert(_.contains(topic.getErrors().get(':base'), ERROR_MESSAGE));

        done();
      });
    });
  });

  test('each validator checks attributes', function(done) {
    Topic.validatesWith(ValidatorPerEachAttribute, { attributes: ['title', 'content'] });

    Topic.new({ title: 'Title', content: 'Content' }, function(err, topic) {
      if (err) { done(err); return; }

      topic.validate(function(err, valid) {
        if (err) { done(err); return; }

        assert(!valid);
        assert.deepEqual(topic.getErrors().get('title'), ['Value is Title']);
        assert.deepEqual(topic.getErrors().get('content'), ['Value is Content']);

        done();
      });
    });
  });

  test('each validator checks validity', function() {
    assert.throws(function() {
      Topic.validatesWith(ValidatorCheckValidity, { attributes: ['title'] });
    }, /boom/);
  });

  test('each validator expects attributes to be given', function() {
    assert.throws(function() {
      Topic.validatesWith(ValidatorPerEachAttribute);
    }, /attributes cannot be empty/);
  });

  test('each validator skips null values if allowNull is set to true', function(done) {
    Topic.validatesWith(ValidatorPerEachAttribute, { attributes: ['title', 'content'], allowNull: true });

    Topic.new({ content: '' }, function(err, topic) {
      if (err) { done(err); return; }

      topic.validate(function(err, valid) {
        if (err) { done(err); return; }

        assert(!valid);
        assert(topic.getErrors().get('title').length === 0);
        assert.deepEqual(topic.getErrors().get('content'), ['Value is ']);

        done();
      });
    });
  });

  test('each validator skips blank values if allowBlank is set to true', function(done) {
    Topic.validatesWith(ValidatorPerEachAttribute, { attributes: ['title', 'content'], allowBlank: true });

    Topic.new({ content: '' }, function(err, topic) {
      if (err) { done(err); return; }

      topic.validate(function(err, valid) {
        if (err) { done(err); return; }

        assert(valid);
        assert(topic.getErrors().get('title').length === 0);
        assert(topic.getErrors().get('content').length === 0);

        done();
      });
    });
  });

  test('can validate with an instance method', function(done) {
    Topic.validates('title', { with: 'myValidation' });

    Topic.new({ title: 'foo' }, function(err, topic) {
      if (err) { done(err); return; }

      topic.validate(function(err, valid) {
        if (err) { done(err); return; }

        assert(valid);
        assert(topic.getErrors().get('title').length === 0);

        topic.setTitle(null);

        topic.validate(function(err, valid) {
          if (err) { done(err); return; }

          assert(!valid);
          assert.deepEqual(topic.getErrors().get('title'), ['is missing']);

          done();
        });
      });
    });
  });

  test('optionally pass in the attribute being validated when validating with an instance method', function(done) {
    Topic.validates('title', 'content', { with: 'myValidationWithArg' });

    Topic.new({ title: 'foo' }, function(err, topic) {
      if (err) { done(err); return; }

      topic.validate(function(err, valid) {
        if (err) { done(err); return; }

        assert(!valid);
        assert(topic.getErrors().get('title').length === 0);
        assert.deepEqual(topic.getErrors().get('content'), ['is missing']);

        done();
      });
    });
  });
});
