'use strict';

var _           = require('lodash-node');
var assert      = require('assert');
var Rejoin      = require('../../');
var Topic       = require('../models/Topic');
var Reply       = require('../models/Reply');
var Automobile  = require('../models/Automobile');

suite('validations mixin', function() {
  teardown(function() {
    Topic.clearValidations();
  });

  test('single field validation', function(done) {
    Reply.new(function(err, record) {
      if (err) { done(err); return; }

      record.setTitle('There\'s no content!');

      record.validate(function(err, valid) {
        if (err) { done(err); return; }

        assert(!valid);
        assert(record.afterValidationPerformed);

        record.setContent('Messa content!');

        record.validate(function(err, valid) {
          if (err) { done(err); return; }

          assert(valid);
          assert(record.afterValidationPerformed);

          done();
        });
      });
    });
  });

  test('single attr validation and error msg', function(done) {
    Reply.new(function(err, record) {
      if (err) { done(err); return; }

      record.setTitle('There\'s no content!');

      record.validate(function(err, valid) {
        if (err) { done(err); return; }

        assert(!valid);
        assert(record.getErrors().get('content').length > 0);
        assert.deepEqual(record.getErrors().get('content'), ['is Empty']);
        assert.strictEqual(record.getErrors().getCount(), 1);

        done();
      });
    });
  });

  test('double attr validation and error msg', function(done) {
    Reply.new(function(err, record) {
      if (err) { done(err); return; }

      record.validate(function(err, valid) {
        if (err) { done(err); return; }

        assert(!valid);

        assert(record.getErrors().get('title').length > 0);
        assert.deepEqual(record.getErrors().get('title'), ['is Empty']);

        assert(record.getErrors().get('content').length > 0);
        assert.deepEqual(record.getErrors().get('content'), ['is Empty']);

        assert.strictEqual(record.getErrors().getCount(), 2);

        done();
      });
    });
  });

  test('single error per attr iteration', function(done) {
    Reply.new(function(err, record) {
      if (err) { done(err); return; }

      record.validate(function(err, valid) {
        if (err) { done(err); return; }

        var errors = record.getErrors().map(function(attribute, message) { return [attribute, message]; });

        assert(_.any(errors, function(error) {
          return error[0] === 'title' && error[1] === 'is Empty';
        }));

        assert(_.any(errors, function(error) {
          return error[0] === 'content' && error[1] === 'is Empty';
        }));

        done();
      });
    });
  });

  test('multiple errors per attr iteration with full error composition', function(done) {
    Reply.new(function(err, record) {
      if (err) { done(err); return; }

      record.setTitle('');
      record.setContent('');

      record.validate(function(err, valid) {
        if (err) { done(err); return; }

        var errors = record.getErrors().toArray();

        assert.equal(errors[0], 'Content is Empty');
        assert.equal(errors[1], 'Title is Empty');
        assert.equal(record.getErrors().getCount(), 2);

        done();
      });
    });
  });

  test('errors on nested attributes expands name', function(done) {
    Topic.new(function(err, record) {
      if (err) { done(err); return; }

      record.getErrors().set('replies.name', 'can\'t be blank');

      assert.deepEqual(record.getErrors().getFullMessages(), ['Replies name can\'t be blank']);

      done();
    });
  });

  test('errors on base', function(done) {
    Reply.new(function(err, record) {
      if (err) { done(err); return; }

      record.setContent('Mismatch');

      record.validate(function(err, valid) {
        if (err) { done(err); return; }

        record.getErrors().add(':base', 'Reply is not dignifying');

        var errors = record.getErrors().toArray().reduce(function(result, error) {
          result.push(error);
          return result;
        }, []);

        assert.deepEqual(record.getErrors().get(':base'), ['Reply is not dignifying']);

        assert(_.contains(errors, 'Title is Empty'));
        assert(_.contains(errors, 'Reply is not dignifying'));

        assert.equal(record.getErrors().getCount(), 2);

        done();
      });
    });
  });

  test('errors on base with symbol message', function(done) {
    Reply.new(function(err, record) {
      if (err) { done(err); return; }

      record.setContent('Mismatch');

      record.validate(function(err, valid) {
        if (err) { done(err); return; }

        record.getErrors().add(':base', ':invalid');

        var errors = record.getErrors().toArray().reduce(function(result, error) {
          result.push(error);
          return result;
        }, []);

        assert.deepEqual(record.getErrors().get(':base'), ['is invalid']);

        assert(_.contains(errors, 'Title is Empty'));
        assert(_.contains(errors, 'is invalid'));

        assert.equal(record.getErrors().getCount(), 2);

        done();
      });
    });
  });

  test('errors empty after errors on check', function(done) {
    Topic.new(function(err, record) {
      if (err) { done(err); return; }

      assert(record.getErrors().get('id').length === 0);
      assert(record.getErrors().isEmpty());

      done();
    });
  });

  test('validatesEach', function(done) {
    var hits = 0;

    Topic.validatesEach('title', 'content', ['title', 'content'], function(record, attr, value, done) {
      record.getErrors().add(attr, 'gotcha');
      hits += 1;
      done();
    });

    Topic.new({ title: 'valid', content: 'whatever' }, function(err, record) {
      if (err) { done(err); return; }

      record.validate(function(err, valid) {
        if (err) { done(err); return; }

        assert(!valid);
        assert.equal(hits, 4);

        assert.deepEqual(record.getErrors().get('title'), ['gotcha', 'gotcha']);
        assert.deepEqual(record.getErrors().get('content'), ['gotcha', 'gotcha']);

        done();
      });
    });
  });

  test('validates function', function(done) {
    Topic.validate(function(done) {
      this.getErrors().add('title', 'will never be valid');
      done();
    });

    Topic.new({ title: 'Title', content: 'whatever' }, function(err, record) {
      if (err) { done(err); return; }

      record.validate(function(err, valid) {
        if (err) { done(err); return; }

        assert(!valid);
        assert(record.getErrors().get('title').length > 0);
        assert.deepEqual(record.getErrors().get('title'), ['will never be valid']);

        done();
      });
    });
  });

  test('errors conversions', function(done) {
    Topic.validatesPresenceOf(['title', 'content']);

    Topic.new(function(err, record) {
      if (err) { done(err); return; }

      record.validate(function(err, valid) {
        if (err) { done(err); return; }

        assert(!valid);

        var hash = { title: ['cannot be blank'], content: ['cannot be blank'] };

        assert.equal(record.getErrors().toJSON(), JSON.stringify(hash));

        done();
      });
    });
  });

  test('validation order', function(done) {
    Topic.validatesPresenceOf('title');
    Topic.validatesLengthOf('title', { minimum: 2 });

    Topic.new({ title: '' }, function(err, record) {
      if (err) { done(err); return; }

      record.validate(function(err, valid) {
        if (err) { done(err); return; }

        assert(!valid);

        assert.equal(record.getErrors().get('title')[0], 'cannot be blank');

        Topic.validatesPresenceOf('title', 'author_name');

        Topic.validate(function(done) {
          this.getErrors().add('author_email_address', 'will never be valid');
          done();
        });

        Topic.validatesLengthOf('title', 'content', { minimum: 2 });

        Topic.new({ title: '' }, function(err, record) {
          if (err) { done(err); return; }

          record.validate(function(err, valid) {
            if (err) { done(err); return; }

            assert(!valid);

            var key;

            key = record.getErrors().getKeys()[0];
            assert.equal(key, 'title');
            assert.equal(record.getErrors().get(key)[0], 'cannot be blank');
            assert.equal(record.getErrors().get(key)[1], 'is too short (minimum is 2 characters)');

            key = record.getErrors().getKeys()[1];
            assert.equal(key, 'author_name');
            assert.equal(record.getErrors().get(key)[0], 'cannot be blank');

            key = record.getErrors().getKeys()[2];
            assert.equal(key, 'author_email_address');
            assert.equal(record.getErrors().get(key)[0], 'will never be valid');

            key = record.getErrors().getKeys()[3];
            assert.equal(key, 'content');
            assert.equal(record.getErrors().get(key)[0], 'is too short (minimum is 2 characters)');

            done();
          });
        });
      });
    });
  });

  test('validation with if and on', function(done) {
    Topic.validatesPresenceOf('title', { if: function(record) { record.setAuthorName('bad'); return true; }, on: 'update' });

    Topic.new(function(err, record) {
      if (err) { done(err); return; }

      record.validate(function(err, valid) {
        if (err) { done(err); return; }

        assert(valid);
        assert.equal(record.getAuthorName(), null);

        record.validate('update', function(err, valid) {
          if (err) { done(err); return; }

          assert(!valid);
          assert.equal(record.getAuthorName(), 'bad');

          done();
        });
      });
    });
  });

  test('validation with message as function', function(done) {
    Topic.validatesPresenceOf('title', { message: function() { return 'no blanks here'.toUpperCase(); } });

    Topic.new(function(err, record) {
      if (err) { done(err); return; }

      record.validate(function(err, valid) {
        if (err) { done(err); return; }

        assert(!valid);
        assert.deepEqual(record.getErrors().get('title'), ['NO BLANKS HERE']);

        done();
      });
    });
  });

  test('list of validators for model', function() {
    Topic.validatesPresenceOf('title');
    Topic.validatesLengthOf('title', { minimum: 2 });

    assert.equal(Topic.getAllValidators().length, 2);
    assert.deepEqual(_.map(Topic.getAllValidators(), function(validator) { return validator.kind; }), ['presence', 'length']);
  });

  test('list of validators on an attribute', function() {
    Topic.validatesPresenceOf('title', 'content');
    Topic.validatesLengthOf('title', { minimum: 2 });

    assert.equal(Topic.getValidators().title.length, 2);
    assert.deepEqual(_.map(Topic.getValidators().title, function(validator) { return validator.kind; }), ['presence', 'length']);

    assert.equal(Topic.getValidators().content.length, 1);
    assert.deepEqual(_.map(Topic.getValidators().content, function(validator) { return validator.kind; }), ['presence']);
  });

  test('accessing instance of validator on an attribute', function() {
    Topic.validatesLengthOf('title', { minimum: 10 });

    assert.equal(Topic.getValidators().title[0].options.minimum, 10);
  });

  test('list of validators will be empty when empty', function() {
    Topic.validates('title', { length: { minimum: 10 } });

    assert.strictEqual(Topic.getValidators().author_name, undefined);
  });

  test('validations on the instance level', function(done) {
    Automobile.new(function(err, record) {
      if (err) { done(err); return; }

      record.validate(function(err, valid) {
        if (err) { done(err); return; }

        assert(!valid);
        assert.equal(record.getErrors().getSize(), 3);

        record.setMake('Toyota');
        record.setModel('Corolla');
        record.setApproved('1');

        record.validate(function(err, valid) {
          if (err) { done(err); return; }

          assert(valid);

          done();
        });
      });
    });
  });

  test('strict validation in validates blank', function(done) {
    Topic.validates('title', { strict: true, presence: true, length: { maximum: 3 } });

    Topic.new(function(err, record) {
      if (err) { done(err); return; }

      record.validate(function(err, valid) {
        if (err instanceof Rejoin.Errors.StrictValidationFailed) {
          assert.equal(err.message, 'Title cannot be blank');
          done();
        } else {
          done(new Error('expected validate() to be called back with strict error'));
        }
      });
    });
  });

  test('strict validation in validates not blank', function(done) {
    Topic.validates('title', { strict: true, presence: true, length: { maximum: 3 } });

    Topic.new({ title: 'four' }, function(err, record) {
      if (err) { done(err); return; }

      record.validate(function(err, valid) {
        if (err instanceof Rejoin.Errors.StrictValidationFailed) {
          assert.equal(err.message, 'Title is too long (maximum is 3 characters)');
          done();
        } else {
          done(new Error('expected validate() to be called back with strict error'));
        }
      });
    });
  });

  test('strict validation not fails', function(done) {
    Topic.validates('title', { strict: true, presence: true, length: { maximum: 3 } });

    Topic.new({ title: 'foo' }, function(err, record) {
      if (err) { done(err); return; }

      record.validate(function(err, valid) {
        if (err) { done(err); return; }

        assert(valid);
        done();
      });
    });
  });

  test('strict validation for particular validator', function(done) {
    Topic.validates('title', { presence: { strict: true } });

    Topic.new(function(err, record) {
      if (err) { done(err); return; }

      record.validate(function(err, valid) {
        if (err instanceof Rejoin.Errors.StrictValidationFailed) {
          assert.equal(err.message, 'Title cannot be blank');
          done();
        } else {
          done(new Error('expected validate() to be called back with strict error'));
        }
      });
    });
  });

  test('strict validation in custom validation helper', function(done) {
    Topic.validatesPresenceOf('title', { strict: true });

    Topic.new(function(err, record) {
      if (err) { done(err); return; }

      record.validate(function(err, valid) {
        if (err instanceof Rejoin.Errors.StrictValidationFailed) {
          assert.equal(err.message, 'Title cannot be blank');
          done();
        } else {
          done(new Error('expected validate() to be called back with strict error'));
        }
      });
    });
  });

  test('strict validation with custom exception', function(done) {
    Topic.validatesPresenceOf('title', { strict: Rejoin.Errors.RecordInvalid });

    Topic.new(function(err, record) {
      if (err) { done(err); return; }

      record.validate(function(err, valid) {
        if (err instanceof Rejoin.Errors.RecordInvalid) {
          assert.equal(err.message, 'Title cannot be blank');
          done();
        } else {
          done(new Error('expected validate() to be called back with RecordInvalid error'));
        }
      });
    });
  });

  test('validates with bang', function(done) {
    Topic.validatesStrict('title', { presence: true });

    Topic.new(function(err, record) {
      if (err) { done(err); return; }

      record.validate(function(err, valid) {
        if (err instanceof Rejoin.Errors.StrictValidationFailed) {
          assert.equal(err.message, 'Title cannot be blank');
          done();
        } else {
          done(new Error('expected validate() to be called back with strict error'));
        }
      });
    });
  });

  test('validates with false hash value', function(done) {
    Topic.validates('title', { presence: false });

    Topic.new(function(err, record) {
      if (err) { done(err); return; }

      record.validate(function(err, valid) {
        if (err) { done(err); return; }

        assert(valid);
        done();
      });
    });
  });

  test('validates does not modify options argument', function() {
    var options = { presence: true };

    Topic.validates('title', options);

    assert.deepEqual(options, { presence: true });
  });
});
