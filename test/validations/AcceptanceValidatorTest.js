'use strict';

var assert  = require('assert');
var Topic   = require('../models/Topic');
var Person  = require('../models/Person');

suite('acceptance validator', function() {
  teardown(function() {
    Topic.clearValidations();
    Person.clearValidations();
  });

  test('terms of service agreement no acceptance', function(done) {
    Topic.validatesAcceptanceOf('terms_of_service');

    Topic.new({ title: 'We should not be confirmed' }, function(err, topic) {
      if (err) { done(err); return; }

      topic.validate(function(err, valid) {
        if (err) { done(err); return; }

        assert(valid);

        done();
      });
    });
  });

  test('terms of service agreement', function(done) {
    Topic.validatesAcceptanceOf('terms_of_service');

    Topic.new({ title: 'We should be confirmed', terms_of_service: '' }, function(err, topic) {
      if (err) { done(err); return; }

      topic.validate(function(err, valid) {
        if (err) { done(err); return; }

        assert(!valid);
        assert.deepEqual(['must be accepted'], topic.getErrors().get('terms_of_service'));

        topic.setTermsOfService('1');

        topic.validate(function(err, valid) {
          if (err) { done(err); return; }

          assert(valid);

          done();
        });
      });
    });
  });

  test('eula', function(done) {
    Topic.validatesAcceptanceOf('eula', { message: 'must be abided' });

    Topic.new({ title: 'We should be confirmed', eula: '' }, function(err, topic) {
      if (err) { done(err); return; }

      topic.validate(function(err, valid) {
        if (err) { done(err); return; }

        assert(!valid);
        assert.deepEqual(['must be abided'], topic.getErrors().get('eula'));

        topic.setEula('1');

        topic.validate(function(err, valid) {
          if (err) { done(err); return; }

          assert(valid);

          done();
        });
      });
    });
  });

  test('eula', function(done) {
    Topic.validatesAcceptanceOf('terms_of_service', { accept: 'I agree.' });

    Topic.new({ title: 'We should be confirmed', terms_of_service: '' }, function(err, topic) {
      if (err) { done(err); return; }

      topic.validate(function(err, valid) {
        if (err) { done(err); return; }

        assert(!valid);
        assert.deepEqual(['must be accepted'], topic.getErrors().get('terms_of_service'));

        topic.setTermsOfService('I agree.');

        topic.validate(function(err, valid) {
          if (err) { done(err); return; }

          assert(valid);

          done();
        });
      });
    });
  });

  test('validatesAcceptanceOf for class', function(done) {
    Person.validatesAcceptanceOf('karma');

    Person.new(function(err, person) {
      if (err) { done(err); return; }

      person.setKarma('');

      person.validate(function(err, valid) {
        if (err) { done(err); return; }

        assert(!valid);
        assert.deepEqual(['must be accepted'], person.getErrors().get('karma'));

        person.setKarma('1');

        person.validate(function(err, valid) {
          if (err) { done(err); return; }

          assert(valid);

          done();
        });
      });
    });
  });
});
