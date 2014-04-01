'use strict';

var _       = require('lodash-node');
var assert  = require('assert');
var Rejoin  = require('../../');
var Topic   = require('../models/Topic');

var ERROR_MESSAGE = 'Validation error from validator';

var ValidatorThatAddsErrors = Rejoin.createValidator('ValidatorThatAddsErrors', Rejoin.validators.Validator, {
  validate: function(record, done) {
    record.getErrors().set(':base', ERROR_MESSAGE);
    done();
  }
});

suite('validation contexts', function() {
  teardown(function() {
    Topic.clearValidations();
  });

  test('with a validator that adds errors on create and validating a new model with context set to "foo"', function(done) {
    Topic.validatesWith(ValidatorThatAddsErrors, { on: 'create' });

    Topic.new(function(err, topic) {
      if (err) { done(err); return; }

      topic.validate('foo', function(err, valid) {
        if (err) { done(err); return; }

        assert(valid, 'Validation does not run on validate if "on" is set to create');

        done();
      });
    });
  });

  test('with a validator that adds errors on update and validating a new model', function(done) {
    Topic.validatesWith(ValidatorThatAddsErrors, { on: 'update' });

    Topic.new(function(err, topic) {
      if (err) { done(err); return; }

      topic.validate(function(err, valid) {
        if (err) { done(err); return; }

        assert(valid, 'Validation does not run on validate if "on" is set to update');

        done();
      });
    });
  });

  test('with a validator that adds errors on create and validating a new model', function(done) {
    Topic.validatesWith(ValidatorThatAddsErrors, { on: 'create' });

    Topic.new(function(err, topic) {
      if (err) { done(err); return; }

      topic.validate(function(err, valid) {
        if (err) { done(err); return; }

        assert(!valid, 'Validation does run on create if "on" is set to create');
        assert(_.contains(topic.getErrors().get(':base'), ERROR_MESSAGE));

        done();
      });
    });
  });

  test('with a validator that adds errors on multiple contexts and validating a new model', function(done) {
    Topic.validatesWith(ValidatorThatAddsErrors, { on: ['context1', 'context2'] });

    Topic.new(function(err, topic) {
      if (err) { done(err); return; }

      topic.validate(function(err, valid) {
        if (err) { done(err); return; }

        assert(valid, 'Validation ran with no context given when "on" is set to context1 and context2');

        topic.validate('context1', function(err, valid) {
          if (err) { done(err); return; }

          assert(!valid, 'Validation did not run on context1 when "on" is set to context1 and context2');
          assert(_.contains(topic.getErrors().get(':base'), ERROR_MESSAGE));

          topic.validate('context2', function(err, valid) {
            if (err) { done(err); return; }

            assert(!valid, 'Validation did not run on context2 when "on" is set to context1 and context2');
            assert(_.contains(topic.getErrors().get(':base'), ERROR_MESSAGE));

            done();
          });
        });
      });
    });
  });
});

/*
  test "with a class that adds errors on multiple contexts and validating a new model" do
    Topic.validates_with(ValidatorThatAddsErrors, on: [:context1, :context2])

    topic = Topic.new
    assert topic.valid?, "Validation ran with no context given when 'on' is set to context1 and context2"

    assert topic.invalid?(:context1), "Validation did not run on context1 when 'on' is set to context1 and context2"
    assert topic.errors[:base].include?(ERROR_MESSAGE)

    assert topic.invalid?(:context2), "Validation did not run on context2 when 'on' is set to context1 and context2"
    assert topic.errors[:base].include?(ERROR_MESSAGE)
  end
*/
