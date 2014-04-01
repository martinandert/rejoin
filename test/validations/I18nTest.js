'use strict';

var _       = require('lodash-node');
var assert  = require('assert');
var async   = require('async');
var sinon   = require('sinon');
var I18n    = require('counterpart');
var Topic   = require('../models/Topic');

var COMMON_CASES = [
//[ case,                                validation_options,                        generate_message_options]
  [ 'given no options',                  {},                                        {}                      ],
  [ 'given custom message',              { message: 'custom' },                     { message: 'custom' }   ],
  [ 'given if condition',                { if: function() { return true; } },       {}                      ],
  [ 'given unless condition',            { unless: function() { return false; } },  {}                      ],
  [ 'given option that is not reserved', { format: 'jpg' },                         { format: 'jpg' }       ]
];

var setExpectationsForValidation = function(validation, errorType, fnThatSetsValidation) {
  var attribute = errorType === 'confirmation' ? 'title_confirmation' : 'title';

  test(validation + ' finds custom model key translation when ' + errorType, function(done) {
    var tx1 = {}; tx1[attribute] = {}; tx1[attribute][errorType] = 'custom message';
    var tx2 = {}; tx2[errorType] = 'global message';

    I18n.registerTranslations('en', { rejoin: { errors: { models: { topic: { attributes: tx1 } } } } });
    I18n.registerTranslations('en', { rejoin: { errors: { messages: tx2 } } });

    Topic.new(function(err, topic) {
      if (err) { done(err); return; }

      fnThatSetsValidation(topic, {});

      topic.validate(function(err, valid) {
        if (err) { done(err); return; }

        assert.deepEqual(topic.getErrors().get(attribute), ['custom message']);

        done();
      });
    });
  });

  test(validation + ' finds custom model key translation with interpolation when ' + errorType, function(done) {
    var tx1 = {}; tx1[attribute] = {}; tx1[attribute][errorType] = 'custom message with %(extra)s';
    var tx2 = {}; tx2[errorType] = 'global message';

    I18n.registerTranslations('en', { rejoin: { errors: { models: { topic: { attributes: tx1 } } } } });
    I18n.registerTranslations('en', { rejoin: { errors: { messages: tx2 } } });

    Topic.new(function(err, topic) {
      if (err) { done(err); return; }

      fnThatSetsValidation(topic, { extra: 'extra information' });

      topic.validate(function(err, valid) {
        if (err) { done(err); return; }

        assert.deepEqual(topic.getErrors().get(attribute), ['custom message with extra information']);

        done();
      });
    });
  });

  test(validation + ' finds global default key translation when ' + errorType, function(done) {
    var tx2 = {}; tx2[errorType] = 'global message';

    I18n.registerTranslations('en', { rejoin: { errors: { messages: tx2 } } });

    Topic.new(function(err, topic) {
      if (err) { done(err); return; }

      fnThatSetsValidation(topic, {});

      topic.validate(function(err, valid) {
        if (err) { done(err); return; }

        assert.deepEqual(topic.getErrors().get(attribute), ['global message']);

        done();
      });
    });
  });
};

