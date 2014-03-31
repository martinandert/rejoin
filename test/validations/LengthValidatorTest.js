'use strict';

var assert  = require('assert');
var async   = require('async');
var Topic   = require('../models/Topic');

suite('length validator', function() {
  teardown(function() {
    Topic.clearValidations();
  });

  test('validatesLengthOf with allowNull', function(done) {
    Topic.validatesLengthOf('title', { is: 5, allowNull: true });

    async.parallel([
      tc({ title: 'ab'    }, false),
      tc({ title: ''      }, false),
      tc({ title: null    }, true),
      tc({ title: 'abcde' }, true)
    ], done);

    function tc(attrs, result) {
      return function(cb) {
        Topic.new(attrs, function(err, topic) {
          if (err) { cb(err); return; }

          topic.validate(function(err, valid) {
            if (err) { cb(err); return; }
            assert.strictEqual(result, valid);
            cb();
          });
        });
      };
    }
  });

  test('validatesLengthOf with allowBlank', function(done) {
    Topic.validatesLengthOf('title', { is: 5, allowBlank: true });

    async.parallel([
      tc({ title: 'ab'    }, false),
      tc({ title: ''      }, true),
      tc({ title: null    }, true),
      tc({ title: 'abcde' }, true)
    ], done);

    function tc(attrs, result) {
      return function(cb) {
        Topic.new(attrs, function(err, topic) {
          if (err) { cb(err); return; }

          topic.validate(function(err, valid) {
            if (err) { cb(err); return; }
            assert.strictEqual(result, valid);
            cb();
          });
        });
      };
    }
  });

  test('validatesLengthOf using minimum', function(done) {
    Topic.validatesLengthOf('title', { minimum: 5 });

    Topic.new({ title: 'valid', content: 'whatever' }, function(err, topic) {
      if (err) { done(err); return; }

      topic.validate(function(err, valid) {
        if (err) { done(err); return; }

        assert(valid);

        async.series([
          tc('not'),
          tc(''),
          tc(null)
        ], done);
      });

      function tc(title) {
        return function(cb) {
          topic.setTitle(title);

          topic.validate(function(err, valid) {
            if (err) { cb(err); return; }
            assert(!valid);
            assert.deepEqual(['is too short (minimum is 5 characters)'], topic.getErrors().get('title'));
            cb();
          });
        };
      }
    });
  });

  test('optionally validatesLengthOf using minimum', function(done) {
    Topic.validatesLengthOf('title', { minimum: 5, allowNull: true });

    Topic.new({ title: 'valid', content: 'whatever' }, function(err, topic) {
      if (err) { done(err); return; }

      topic.validate(function(err, valid) {
        if (err) { done(err); return; }
        assert(valid);

        topic.setTitle(null);

        topic.validate(function(err, valid) {
          if (err) { done(err); return; }
          assert(valid);
          done();
        });
      });
    });
  });

  test('validatesLengthOf using maximum should allow null', function(done) {
    Topic.validatesLengthOf('title', { maximum: 10 });

    Topic.new(function(err, topic) {
      if (err) { done(err); return; }

      topic.validate(function(err, valid) {
        if (err) { done(err); return; }
        assert(valid);
        done();
      });
    });
  });

  test('validatesLengthOf using maximum', function(done) {
    Topic.validatesLengthOf('title', { maximum: 5 });

    Topic.new({ title: 'valid', content: 'whatever' }, function(err, topic) {
      if (err) { done(err); return; }

      topic.validate(function(err, valid) {
        if (err) { done(err); return; }
        assert(valid);

        topic.setTitle('notvalid');

        topic.validate(function(err, valid) {
          if (err) { done(err); return; }

          assert(!valid);
          assert.deepEqual(['is too long (maximum is 5 characters)'], topic.getErrors().get('title'));

          topic.setTitle('');

          topic.validate(function(err, valid) {
            if (err) { done(err); return; }
            assert(valid);
            done();
          });
        });
      });
    });
  });

  test('optionally validatesLengthOf using maximum', function(done) {
    Topic.validatesLengthOf('title', { maximum: 5, allowNull: true });

    Topic.new({ title: 'valid', content: 'whatever' }, function(err, topic) {
      if (err) { done(err); return; }

      topic.validate(function(err, valid) {
        if (err) { done(err); return; }
        assert(valid);

        topic.setTitle(null);

        topic.validate(function(err, valid) {
          if (err) { done(err); return; }
          assert(valid);
          done();
        });
      });
    });
  });

  test('validatesLengthOf using is', function(done) {
    Topic.validatesLengthOf('title', { is: 5 });

    Topic.new({ title: 'valid', content: 'whatever' }, function(err, topic) {
      if (err) { done(err); return; }

      topic.validate(function(err, valid) {
        if (err) { done(err); return; }
        assert(valid);

        topic.setTitle('notvalid');

        topic.validate(function(err, valid) {
          if (err) { done(err); return; }

          assert(!valid);
          assert.deepEqual(['is the wrong length (should be 5 characters)'], topic.getErrors().get('title'));

          topic.setTitle('');

          topic.validate(function(err, valid) {
            if (err) { done(err); return; }
            assert(!valid);

            topic.setTitle(null);

            topic.validate(function(err, valid) {
              if (err) { done(err); return; }
              assert(!valid);
              done();
            });
          });
        });
      });
    });
  });

  test('optionally validatesLengthOf using is', function(done) {
    Topic.validatesLengthOf('title', { is: 5, allowNull: true });

    Topic.new({ title: 'valid', content: 'whatever' }, function(err, topic) {
      if (err) { done(err); return; }

      topic.validate(function(err, valid) {
        if (err) { done(err); return; }
        assert(valid);

        topic.setTitle(null);

        topic.validate(function(err, valid) {
          if (err) { done(err); return; }
          assert(valid);
          done();
        });
      });
    });
  });

  test('validatesLengthOf with invalid args', function() {
    assert.throws(function() { Topic.validatesLengthOf('title', { is: -5 });        });
    assert.throws(function() { Topic.validatesLengthOf('title', { minimum: 'a' });  });
    assert.throws(function() { Topic.validatesLengthOf('title', { maximum: 'a' });  });
    assert.throws(function() { Topic.validatesLengthOf('title', { is: 'a' });       });
  });

  test('validatesLengthOf custom errors for minimum with message', function(done) {
    Topic.validatesLengthOf('title', { minimum: 5, message: 'boo %(count)s' });

    Topic.new({ title: 'uhoh', content: 'whatever' }, function(err, topic) {
      if (err) { done(err); return; }

      topic.validate(function(err, valid) {
        if (err) { done(err); return; }

        assert(!valid);
        assert.deepEqual(['boo 5'], topic.getErrors().get('title'));

        done();
      });
    });
  });

  test('validatesLengthOf custom errors for minimum with tooShort', function(done) {
    Topic.validatesLengthOf('title', { minimum: 5, tooShort: 'hoo %(count)s' });

    Topic.new({ title: 'uhoh', content: 'whatever' }, function(err, topic) {
      if (err) { done(err); return; }

      topic.validate(function(err, valid) {
        if (err) { done(err); return; }

        assert(!valid);
        assert.deepEqual(['hoo 5'], topic.getErrors().get('title'));

        done();
      });
    });
  });

  test('validatesLengthOf custom errors for maximum with message', function(done) {
    Topic.validatesLengthOf('title', { maximum: 5, message: 'boo %(count)s' });

    Topic.new({ title: 'uhohuhoh', content: 'whatever' }, function(err, topic) {
      if (err) { done(err); return; }

      topic.validate(function(err, valid) {
        if (err) { done(err); return; }

        assert(!valid);
        assert.deepEqual(['boo 5'], topic.getErrors().get('title'));

        done();
      });
    });
  });

  test('validatesLengthOf custom errors for maximum with tooLong', function(done) {
    Topic.validatesLengthOf('title', { maximum: 5, tooLong: 'hoo %(count)s' });

    Topic.new({ title: 'uhohuhoh', content: 'whatever' }, function(err, topic) {
      if (err) { done(err); return; }

      topic.validate(function(err, valid) {
        if (err) { done(err); return; }

        assert(!valid);
        assert.deepEqual(['hoo 5'], topic.getErrors().get('title'));

        done();
      });
    });
  });

  test('validatesLengthOf custom errors for is with message', function(done) {
    Topic.validatesLengthOf('title', { is: 5, message: 'boo %(count)s' });

    Topic.new({ title: 'uhohuhoh', content: 'whatever' }, function(err, topic) {
      if (err) { done(err); return; }

      topic.validate(function(err, valid) {
        if (err) { done(err); return; }

        assert(!valid);
        assert.deepEqual(['boo 5'], topic.getErrors().get('title'));

        done();
      });
    });
  });

  test('validatesLengthOf custom errors for is with wrongLength', function(done) {
    Topic.validatesLengthOf('title', { is: 5, wrongLength: 'hoo %(count)s' });

    Topic.new({ title: 'uhohuhoh', content: 'whatever' }, function(err, topic) {
      if (err) { done(err); return; }

      topic.validate(function(err, valid) {
        if (err) { done(err); return; }

        assert(!valid);
        assert.deepEqual(['hoo 5'], topic.getErrors().get('title'));

        done();
      });
    });
  });

  test('validatesLengthOf custom errors for both tooShort and tooLong', function(done) {
    Topic.validatesLengthOf('title', { minimum: 3, maximum: 5, tooShort: 'way too short', tooLong: 'way too long' });

    async.parallel([
      tc({ title: 'a'      }, 'way too short'),
      tc({ title: 'aaaaaa' }, 'way too long')
    ], done);

    function tc(attrs, message) {
      return function(cb) {
        Topic.new(attrs, function(err, topic) {
          if (err) { cb(err); return; }

          topic.validate(function(err, valid) {
            if (err) { cb(err); return; }
            assert(!valid);
            assert.deepEqual([message], topic.getErrors().get('title'));
            cb();
          });
        });
      };
    }
  });

  test('validatesLengthOf using minimum utf8', function(done) {
    Topic.validatesLengthOf('title', { minimum: 5 });

    Topic.new({ title: '一二三四五', content: 'whatever' }, function(err, topic) {
      if (err) { done(err); return; }

      topic.validate(function(err, valid) {
        if (err) { done(err); return; }
        assert(valid);

        topic.setTitle('一二三四');

        topic.validate(function(err, valid) {
          if (err) { done(err); return; }

          assert(!valid);
          assert.deepEqual(['is too short (minimum is 5 characters)'], topic.getErrors().get('title'));

          done();
        });
      });
    });
  });

  test('validatesLengthOf using maximum utf8', function(done) {
    Topic.validatesLengthOf('title', { maximum: 5 });

    Topic.new({ title: '一二三四五', content: 'whatever' }, function(err, topic) {
      if (err) { done(err); return; }

      topic.validate(function(err, valid) {
        if (err) { done(err); return; }
        assert(valid);

        topic.setTitle('一二34五六');

        topic.validate(function(err, valid) {
          if (err) { done(err); return; }

          assert(!valid);
          assert.deepEqual(['is too long (maximum is 5 characters)'], topic.getErrors().get('title'));

          done();
        });
      });
    });
  });

  test('validatesLengthOf using is utf8', function(done) {
    Topic.validatesLengthOf('title', { is: 5 });

    Topic.new({ title: '一二345', content: 'whatever' }, function(err, topic) {
      if (err) { done(err); return; }

      topic.validate(function(err, valid) {
        if (err) { done(err); return; }
        assert(valid);

        topic.setTitle('一二345六');

        topic.validate(function(err, valid) {
          if (err) { done(err); return; }

          assert(!valid);
          assert.deepEqual(['is the wrong length (should be 5 characters)'], topic.getErrors().get('title'));

          done();
        });
      });
    });
  });

  test('validatesLengthOf with tokenizer', function(done) {
    Topic.validatesLengthOf('content', {
      minimum: 5,
      tooShort: 'Your essay must be at least %(count)s words.',
      tokenizer: function(str) { return str.split(/\s+/); }
    });

    Topic.new({ content: 'this content should be long enough' }, function(err, topic) {
      if (err) { done(err); return; }

      topic.validate(function(err, valid) {
        if (err) { done(err); return; }
        assert(valid);

        topic.setContent('not long enough');

        topic.validate(function(err, valid) {
          if (err) { done(err); return; }

          assert(!valid);
          assert.deepEqual(['Your essay must be at least 5 words.'], topic.getErrors().get('content'));

          done();
        });
      });
    });
  });

  test('validatesLengthOf for number', function(done) {
    Topic.validatesLengthOf('approved', { is: 4 });

    Topic.new({ title: 'uhohuhoh', content: 'whatever', approved: 1 }, function(err, topic) {
      if (err) { done(err); return; }

      topic.validate(function(err, valid) {
        if (err) { done(err); return; }

        assert(!valid);
        assert(topic.getErrors().get('approved').length);

        Topic.new({ title: 'uhohuhoh', content: 'whatever', approved: 1234 }, function(err, topic2) {
          if (err) { done(err); return; }

          topic2.validate(function(err, valid) {
            if (err) { done(err); return; }

            assert(valid);

            done();
          });
        });
      });
    });
  });

  test('validatesLengthOf for infinite maxima', function(done) {
    Topic.validatesLengthOf('author_name', { maximum: Infinity });

    Topic.new(function(err, topic) {
      if (err) { done(err); return; }

      topic.setAuthorName('Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores et ea rebum. Stet clita kasd gubergren, no sea takimata sanctus est Lorem ipsum dolor sit amet. Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores et ea rebum. Stet clita kasd gubergren, no sea takimata sanctus est Lorem ipsum dolor sit amet. Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores et ea rebum. Stet clita kasd gubergren, no sea takimata sanctus est Lorem ipsum dolor sit amet. Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores et ea rebum. Stet clita kasd gubergren, no sea takimata sanctus est Lorem ipsum dolor sit amet. Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores et ea rebum. Stet clita kasd gubergren, no sea takimata sanctus est Lorem ipsum dolor sit amet. Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores et ea rebum. Stet clita kasd gubergren, no sea takimata sanctus est Lorem ipsum dolor sit amet. Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores et ea rebum. Stet clita kasd gubergren, no sea takimata sanctus est Lorem ipsum dolor sit amet. Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores et ea rebum. Stet clita kasd gubergren, no sea takimata sanctus est Lorem ipsum dolor sit amet. Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores et ea rebum. Stet clita kasd gubergren, no sea takimata sanctus est Lorem ipsum dolor sit amet. Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores et ea rebum. Stet clita kasd gubergren, no sea takimata sanctus est Lorem ipsum dolor sit amet. Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores et ea rebum. Stet clita kasd gubergren, no sea takimata sanctus est Lorem ipsum dolor sit amet. Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores et ea rebum. Stet clita kasd gubergren, no sea takimata sanctus est Lorem ipsum dolor sit amet. Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores et ea rebum. Stet clita kasd gubergren, no sea takimata sanctus est Lorem ipsum dolor sit amet. Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores et ea rebum. Stet clita kasd gubergren, no sea takimata sanctus est Lorem ipsum dolor sit amet. Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores et ea rebum. Stet clita kasd gubergren, no sea takimata sanctus est Lorem ipsum dolor sit amet. Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores et ea rebum. Stet clita kasd gubergren, no sea takimata sanctus est Lorem ipsum dolor sit amet. Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores et ea rebum. Stet clita kasd gubergren, no sea takimata sanctus est Lorem ipsum dolor sit amet. Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores et ea rebum. Stet clita kasd gubergren, no sea takimata sanctus est Lorem ipsum dolor sit amet. Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores et ea rebum. Stet clita kasd gubergren, no sea takimata sanctus est Lorem ipsum dolor sit amet. Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores et ea rebum. Stet clita kasd gubergren, no sea takimata sanctus est Lorem ipsum dolor sit amet.');

      topic.validate(function(err, valid) {
        if (err) { done(err); return; }

        assert(valid);

        done();
      });
    });
  });

  test('validatesLengthOf using maximum should not allow null when null not allowed', function(done) {
    Topic.validatesLengthOf('title', { maximum: 10, allowNull: false });

    Topic.new(function(err, topic) {
      if (err) { done(err); return; }

      topic.validate(function(err, valid) {
        if (err) { done(err); return; }

        assert(!valid);

        done();
      });
    });
  });

  test('validatesLengthOf using maximum should not allow null and empty string when blank not allowed', function(done) {
    Topic.validatesLengthOf('title', { maximum: 10, allowBlank: false });

    Topic.new(function(err, topic) {
      if (err) { done(err); return; }

      topic.validate(function(err, valid) {
        if (err) { done(err); return; }

        assert(!valid);

        topic.setTitle('');

        topic.validate(function(err, valid) {
          if (err) { done(err); return; }

          assert(!valid);

          done();
        });
      });
    });
  });

  test('validatesLengthOf using both minimum and maximum should not allow null', function(done) {
    Topic.validatesLengthOf('title', { minimum: 5, maximum: 10 });

    Topic.new(function(err, topic) {
      if (err) { done(err); return; }

      topic.validate(function(err, valid) {
        if (err) { done(err); return; }

        assert(!valid);

        done();
      });
    });
  });

  test('validatesLengthOf using minimum 0 should not allow null', function(done) {
    Topic.validatesLengthOf('title', { minimum: 0 });

    Topic.new(function(err, topic) {
      if (err) { done(err); return; }

      topic.validate(function(err, valid) {
        if (err) { done(err); return; }

        assert(!valid);

        topic.setTitle('');

        topic.validate(function(err, valid) {
          if (err) { done(err); return; }

          assert(valid);

          done();
        });
      });
    });
  });

  test('validatesLengthOf using is 0 should not allow null', function(done) {
    Topic.validatesLengthOf('title', { is: 0 });

    Topic.new(function(err, topic) {
      if (err) { done(err); return; }

      topic.validate(function(err, valid) {
        if (err) { done(err); return; }

        assert(!valid);

        topic.setTitle('');

        topic.validate(function(err, valid) {
          if (err) { done(err); return; }

          assert(valid);

          done();
        });
      });
    });
  });

  test('validates with diff in option', function(done) {
    Topic.validatesLengthOf('title', { is: 5 });
    Topic.validatesLengthOf('title', { is: 5, if: function() { return false; } });

    Topic.new({ title: 'david' }, function(err, topic) {
      if (err) { done(err); return; }

      topic.validate(function(err, valid) {
        if (err) { done(err); return; }

        assert(valid);

        Topic.new({ title: 'david2' }, function(err, topic2) {
          if (err) { done(err); return; }

          topic2.validate(function(err, valid) {
            if (err) { done(err); return; }

            assert(!valid);

            done();
          });
        });
      });
    });
  });
});
