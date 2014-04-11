'use strict';

var assert = require('assert');
var sinon  = require('sinon');

var Rejoin = require('../../');
var Errors = require('../../lib/internal/Errors.js');

var Person = Rejoin.createModel('APerson', function(model) {
  model.attributes({
    name: Rejoin.DataType.STRING,
    age:  Rejoin.DataType.INTEGER
  });

  model.instanceMethods({
    validate: function() {
      if (this.getName() === null) {
        this.getErrors().add('name', 'cannot be null');
      }
    }
  });
});

suite('validation errors', function() {
  test('clone', function() {
    var errors = new Errors(this);
    errors.set('foo', 'bar');

    var cloned = errors.clone();
    cloned.set('bar', 'baz');

    assert.notDeepEqual(cloned.messages, errors.messages);
  });

  test('remove', function() {
    var errors = new Errors(this);
    errors.set('foo', 'bar');
    errors.remove('foo');

    assert.equal(0, errors.get('foo').length);
  });

  test('includes', function() {
    var errors = new Errors(this);
    errors.set('foo', 'bar');

    assert.strictEqual(errors.includes('foo'), true, 'errors should have key "foo"');
  });

  test('not includes', function() {
    var errors = new Errors(this);

    assert.strictEqual(errors.includes('name'), false, 'errors should not have key "name"');
  });

  test('get returns the errors for the provided key', function() {
    var errors = new Errors(this);
    errors.set('foo', 'omg');

    assert.deepEqual(errors.get('foo'), ['omg']);
  });

  test('sets the error with the provided key', function() {
    var errors = new Errors(this);
    errors.set('foo', 'omg');

    assert.deepEqual({ foo: ['omg'] }, errors.messages);
  });

  test('values returns an array of messages', function() {
    var errors = new Errors(this);
    errors.set('foo', 'bar');
    errors.set('foo', 'omg');
    errors.set('baz', 'zomg');

    assert.deepEqual([['bar', 'omg'], ['zomg']], errors.getValues());
  });

  test('keys returns the error keys', function() {
    var errors = new Errors(this);
    errors.set('foo', 'omg');
    errors.set('baz', 'zomg');

    assert.deepEqual(errors.getKeys(), ['foo', 'baz']);
  });

  test('clear', function(done) {
    Person.new(function(err, person) {
      if (err) { done(err); return; }

      person.validate();

      assert.equal(1, person.getErrors().getCount());
      person.getErrors().clear();
      assert(person.getErrors().isEmpty());

      done();
    });
  });

  test('detecting whether there are errors with empty, blank, includes', function(done) {
    Person.new(function(err, person) {
      if (err) { done(err); return; }

      person.getErrors().get('foo');

      assert(person.getErrors().isEmpty());
      assert(person.getErrors().isBlank());
      assert(!person.getErrors().includes('foo'));

      done();
    });
  });

  test('adding errors using conditionals with Person#validate!', function(done) {
    Person.new(function(err, person) {
      if (err) { done(err); return; }

      person.validate();

      assert.deepEqual(person.getErrors().getFullMessages(), ['Name cannot be null']);
      assert.deepEqual(person.getErrors().get('name'), ['cannot be null']);

      done();
    });
  });

  test('assign error', function(done) {
    Person.new(function(err, person) {
      if (err) { done(err); return; }

      person.getErrors().set('name', 'should not be null');

      assert.deepEqual(person.getErrors().get('name'), ['should not be null']);

      done();
    });
  });

  test('#add an error message on a specific attribute', function(done) {
    Person.new(function(err, person) {
      if (err) { done(err); return; }

      person.getErrors().add('name', 'cannot be blank');
      assert.deepEqual(person.getErrors().get('name'), ['cannot be blank']);

      done();
    });
  });

  test('#add an error with a symbol', function(done) {
    Person.new(function(err, person) {
      if (err) { done(err); return; }

      person.getErrors().add('name', ':blank');
      var message = person.getErrors().generateMessage('name', ':blank');

      assert.deepEqual([message], person.getErrors().get('name'));

      done();
    });
  });

  test('#add an error with a function', function(done) {
    Person.new(function(err, person) {
      if (err) { done(err); return; }

      var message = function() { return 'cannot be blank'; };
      person.getErrors().add('name', message);

      assert.deepEqual(person.getErrors().get('name'), ['cannot be blank']);

      done();
    });
  });

  test('#added detects if a specific error was added to the object', function(done) {
    Person.new(function(err, person) {
      if (err) { done(err); return; }

      person.getErrors().add('name', 'cannot be blank');

      assert.strictEqual(person.getErrors().added('name', 'cannot be blank'), true);

      done();
    });
  });

  test('#added handles symbol message', function(done) {
    Person.new(function(err, person) {
      if (err) { done(err); return; }

      person.getErrors().add('name', ':blank');
      assert.strictEqual(person.getErrors().added('name', ':blank'), true);

      done();
    });
  });

  test('#added handles function messages', function(done) {
    Person.new(function(err, person) {
      if (err) { done(err); return; }

      var message = function() { return 'cannot be blank'; };
      person.getErrors().add('name', message);

      assert.strictEqual(person.getErrors().added('name', message), true);

      done();
    });
  });

  test('#added defaults message to :invalid', function(done) {
    Person.new(function(err, person) {
      if (err) { done(err); return; }

      person.getErrors().add('name');
      assert.strictEqual(person.getErrors().added('name'), true);

      done();
    });
  });

  test('#added matches the given message when several errors are present for the same attribute', function(done) {
    Person.new(function(err, person) {
      if (err) { done(err); return; }

      person.getErrors().add('name', 'cannot be blank');
      person.getErrors().add('name', 'is invalid');

      assert.strictEqual(person.getErrors().added('name', 'cannot be blank'), true);

      done();
    });
  });

  test('#added returns false when no errors are present', function(done) {
    Person.new(function(err, person) {
      if (err) { done(err); return; }

      assert.strictEqual(person.getErrors().added('name'), false);

      done();
    });
  });

  test('#added returns false when checking a nonexisting error and other errors are present for the given attribute', function(done) {
    Person.new(function(err, person) {
      if (err) { done(err); return; }

      person.getErrors().add('name', 'is invalid');

      assert.strictEqual(person.getErrors().added('name', 'cannot be blank'), false);

      done();
    });
  });

  test('#getSize calculates the number of error messages', function(done) {
    Person.new(function(err, person) {
      if (err) { done(err); return; }

      person.getErrors().add('name', 'cannot be blank');
      assert.equal(1, person.getErrors().getSize());

      done();
    });
  });

  test('#toArray returns the list of errors with complete messages containing the attribute names', function(done) {
    Person.new(function(err, person) {
      if (err) { done(err); return; }

      person.getErrors().add('name', 'cannot be blank');
      person.getErrors().add('name', 'cannot be null');

      assert.deepEqual(person.getErrors().toArray(), ['Name cannot be blank', 'Name cannot be null']);

      done();
    });
  });

  test('#toHash returns the error messages hash', function(done) {
    Person.new(function(err, person) {
      if (err) { done(err); return; }

      person.getErrors().add('name', 'cannot be blank');
      assert.deepEqual({ name: ['cannot be blank'] }, person.getErrors().toHash());

      done();
    });
  });

  test('#getFullMessages creates a list of error messages with the attribute name included', function(done) {
    Person.new(function(err, person) {
      if (err) { done(err); return; }

      person.getErrors().add('name', 'cannot be blank');
      person.getErrors().add('name', 'cannot be null');
      assert.deepEqual(person.getErrors().getFullMessages(), ['Name cannot be blank', 'Name cannot be null']);

      done();
    });
  });

  test('#getFullMessagesFor contains all the error messages for the given attribute', function(done) {
    Person.new(function(err, person) {
      if (err) { done(err); return; }

      person.getErrors().add('name', 'cannot be blank');
      person.getErrors().add('name', 'cannot be null');

      assert.deepEqual(person.getErrors().getFullMessagesFor('name'), ['Name cannot be blank', 'Name cannot be null']);

      done();
    });
  });

  test('#getFullMessagesFor does not contain error messages from other attributes', function(done) {
    Person.new(function(err, person) {
      if (err) { done(err); return; }

      person.getErrors().add('name', 'cannot be blank');
      person.getErrors().add('email', 'cannot be blank');

      assert.deepEqual(person.getErrors().getFullMessagesFor('name'), ['Name cannot be blank']);

      done();
    });
  });

  test('#getFullMessagesFor returns an empty list in case there are no errors for the given attribute', function(done) {
    Person.new(function(err, person) {
      if (err) { done(err); return; }

      person.getErrors().add('name', 'cannot be blank');
      assert.deepEqual([], person.getErrors().getFullMessagesFor('email'));

      done();
    });
  });

  test('#getFullMessage returns the given message when attribute is ":base"', function(done) {
    Person.new(function(err, person) {
      if (err) { done(err); return; }

      assert.equal(person.getErrors().getFullMessage(':base', 'press the button'), 'press the button');

      done();
    });
  });

  test('#getFullMessage returns the given message with the attribute name included', function(done) {
    Person.new(function(err, person) {
      if (err) { done(err); return; }

      assert.equal(person.getErrors().getFullMessage('name', 'cannot be blank'), 'Name cannot be blank');
      assert.equal(person.getErrors().getFullMessage('name_test', 'cannot be blank'), 'Name test cannot be blank');

      done();
    });
  });

  test('#toJSON creates a json formatted representation of the errors hash', function(done) {
    Person.new(function(err, person) {
      if (err) { done(err); return; }

      person.validate();

      assert.equal(person.getErrors().toJSON(), '{"name":["cannot be null"]}');

      done();
    });
  });

  test('#toJSON with fullMessages option creates a json formatted representation of the errors containing complete messages', function(done) {
    Person.new(function(err, person) {
      if (err) { done(err); return; }

      person.validate();

      assert.equal(person.getErrors().toJSON({ fullMessages: true }), '{"name":["Name cannot be null"]}');

      done();
    });
  });

  test('#addOnEmpty generates message', function(done) {
    Person.new(function(err, person) {
      if (err) { done(err); return; }

      var generateMessage = sinon.spy(person.getErrors(), 'generateMessage');

      person.getErrors().addOnEmpty('name');

      assert(generateMessage.withArgs('name', ':empty', {}).calledOnce);

      done();
    });
  });

  test('#addOnEmpty generates message for multiple attributes', function(done) {
    Person.new(function(err, person) {
      if (err) { done(err); return; }

      var generateMessage = sinon.spy(person.getErrors(), 'generateMessage');

      person.getErrors().addOnEmpty(['name', 'age']);

      assert(generateMessage.withArgs('name', ':empty', {}).calledOnce);
      assert(generateMessage.withArgs('age', ':empty', {}).calledOnce);

      done();
    });
  });

  test('#addOnEmpty generates message with custom default message', function(done) {
    Person.new(function(err, person) {
      if (err) { done(err); return; }

      var generateMessage = sinon.spy(person.getErrors(), 'generateMessage');

      person.getErrors().addOnEmpty('name', { message: 'custom' });

      assert(generateMessage.withArgs('name', ':empty', { message: 'custom' }).calledOnce);

      done();
    });
  });

  test('#addOnEmpty generates message with empty string value', function(done) {
    Person.new(function(err, person) {
      if (err) { done(err); return; }

      person.setName('');

      var generateMessage = sinon.spy(person.getErrors(), 'generateMessage');

      person.getErrors().addOnEmpty('name');

      assert(generateMessage.withArgs('name', ':empty', {}).calledOnce);

      done();
    });
  });

  test('#addOnBlank generates message', function(done) {
    Person.new(function(err, person) {
      if (err) { done(err); return; }

      var generateMessage = sinon.spy(person.getErrors(), 'generateMessage');

      person.getErrors().addOnBlank('name');

      assert(generateMessage.withArgs('name', ':blank', {}).calledOnce);

      done();
    });
  });

  test('#addOnBlank generates message for multiple attributes', function(done) {
    Person.new(function(err, person) {
      if (err) { done(err); return; }

      var generateMessage = sinon.spy(person.getErrors(), 'generateMessage');

      person.getErrors().addOnBlank(['name', 'age']);

      assert(generateMessage.withArgs('name', ':blank', {}).calledOnce);
      assert(generateMessage.withArgs('age', ':blank', {}).calledOnce);

      done();
    });
  });

  test('#addOnBlank generates message with custom default message', function(done) {
    Person.new(function(err, person) {
      if (err) { done(err); return; }

      var generateMessage = sinon.spy(person.getErrors(), 'generateMessage');

      person.getErrors().addOnBlank('name', { message: 'custom' });

      assert(generateMessage.withArgs('name', ':blank', { message: 'custom' }).calledOnce);

      done();
    });
  });
});
