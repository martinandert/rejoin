'use strict';

var assert  = require('assert');
var Rejoin  = require('../../');
var Topic   = require('../models/Topic');
var i18n    = require('counterpart');

suite('confirmation validator', function() {
  teardown(function() {
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
    var translations = i18n.__registry.translations;

    i18n.registerTranslations('en', {
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
        assert.deepEqual(['doesn\'t match Test Title'], topic.getErrors().get('title_confirmation'));

        done();
      });
    });

    i18n.__registry.translations = translations;
  });

  test('does not override confirmation reader if present', function(done) {
    var model = Rejoin.createModel('Model1', {
      prototype: {
        getTitleConfirmation: function() {
          return 'expected title';
        }
      }
    });

    model.validatesConfirmationOf('title');

    model.new(function(err, record) {
      if (err) { done(err); return; }

      assert.equal('expected title', record.getTitleConfirmation());

      done();
    });
  });

  test('does not override confirmation writer if present', function(done) {
    var model = Rejoin.createModel('Model1', {
      prototype: {
        titleConfirmation: null,

        setTitleConfirmation: function(value) {
          this.titleConfirmation = value;
        }
      }
    });

    model.validatesConfirmationOf('title');

    model.new(function(err, record) {
      if (err) { done(err); return; }

      record.setTitleConfirmation('expected title');

      assert.equal('expected title', record.titleConfirmation);

      done();
    });
  });
});
