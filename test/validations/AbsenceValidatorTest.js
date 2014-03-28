var assert  = require('assert');
var Rejoin  = require('../../');
var Topic   = require('../models/Topic');
var Person  = require('../models/Person');
var _       = require('lodash-node');

suite('absence validator', function() {
  teardown(function() {
    Topic.clearValidations();
    Person.clearValidations();
  });

  test('validate absences', function(done) {
    Topic.validatesAbsenceOf('title', 'content');

    Topic.new(function(err, topic) {
      if (err) { done(err); return; }

      topic.setTitle('foo');
      topic.setContent('bar');

      topic.validate(function(err, result) {
        if (err) { done(err); return; }

        assert.strictEqual(false, result);

        assert.deepEqual(['must be blank'], topic.getErrors().get('title'));
        assert.deepEqual(['must be blank'], topic.getErrors().get('content'));

        topic.setTitle('');
        topic.setContent('something');

        topic.validate(function(err, result) {
          if (err) { done(err); return; }

          assert.strictEqual(false, result);

          assert.deepEqual(['must be blank'], topic.getErrors().get('content'));

          topic.setContent('');

          topic.validate(function(err, result) {
            if (err) { done(err); return; }

            assert.strictEqual(true, result);

            done();
          });
        });
      });
    });
  });

  test('accepts array arguments', function(done) {
    Topic.validatesAbsenceOf(['title', 'content']);

    Topic.new(function(err, topic) {
      if (err) { done(err); return; }

      topic.setTitle('foo');
      topic.setContent('bar');

      topic.validate(function(err, result) {
        if (err) { done(err); return; }

        assert.strictEqual(false, result);

        assert.deepEqual(['must be blank'], topic.getErrors().get('title'));
        assert.deepEqual(['must be blank'], topic.getErrors().get('content'));

        done();
      });
    });
  });

  test('validates with custom error using quotes', function(done) {
    Person.validatesAbsenceOf('karma', { message: 'This string contains \'single\' and "double" quotes' });

    Person.new(function(err, person) {
      if (err) { done(err); return; }

      person.setKarma('good');

      person.validate(function(err, result) {
        if (err) { done(err); return; }

        assert(!result);

        assert.equal('This string contains \'single\' and "double" quotes', _.last(person.getErrors().get('karma')));

        done();
      });
    });
  });

  test('validatesAbsenceOf for class', function(done) {
    Person.validatesAbsenceOf('karma');

    Person.new(function(err, person) {
      if (err) { done(err); return; }

      person.setKarma('good');

      person.validate(function(err, result) {
        if (err) { done(err); return; }

        assert(!result);

        assert.deepEqual(['must be blank'], person.getErrors().get('karma'));

        person.setKarma(null);

        person.validate(function(err, result) {
          if (err) { done(err); return; }

          assert(result);

          done();
        });
      });
    });
  });
});
