'use strict';

var assert  = require('assert');
var Topic   = require('../models/Topic');

suite('validation i18n', function() {
  teardown(function() {
    Topic.clearValidations();
  });

  test('test generate message inclusion with default message', function(done) {
    Topic.new(function(err, topic) {
      if (err) { done(err); return; }

      assert.equal(topic.getErrors().generateMessage('title', ':inclusion', { value: 'title' }), 'is not included in the list');

      done();
    });
  });

  test('test generate message inclusion with custom message', function(done) {
    Topic.new(function(err, topic) {
      if (err) { done(err); return; }

      assert.equal(topic.getErrors().generateMessage('title', ':inclusion', { message: 'custom message %(value)s', value: 'title' }), 'custom message title');

      done();
    });
  });

  test('test generate message exclusion with default message', function(done) {
    Topic.new(function(err, topic) {
      if (err) { done(err); return; }

      assert.equal(topic.getErrors().generateMessage('title', ':exclusion', { value: 'title' }), 'is reserved');

      done();
    });
  });

  test('test generate message exclusion with custom message', function(done) {
    Topic.new(function(err, topic) {
      if (err) { done(err); return; }

      assert.equal(topic.getErrors().generateMessage('title', ':exclusion', { message: 'custom message %(value)s', value: 'title' }), 'custom message title');

      done();
    });
  });

  test('test generate message invalid with default message', function(done) {
    Topic.new(function(err, topic) {
      if (err) { done(err); return; }

      assert.equal(topic.getErrors().generateMessage('title', ':invalid', { value: 'title' }), 'is invalid');

      done();
    });
  });

  test('test generate message invalid with custom message', function(done) {
    Topic.new(function(err, topic) {
      if (err) { done(err); return; }

      assert.equal(topic.getErrors().generateMessage('title', ':invalid', { message: 'custom message %(value)s', value: 'title' }), 'custom message title');

      done();
    });
  });

  test('test generate message confirmation with default message', function(done) {
    Topic.new(function(err, topic) {
      if (err) { done(err); return; }

      assert.equal(topic.getErrors().generateMessage('title', ':confirmation'), 'does not match Title');

      done();
    });
  });

  test('test generate message confirmation with custom message', function(done) {
    Topic.new(function(err, topic) {
      if (err) { done(err); return; }

      assert.equal(topic.getErrors().generateMessage('title', ':confirmation', { message: 'custom message' }), 'custom message');

      done();
    });
  });

  test('test generate message accepted with default message', function(done) {
    Topic.new(function(err, topic) {
      if (err) { done(err); return; }

      assert.equal(topic.getErrors().generateMessage('title', ':accepted'), 'must be accepted');

      done();
    });
  });

  test('test generate message accepted with custom message', function(done) {
    Topic.new(function(err, topic) {
      if (err) { done(err); return; }

      assert.equal(topic.getErrors().generateMessage('title', ':accepted', { message: 'custom message' }), 'custom message');

      done();
    });
  });

  test('test generate message empty with default message', function(done) {
    Topic.new(function(err, topic) {
      if (err) { done(err); return; }

      assert.equal(topic.getErrors().generateMessage('title', ':empty'), 'cannot be empty');

      done();
    });
  });

  test('test generate message empty with custom message', function(done) {
    Topic.new(function(err, topic) {
      if (err) { done(err); return; }

      assert.equal(topic.getErrors().generateMessage('title', ':empty', { message: 'custom message' }), 'custom message');

      done();
    });
  });

  test('test generate message blank with default message', function(done) {
    Topic.new(function(err, topic) {
      if (err) { done(err); return; }

      assert.equal(topic.getErrors().generateMessage('title', ':blank'), 'cannot be blank');

      done();
    });
  });

  test('test generate message blank with custom message', function(done) {
    Topic.new(function(err, topic) {
      if (err) { done(err); return; }

      assert.equal(topic.getErrors().generateMessage('title', ':blank', { message: 'custom message' }), 'custom message');

      done();
    });
  });

  test('test generate message too long with default message', function(done) {
    Topic.new(function(err, topic) {
      if (err) { done(err); return; }

      assert.equal(topic.getErrors().generateMessage('title', ':too_long', { count: 10 }), 'is too long (maximum is 10 characters)');

      done();
    });
  });

  test('test generate message too long with custom message', function(done) {
    Topic.new(function(err, topic) {
      if (err) { done(err); return; }

      assert.equal(topic.getErrors().generateMessage('title', ':too_long', { message: 'custom message %(count)s', count: 10 }), 'custom message 10');

      done();
    });
  });

  test('test generate message too short with default message', function(done) {
    Topic.new(function(err, topic) {
      if (err) { done(err); return; }

      assert.equal(topic.getErrors().generateMessage('title', ':too_short', { count: 10 }), 'is too short (minimum is 10 characters)');

      done();
    });
  });

  test('test generate message too short with custom message', function(done) {
    Topic.new(function(err, topic) {
      if (err) { done(err); return; }

      assert.equal(topic.getErrors().generateMessage('title', ':too_short', { message: 'custom message %(count)s', count: 10 }), 'custom message 10');

      done();
    });
  });

  test('test generate message wrong length with default message', function(done) {
    Topic.new(function(err, topic) {
      if (err) { done(err); return; }

      assert.equal(topic.getErrors().generateMessage('title', ':wrong_length', { count: 10 }), 'is the wrong length (should be 10 characters)');

      done();
    });
  });

  test('test generate message wrong length with custom message', function(done) {
    Topic.new(function(err, topic) {
      if (err) { done(err); return; }

      assert.equal(topic.getErrors().generateMessage('title', ':wrong_length', { message: 'custom message %(count)s', count: 10 }), 'custom message 10');

      done();
    });
  });

  test('test generate message not a_number with default message', function(done) {
    Topic.new(function(err, topic) {
      if (err) { done(err); return; }

      assert.equal(topic.getErrors().generateMessage('title', ':not_a_number', { value: 'title' }), 'is not a number');

      done();
    });
  });

  test('test generate message not a_number with custom message', function(done) {
    Topic.new(function(err, topic) {
      if (err) { done(err); return; }

      assert.equal(topic.getErrors().generateMessage('title', ':not_a_number', { message: 'custom message %(value)s', value: 'title' }), 'custom message title');

      done();
    });
  });

  test('test generate message greater than with default message', function(done) {
    Topic.new(function(err, topic) {
      if (err) { done(err); return; }

      assert.equal(topic.getErrors().generateMessage('title', ':greater_than', { value: 'title', count: 10 }), 'must be greater than 10');

      done();
    });
  });

  test('test generate message greater than or equal to with default message', function(done) {
    Topic.new(function(err, topic) {
      if (err) { done(err); return; }

      assert.equal(topic.getErrors().generateMessage('title', ':greater_than_or_equal_to', { value: 'title', count: 10 }), 'must be greater than or equal to 10');

      done();
    });
  });

  test('test generate message equal to with default message', function(done) {
    Topic.new(function(err, topic) {
      if (err) { done(err); return; }

      assert.equal(topic.getErrors().generateMessage('title', ':equal_to', { value: 'title', count: 10 }), 'must be equal to 10');

      done();
    });
  });

  test('test generate message less than with default message', function(done) {
    Topic.new(function(err, topic) {
      if (err) { done(err); return; }

      assert.equal(topic.getErrors().generateMessage('title', ':less_than', { value: 'title', count: 10 }), 'must be less than 10');

      done();
    });
  });

  test('test generate message less than or equal to with default message', function(done) {
    Topic.new(function(err, topic) {
      if (err) { done(err); return; }

      assert.equal(topic.getErrors().generateMessage('title', ':less_than_or_equal_to', { value: 'title', count: 10 }), 'must be less than or equal to 10');

      done();
    });
  });

  test('test generate message odd with default message', function(done) {
    Topic.new(function(err, topic) {
      if (err) { done(err); return; }

      assert.equal(topic.getErrors().generateMessage('title', ':odd', { value: 'title', count: 10 }), 'must be odd');

      done();
    });
  });

  test('test generate message even with default message', function(done) {
    Topic.new(function(err, topic) {
      if (err) { done(err); return; }

      assert.equal(topic.getErrors().generateMessage('title', ':even', { value: 'title', count: 10 }), 'must be even');

      done();
    });
  });
});