suite('validation i18n', function() {
  var translations;

  setup(function() {
    translations = _.clone(I18n.__registry.translations);
    I18n.__registry.translations = {};
    I18n.registerTranslations('en', { rejoin: { errors: { messages: { custom: null } } } });
  });

  teardown(function() {
    Topic.clearValidations();
    I18n.__registry.translations = translations;
  });

  test('full message encoding', function(done) {
    I18n.registerTranslations('en', { rejoin: { errors: { messages: { too_short: '猫舌' } } } });

    Topic.validatesLengthOf('title', { minimum: 3, maximum: 5 });

    Topic.new(function(err, topic) {
      if (err) { done(err); return; }

      topic.validate(function(err, valid) {
        if (err) { done(err); return; }

        assert.deepEqual(topic.getErrors().getFullMessages(), ['Title 猫舌']);

        done();
      });
    });
  });

  test('errors full messages uses format', function(done) {
    I18n.registerTranslations('en', { rejoin: { errors: { format: 'Field %(attribute)s %(message)s' } } });

    Topic.new(function(err, topic) {
      if (err) { done(err); return; }

      topic.getErrors().add('title', 'empty');
      assert.deepEqual(topic.getErrors().getFullMessages(), ['Field Title empty']);

      done();
    });
  });

  test('errors full messages translates human attribute name for model attributes', function(done) {
    I18n.registerTranslations('en', { rejoin: { attributes: { topic: { title: 'Topic\'s title' } } } });

    Topic.new(function(err, topic) {
      if (err) { done(err); return; }

      topic.getErrors().add('title', 'not found');

      var method = sinon.spy(Topic, 'getHumanAttributeName');

      assert.deepEqual(topic.getErrors().getFullMessages(), ['Topic\'s title not found']);

      assert(method.calledWithMatch('title', { fallback: 'Title' }));
      assert(method.returned('Topic\'s title'));

      done();
    });
  });

  async.forEach(COMMON_CASES, function(triple, done) {
    var name                    = triple[0];
    var validationOptions       = triple[1];
    var generateMessageOptions  = triple[2];

    test('validatesConfirmationOf on generated message ' + name, function() {
      Topic.validatesConfirmationOf('title', validationOptions);

      Topic.new(function(err, topic) {
        if (err) { done(err); return; }

        topic.setTitleConfirmation('foo');

        var method = sinon.spy(topic.getErrors(), 'generateMessage');

        topic.validate(function(err, valid) {
          if (err) { done(err); return; }

          assert(method.calledWithMatch('title_confirmation', ':confirmation', _.defaults({ attribute: 'Title' }, generateMessageOptions)));

          done();
        });
      });
    });
  });

  async.forEach(COMMON_CASES, function(triple, done) {
    var name                    = triple[0];
    var validationOptions       = triple[1];
    var generateMessageOptions  = triple[2];

    test('validatesAcceptanceOf on generated message ' + name, function() {
      Topic.validatesAcceptanceOf('title', _.defaults({ allowNull: false }, validationOptions));

      Topic.new(function(err, topic) {
        if (err) { done(err); return; }

        var method = sinon.spy(topic.getErrors(), 'generateMessage');

        topic.validate(function(err, valid) {
          if (err) { done(err); return; }

          assert(method.calledWithMatch('title', ':accepted', generateMessageOptions));

          done();
        });
      });
    });
  });

  async.forEach(COMMON_CASES, function(triple, done) {
    var name                    = triple[0];
    var validationOptions       = triple[1];
    var generateMessageOptions  = triple[2];

    test('validatesPresenceOf on generated message ' + name, function() {
      Topic.validatesPresenceOf('title', validationOptions);

      Topic.new(function(err, topic) {
        if (err) { done(err); return; }

        var method = sinon.spy(topic.getErrors(), 'generateMessage');

        topic.validate(function(err, valid) {
          if (err) { done(err); return; }

          assert(method.calledWithMatch('title', ':blank', generateMessageOptions));

          done();
        });
      });
    });
  });

  async.forEach(COMMON_CASES, function(triple, done) {
    var name                    = triple[0];
    var validationOptions       = triple[1];
    var generateMessageOptions  = triple[2];

    test('validatesLengthOf on generated message when too short ' + name, function() {
      Topic.validatesLengthOf('title', _.defaults({ minimum: 3 }, validationOptions));

      Topic.new(function(err, topic) {
        if (err) { done(err); return; }

        var method = sinon.spy(topic.getErrors(), 'generateMessage');

        topic.validate(function(err, valid) {
          if (err) { done(err); return; }

          assert(method.calledWithMatch('title', ':too_short', _.defaults({ count: 3 }, generateMessageOptions)));

          done();
        });
      });
    });
  });

  async.forEach(COMMON_CASES, function(triple, done) {
    var name                    = triple[0];
    var validationOptions       = triple[1];
    var generateMessageOptions  = triple[2];

    test('validatesLengthOf on generated message when too long ' + name, function() {
      Topic.validatesLengthOf('title', _.defaults({ maximum: 5 }, validationOptions));

      Topic.new(function(err, topic) {
        if (err) { done(err); return; }

        topic.setTitle('This title is too long');

        var method = sinon.spy(topic.getErrors(), 'generateMessage');

        topic.validate(function(err, valid) {
          if (err) { done(err); return; }

          assert(method.calledWithMatch('title', ':too_long', _.defaults({ count: 5 }, generateMessageOptions)));

          done();
        });
      });
    });
  });

  async.forEach(COMMON_CASES, function(triple, done) {
    var name                    = triple[0];
    var validationOptions       = triple[1];
    var generateMessageOptions  = triple[2];

    test('validatesLengthOf on generated message when wrong length ' + name, function() {
      Topic.validatesLengthOf('title', _.defaults({ is: 4 }, validationOptions));

      Topic.new(function(err, topic) {
        if (err) { done(err); return; }

        var method = sinon.spy(topic.getErrors(), 'generateMessage');

        topic.validate(function(err, valid) {
          if (err) { done(err); return; }

          assert(method.calledWithMatch('title', ':wrong_length', _.defaults({ count: 4 }, generateMessageOptions)));

          done();
        });
      });
    });
  });

  async.forEach(COMMON_CASES, function(triple, done) {
    var name                    = triple[0];
    var validationOptions       = triple[1];
    var generateMessageOptions  = triple[2];

    test('validatesFormatOf on generated message ' + name, function() {
      Topic.validatesFormatOf('title', _.defaults({ with: /^[1-9][0-9]*$/ }, validationOptions));

      Topic.new(function(err, topic) {
        if (err) { done(err); return; }

        var method = sinon.spy(topic.getErrors(), 'generateMessage');

        topic.setTitle('72x');

        topic.validate(function(err, valid) {
          if (err) { done(err); return; }

          assert(method.calledWithMatch('title', ':invalid', _.defaults({ value: '72x' }, generateMessageOptions)));

          done();
        });
      });
    });
  });

  async.forEach(COMMON_CASES, function(triple, done) {
    var name                    = triple[0];
    var validationOptions       = triple[1];
    var generateMessageOptions  = triple[2];

    test('validatesInclusionOf on generated message ' + name, function() {
      Topic.validatesInclusionOf('title', _.defaults({ in: ['a', 'b', 'c'] }, validationOptions));

      Topic.new(function(err, topic) {
        if (err) { done(err); return; }

        var method = sinon.spy(topic.getErrors(), 'generateMessage');

        topic.setTitle('z');

        topic.validate(function(err, valid) {
          if (err) { done(err); return; }

          assert(method.calledWithMatch('title', ':inclusion', _.defaults({ value: 'z' }, generateMessageOptions)));

          done();
        });
      });
    });
  });

  async.forEach(COMMON_CASES, function(triple, done) {
    var name                    = triple[0];
    var validationOptions       = triple[1];
    var generateMessageOptions  = triple[2];

    test('validatesInclusionOf on generated message using within ' + name, function() {
      Topic.validatesInclusionOf('title', _.defaults({ within: ['a', 'b', 'c'] }, validationOptions));

      Topic.new(function(err, topic) {
        if (err) { done(err); return; }

        var method = sinon.spy(topic.getErrors(), 'generateMessage');

        topic.setTitle('z');

        topic.validate(function(err, valid) {
          if (err) { done(err); return; }

          assert(method.calledWithMatch('title', ':inclusion', _.defaults({ value: 'z' }, generateMessageOptions)));

          done();
        });
      });
    });
  });

  async.forEach(COMMON_CASES, function(triple, done) {
    var name                    = triple[0];
    var validationOptions       = triple[1];
    var generateMessageOptions  = triple[2];

    test('validatesExclusionOf on generated message ' + name, function() {
      Topic.validatesExclusionOf('title', _.defaults({ in: ['a', 'b', 'c'] }, validationOptions));

      Topic.new(function(err, topic) {
        if (err) { done(err); return; }

        var method = sinon.spy(topic.getErrors(), 'generateMessage');

        topic.setTitle('a');

        topic.validate(function(err, valid) {
          if (err) { done(err); return; }

          assert(method.calledWithMatch('title', ':exclusion', _.defaults({ value: 'a' }, generateMessageOptions)));

          done();
        });
      });
    });
  });

  async.forEach(COMMON_CASES, function(triple, done) {
    var name                    = triple[0];
    var validationOptions       = triple[1];
    var generateMessageOptions  = triple[2];

    test('validatesExclusionOf on generated message using within ' + name, function() {
      Topic.validatesExclusionOf('title', _.defaults({ within: ['a', 'b', 'c'] }, validationOptions));

      Topic.new(function(err, topic) {
        if (err) { done(err); return; }

        var method = sinon.spy(topic.getErrors(), 'generateMessage');

        topic.setTitle('a');

        topic.validate(function(err, valid) {
          if (err) { done(err); return; }

          assert(method.calledWithMatch('title', ':exclusion', _.defaults({ value: 'a' }, generateMessageOptions)));

          done();
        });
      });
    });
  });

  async.forEach(COMMON_CASES, function(triple, done) {
    var name                    = triple[0];
    var validationOptions       = triple[1];
    var generateMessageOptions  = triple[2];

    test('validatesNumericalityOf on generated message ' + name, function() {
      Topic.validatesNumericalityOf('title', validationOptions);

      Topic.new(function(err, topic) {
        if (err) { done(err); return; }

        var method = sinon.spy(topic.getErrors(), 'generateMessage');

        topic.setTitle('a');

        topic.validate(function(err, valid) {
          if (err) { done(err); return; }

          assert(method.calledWithMatch('title', ':not_a_number', _.defaults({ value: 'a' }, generateMessageOptions)));

          done();
        });
      });
    });
  });

  async.forEach(COMMON_CASES, function(triple, done) {
    var name                    = triple[0];
    var validationOptions       = triple[1];
    var generateMessageOptions  = triple[2];

    test('validatesNumericalityOf for onlyInteger on generated message ' + name, function() {
      Topic.validatesNumericalityOf('title', _.defaults({ onlyInteger: true }, validationOptions));

      Topic.new(function(err, topic) {
        if (err) { done(err); return; }

        var method = sinon.spy(topic.getErrors(), 'generateMessage');

        topic.setTitle('0.1');

        topic.validate(function(err, valid) {
          if (err) { done(err); return; }

          assert(method.calledWithMatch('title', ':not_an_integer', _.defaults({ value: '0.1' }, generateMessageOptions)));

          done();
        });
      });
    });
  });

  async.forEach(COMMON_CASES, function(triple, done) {
    var name                    = triple[0];
    var validationOptions       = triple[1];
    var generateMessageOptions  = triple[2];

    test('validatesNumericalityOf for odd on generated message ' + name, function() {
      Topic.validatesNumericalityOf('title', _.defaults({ onlyInteger: true, odd: true }, validationOptions));

      Topic.new(function(err, topic) {
        if (err) { done(err); return; }

        var method = sinon.spy(topic.getErrors(), 'generateMessage');

        topic.setTitle(0);

        topic.validate(function(err, valid) {
          if (err) { done(err); return; }

          assert(method.calledWithMatch('title', ':odd', _.defaults({ value: 0 }, generateMessageOptions)));

          done();
        });
      });
    });
  });

  async.forEach(COMMON_CASES, function(triple, done) {
    var name                    = triple[0];
    var validationOptions       = triple[1];
    var generateMessageOptions  = triple[2];

    test('validatesNumericalityOf for lessThan on generated message ' + name, function() {
      Topic.validatesNumericalityOf('title', _.defaults({ onlyInteger: true, lessThan: 0 }, validationOptions));

      Topic.new(function(err, topic) {
        if (err) { done(err); return; }

        var method = sinon.spy(topic.getErrors(), 'generateMessage');

        topic.setTitle(1);

        topic.validate(function(err, valid) {
          if (err) { done(err); return; }

          assert(method.calledWithMatch('title', ':less_than', _.defaults({ value: 1, count: 0 }, generateMessageOptions)));

          done();
        });
      });
    });
  });

  setExpectationsForValidation('validatesConfirmationOf', 'confirmation', function(topic, optionsToMerge) {
    Topic.validatesConfirmationOf('title', optionsToMerge);
    topic.setTitleConfirmation('foo');
  });

  setExpectationsForValidation('validatesAcceptanceOf', 'accepted', function(topic, optionsToMerge) {
    Topic.validatesAcceptanceOf('title', _.defaults({ allowNull: false }, optionsToMerge));
  });

  setExpectationsForValidation('validatesPresenceOf', 'blank', function(topic, optionsToMerge) {
    Topic.validatesPresenceOf('title', optionsToMerge);
  });

  setExpectationsForValidation('validatesLengthOf', 'too_short', function(topic, optionsToMerge) {
    Topic.validatesLengthOf('title', _.defaults({ minimum: 3 }, optionsToMerge));
  });

  setExpectationsForValidation('validatesLengthOf', 'too_long', function(topic, optionsToMerge) {
    Topic.validatesLengthOf('title', _.defaults({ maximum: 5 }, optionsToMerge));
    topic.setTitle('too long');
  });

  setExpectationsForValidation('validatesLengthOf', 'wrong_length', function(topic, optionsToMerge) {
    Topic.validatesLengthOf('title', _.defaults({ is: 4 }, optionsToMerge));
  });

  setExpectationsForValidation('validatesFormatOf', 'invalid', function(topic, optionsToMerge) {
    Topic.validatesFormatOf('title', _.defaults({ with: /^[1-9][0-9]*$/ }, optionsToMerge));
  });

  setExpectationsForValidation('validatesInclusionOf', 'inclusion', function(topic, optionsToMerge) {
    Topic.validatesInclusionOf('title', _.defaults({ in: ['a', 'b', 'c'] }, optionsToMerge));
  });

  setExpectationsForValidation('validatesExclusionOf', 'exclusion', function(topic, optionsToMerge) {
    Topic.validatesExclusionOf('title', _.defaults({ in: ['a', 'b', 'c'] }, optionsToMerge));
    topic.setTitle('a');
  });

  setExpectationsForValidation('validatesNumericalityOf', 'not_a_number', function(topic, optionsToMerge) {
    Topic.validatesNumericalityOf('title', optionsToMerge);
    topic.setTitle('a');
  });

  setExpectationsForValidation('validatesNumericalityOf', 'not_an_integer', function(topic, optionsToMerge) {
    Topic.validatesNumericalityOf('title', _.defaults({ onlyInteger: true }, optionsToMerge));
    topic.setTitle('0.1');
  });

  setExpectationsForValidation('validatesNumericalityOf', 'odd', function(topic, optionsToMerge) {
    Topic.validatesNumericalityOf('title', _.defaults({ onlyInteger: true, odd: true }, optionsToMerge));
    topic.setTitle(0);
  });

  setExpectationsForValidation('validatesNumericalityOf', 'less_than', function(topic, optionsToMerge) {
    Topic.validatesNumericalityOf('title', _.defaults({ onlyInteger: true, lessThan: 0 }, optionsToMerge));
    topic.setTitle(1);
  });

  test('validations with message symbol must translate', function(done) {
    I18n.registerTranslations('en', { rejoin: { errors: { messages: { custom_error: 'I am a custom error' } } } });

    Topic.validatesPresenceOf('title', { message: ':custom_error' });

    Topic.new({ title: null }, function(err, topic) {
      if (err) { done(err); return; }

      topic.validate(function(err, valid) {
        if (err) { done(err); return; }

        assert.deepEqual(topic.getErrors().get('title'), ['I am a custom error']);

        done();
      });
    });
  });

  test('validations with message symbol must translate per attribute', function(done) {
    I18n.registerTranslations('en', { rejoin: { errors: { models: { topic: { attributes: { title: { custom_error: 'I am another custom error' } } } } } } });

    Topic.validatesPresenceOf('title', { message: ':custom_error' });

    Topic.new({ title: null }, function(err, topic) {
      if (err) { done(err); return; }

      topic.validate(function(err, valid) {
        if (err) { done(err); return; }

        assert.deepEqual(topic.getErrors().get('title'), ['I am another custom error']);

        done();
      });
    });
  });

  test('validations with message symbol must translate per model', function(done) {
    I18n.registerTranslations('en', { rejoin: { errors: { models: { topic: { custom_error: 'I am just a custom error' } } } } });

    Topic.validatesPresenceOf('title', { message: ':custom_error' });

    Topic.new({ title: null }, function(err, topic) {
      if (err) { done(err); return; }

      topic.validate(function(err, valid) {
        if (err) { done(err); return; }

        assert.deepEqual(topic.getErrors().get('title'), ['I am just a custom error']);

        done();
      });
    });
  });

  test('validations with message string', function(done) {
    Topic.validatesPresenceOf('title', { message: 'Here is a custom error' });

    Topic.new({ title: null }, function(err, topic) {
      if (err) { done(err); return; }

      topic.validate(function(err, valid) {
        if (err) { done(err); return; }

        assert.deepEqual(topic.getErrors().get('title'), ['Here is a custom error']);

        done();
      });
    });
  });
});
