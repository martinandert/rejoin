'use strict';

var assert  = require('assert');
var Rejoin  = require('../../');

function CallbackValidator() {
}

CallbackValidator.prototype.beforeFoo = function(m, done) {
  m.history.push('callback validator beforeFoo');
  done();
};

CallbackValidator.prototype.afterFoo = function(m, done) {
  m.history.push('callback validator afterFoo');
  done();
};

var ModelCallbacks = Rejoin.createModel('ModelCallbacks', function(model) {
  model.defineModelCallbacks('foo');
  model.defineModelCallbacks('bar', { only: Rejoin.CallbackType.AFTER });
  model.defineModelCallbacks('multiple', { only: [Rejoin.CallbackType.BEFORE, Rejoin.CallbackType.AFTER] });
  model.defineModelCallbacks('empty', { only: [] });

  model.beforeFoo('beforeFoo');

  model.beforeFoo(new CallbackValidator());
  model.afterFoo(new CallbackValidator());

  model.afterFoo(function(done) {
    this.history.push('afterFoo');
    done();
  });

  model.instanceMethods({
    initialize: function() {
      this.history = [];
      this.valid = true;

      this._super.apply(this, arguments);
    },

    beforeFoo: function(done) {
      this.history.push('beforeFoo');
      done();
    },

    foo: function() {
      var self = this;

      this.runCallbacks('foo', function(done) { this.history.push('foo'); done(null, self.valid); }, arguments);
    }
  });
});

var Violin = Rejoin.createModel('Violin', function(model) {
  model.defineModelCallbacks('foo');

  model.instanceMethods({
    initialize: function() {
      this.history = [];

      this._super.apply(this, arguments);
    },

    callback1: function(done) {
      this.history.push('callback1');
      done();
    },

    callback2: function(done) {
      this.history.push('callback2');
      done();
    },

    foo: function(cb) {
      this.runCallbacks('foo', cb);
    }
  });
});

var Violin1 = Rejoin.createModel('Violin1', Violin, function(model) {
  model.afterFoo('callback1', 'callback2');
});

var Violin2 = Rejoin.createModel('Violin2', Violin, function(model) {
  model.afterFoo('callback1');
  model.afterFoo('callback2');
});

suite('callbacks mixin', function() {
  test('complete callback chain', function(done) {
    ModelCallbacks.new(function(err, model) {
      if (err) { done(err); return; }

      model.foo(function(err, valid) {
        if (err) { done(err); return; }

        assert.strictEqual(valid, true);
        assert.deepEqual(model.history, ['beforeFoo', 'callback validator beforeFoo', 'foo', 'callback validator afterFoo', 'afterFoo']);

        done();
      });
    });
  });

  test('after callbacks are not executed if invalid', function(done) {
    ModelCallbacks.new(function(err, model) {
      if (err) { done(err); return; }

      model.valid = false;

      model.foo(function(err, valid) {
        if (err) { done(err); return; }

        assert.strictEqual(valid, false);
        assert.deepEqual(model.history, ['beforeFoo', 'callback validator beforeFoo', 'foo']);

        done();
      });
    });
  });

  test('only selects which types of callbacks should be created', function() {
    assert(typeof ModelCallbacks.beforeBar === 'undefined');
    assert(typeof ModelCallbacks.afterBar === 'function');
  });

  test('only selects which types of callbacks should be created from an array list', function() {
    assert(typeof ModelCallbacks.beforeMultiple === 'function');
    assert(typeof ModelCallbacks.aroundMultiple === 'undefined');
    assert(typeof ModelCallbacks.afterMultiple === 'function');
  });

  test('no callbacks should be created', function() {
    assert(typeof ModelCallbacks.beforeEmpty === 'undefined');
    assert(typeof ModelCallbacks.afterEmpty === 'undefined');
  });

  test('afterFoo callbacks with both callbacks declared in one line', function(done) {
    Violin1.new(function(err, violin) {
      if (err) { done(err); return; }

      violin.foo(function(err, valid) {
        if (err) { done(err); return; }

        assert.deepEqual(violin.history, ['callback1', 'callback2']);

        done();
      });
    });
  });

  test('afterFoo callbacks with both callbacks declared in different lines', function(done) {
    Violin2.new(function(err, violin) {
      if (err) { done(err); return; }

      violin.foo(function(err, valid) {
        if (err) { done(err); return; }

        assert.deepEqual(violin.history, ['callback1', 'callback2']);

        done();
      });
    });
  });
});
