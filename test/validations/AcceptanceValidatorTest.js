'use strict';

var assert  = require('assert');
var Topic   = require('../models/Topic');

suite('acceptance validator', function() {
  teardown(function() {
    Topic.clearValidations();
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
        assert.deepEqual(topic.getErrors().get('terms_of_service'), ['must be accepted']);

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
        assert.deepEqual(topic.getErrors().get('eula'), ['must be abided']);

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
        assert.deepEqual(topic.getErrors().get('terms_of_service'), ['must be accepted']);

        topic.setTermsOfService('I agree.');

        topic.validate(function(err, valid) {
          if (err) { done(err); return; }

          assert(valid);

          done();
        });
      });
    });
  });
});
