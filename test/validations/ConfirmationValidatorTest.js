'use strict';

var _       = require('lodash-node');
var assert  = require('assert');
var Rejoin  = require('../../');
var Topic   = require('../models/Topic');
var I18n    = require('counterpart');

suite('confirmation validator', function() {
  var translations;

  setup(function() {
    translations = _.clone(I18n.__registry.translations);
    I18n.__registry.translations = {};
  });

  teardown(function() {
    I18n.__registry.translations = translations;
    Topic.clearValidations();
  });

  test('no title confirmation', function(done) {
    Topic.validatesConfirmationOf('title');

    Topic.new({ author_name: 'Plutarch' }, function(err, topic) {
      if (err) { done(err); return; }

      topic.validate(function(err, valid) {
        if (err) { done(err); return; }

        assert(valid);

        topic.setTitleConfirmation('Parallel Lives');

        topic.validate(function(err, valid) {
          if (err) { done(err); return; }

          assert(!valid);

          topic.setTitleConfirmation(null);
          topic.setTitle('Parallel Lives');

          topic.validate(function(err, valid) {
            if (err) { done(err); return; }

            // active model assert validity here
            assert(!valid);

            topic.setTitleConfirmation('Parallel Lives');

            topic.validate(function(err, valid) {
              if (err) { done(err); return; }

              assert(valid);

              done();
            });
          });
        });
      });
    });
  });

  test('no title confirmation', function(done) {
    Topic.validatesConfirmationOf('title');

    Topic.new({ title: 'We should be confirmed', title_confirmation: '' }, function(err, topic) {
      if (err) { done(err); return; }

      topic.validate(function(err, valid) {
        if (err) { done(err); return; }

        assert(!valid);

        topic.setTitleConfirmation('We should be confirmed');

        topic.validate(function(err, valid) {
          if (err) { done(err); return; }

          assert(valid);

          done();
        });
      });
    });
  });

  test('title confirmation with i18n attribute', function(done) {
    I18n.registerTranslations('en', {
      rejoin: {
        errors: {
          messages: {
            confirmation: 'doesn\'t match %(attribute)s'
          }
        },

        attributes: {
          topic: {
            title: 'Test Title'
          }
        }
      }
    });

    Topic.validatesConfirmationOf('title');

    Topic.new({ title: 'We should be confirmed', title_confirmation: '' }, function(err, topic) {
      if (err) { done(err); return; }

      topic.validate(function(err, valid) {
        if (err) { done(err); return; }

        assert(!valid);
        assert.deepEqual(topic.getErrors().get('title_confirmation'), ['doesn\'t match Test Title']);

        done();
      });
    });
  });

  test('does not override confirmation reader if present', function(done) {
    var model = Rejoin.createModel('Model1', function(model) {
      model.validatesConfirmationOf('title');

      model.instanceMethods({
        getTitleConfirmation: function() {
          return 'expected title';
        }
      });
    });

    model.validatesConfirmationOf('title');

    model.new(function(err, record) {
      if (err) { done(err); return; }

      assert.equal(record.getTitleConfirmation(), 'expected title');

      done();
    });
  });

  test('does not override confirmation writer if present', function(done) {
    var model = Rejoin.createModel('Model2', function(model) {
      model.validatesConfirmationOf('title');

      model.instanceMethods({
        titleConfirmation: null,

        setTitleConfirmation: function(value) {
          this.titleConfirmation = value;
        }
      });
    });

    model.validatesConfirmationOf('title');

    model.new(function(err, record) {
      if (err) { done(err); return; }

      record.setTitleConfirmation('expected title');

      assert.equal(record.titleConfirmation, 'expected title');

      done();
    });
  });
});
