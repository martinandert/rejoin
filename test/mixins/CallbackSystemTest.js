'use strict';

var _       = require('lodash-node');
var assert  = require('assert');
var async   = require('async');
var Rejoin  = require('../../');

var CallbackSystem = require('../../lib/mixins/CallbackSystem');
var Type    = Rejoin.CallbackType;

var NewBase = Rejoin.createModel('NewBase', Rejoin.models.Model);

var MySuper = Rejoin.createModel('MySuper', NewBase, function(model) {
  model.mixin(CallbackSystem);
  model.defineCallbacks('save');
});

var Record = Rejoin.createModel('Record', NewBase, function(model) {
  model.mixin(CallbackSystem);

  model.defineCallbacks('save');

  model.classMethods({
    beforeSave: function() {
      this.setCallback.apply(this, ['save', Type.BEFORE].concat(_.toArray(arguments)));
    },

    afterSave: function() {
      this.setCallback.apply(this, ['save', Type.AFTER].concat(_.toArray(arguments)));
    },
  });

  model.classMethods({
    callbackString: function(callbackMethod) {
      var methodName = callbackMethod + 'Method';

      this.prototype[methodName] = function(done) {
        this.getHistory().push([callbackMethod, 'string']);
        done();
      };

      return methodName;
    },

    callbackFunction: function(callbackMethod) {
      return function(done) {
        this.getHistory().push([callbackMethod, 'function']);
        done();
      };
    },

    callbackObject: function(callbackMethod) {
      var Klass = function() {};

      Klass.prototype[callbackMethod] = function(model, done) {
        model.getHistory().push([callbackMethod + 'Save', 'object']);
        done();
      };

      return new Klass();
    }
  });

  model.instanceMethod('getHistory', function() {
    if (typeof this._history === 'undefined') {
      this._history = [];
    }

    return this._history;
  });
});

var OneTimeCompile = Rejoin.createModel('OneTimeCompile', Record, function(model) {
  model.classMethods({
    startsTrue: true,
    startsFalse: false
  });

  model.beforeSave(function(done) { this.getHistory().push(['beforeSave', 'startsTrue',  'if']);     done(); }, { if: 'startsTrue' });
  model.beforeSave(function(done) { this.getHistory().push(['beforeSave', 'startsFalse', 'if']);     done(); }, { if: 'startsFalse' });
  model.beforeSave(function(done) { this.getHistory().push(['beforeSave', 'startsTrue',  'unless']); done(); }, { unless: 'startsTrue' });
  model.beforeSave(function(done) { this.getHistory().push(['beforeSave', 'startsFalse', 'unless']); done(); }, { unless: 'startsFalse' });

  model.instanceMethods({
    startsTrue: function() {
      if (this.constructor.startsTrue) {
        this.constructor.startsTrue = false;
        return true;
      }

      return this.constructor.startsTrue;
    },

    startsFalse: function() {
      if (!this.constructor.startsFalse) {
        this.constructor.startsFalse = true;
        return false;
      }

      return this.constructor.startsFalse;
    },

    save: function(callback) {
      this.runCallbacks('save', callback);
    }
  });
});

var AfterSaveConditionalPerson = Rejoin.createModel('AfterSaveConditionalPerson', Record, function(model) {
  model.afterSave(function(done) { this.getHistory().push(['afterSave', 'string1']); done(); });
  model.afterSave(function(done) { this.getHistory().push(['afterSave', 'string2']); done(); });

  model.instanceMethod('save', function(callback) {
    this.runCallbacks('save', callback);
  });
});

var AroundPerson = Rejoin.createModel('AroundPerson', MySuper, function(model) {
  model.setCallback('save', Type.BEFORE, 'nope',          { if:      'no' });
  model.setCallback('save', Type.BEFORE, 'nope',          { unless:  'yes' });
  model.setCallback('save', Type.AFTER,  'tweedle');
  model.setCallback('save', Type.BEFORE, 'tweedleDee');
  model.setCallback('save', Type.BEFORE, function(done) { this.history.push('yup1'); done(); });
  model.setCallback('save', Type.BEFORE, 'nope',          { if:      function() { return false; } });
  model.setCallback('save', Type.BEFORE, 'nope',          { unless:  function() { return true; } });
  model.setCallback('save', Type.BEFORE, 'yup2',           { if:      function() { return true; } });
  model.setCallback('save', Type.BEFORE, 'yup2',           { unless:  function() { return false; } });
  model.setCallback('save', Type.AFTER,  'w0tyes',        { if: 'yes' });
  model.setCallback('save', Type.AFTER,  'boom',          { if: 'no' });
  model.setCallback('save', Type.AFTER, function(done) { this.history.push('after'); done(); });

  model.instanceMethods({
    initialize: function() {
      this.history = [];
      this._super.apply(this, arguments);
    },

    no: function() { return false; },
    yes: function() { return true; },

    nope: function(done) { this.history.push('boom'); done(); },
    yup: function(done) { this.history.push('yup'); done(); },
    yup1: function(done) { this.history.push('yup1'); done(); },
    yup2: function(done) { this.history.push('yup2'); done(); },
    tweedle: function(done) { this.history.push('tweedle'); done(); },
    tweedleDee: function(done) { this.history.push('tweedleDee'); done(); },
    w0tyes: function(done) { this.history.push('w0tyes'); done(); },

    save: function(callback) {
      this.runCallbacks('save', function(cb) { this.history.push('running'); cb(null, 'FOO'); }, callback);
    }
  });
});

var CallbackClass = {
  before: function(model, done) {
    model.getHistory().push(['beforeSave', 'class']);
    done();
  },

  after: function(model, done) {
    model.getHistory().push(['afterSave', 'class']);
    done();
  }
};

var Person = Rejoin.createModel('AnotherPerson', Record, function(model) {
  _.forEach(['beforeSave', 'afterSave'], function(callbackMethod) {
    model[callbackMethod](model.callbackString(callbackMethod));
    model[callbackMethod](model.callbackFunction(callbackMethod));
    model[callbackMethod](model.callbackObject(callbackMethod.replace(/Save$/, '')));
    model[callbackMethod](CallbackClass);
    model[callbackMethod](function(done) { this.getHistory().push([callbackMethod, 'block']); done(); });
  });

  model.instanceMethod('save', function(callback) {
    this.runCallbacks('save', callback);
  });
});

var PersonSkipper = Rejoin.createModel('PersonSkipper', Person, function(model) {
  model.skipCallback('save', Type.BEFORE, 'beforeSaveMethod', { if: 'yes' });
  model.skipCallback('save', Type.AFTER,  'beforeSaveMethod', { unless: 'yes' });
  model.skipCallback('save', Type.AFTER,  'beforeSaveMethod', { if: 'no' });
  model.skipCallback('save', Type.BEFORE, 'beforeSaveMethod', { unless: 'no' });
  model.skipCallback('save', Type.BEFORE,  CallbackClass, { if: 'yes' });

  model.instanceMethods({
    yes: function() { return true; },
    no:  function() { return false; }
  });
});

var PersonForProgrammaticSkipping = Rejoin.createModel('PersonForProgrammaticSkipping', Person);

var ConditionalPerson = Rejoin.createModel('ConditionalPerson', Record, function(model) {
  // function
  model.beforeSave(function(done) { this.getHistory().push(['beforeSave', 'function']); done(); }, { if: function() { return true; } });
  model.beforeSave(function(done) { this.getHistory().push('boom'); done(); }, { if: function() { return false; } });
  model.beforeSave(function(done) { this.getHistory().push(['beforeSave', 'function']); done(); }, { unless: function() { return false; } });
  model.beforeSave(function(done) { this.getHistory().push('boom'); done(); }, { unless: function() { return true; } });

  // string
  model.beforeSave(function(done) { this.getHistory().push(['beforeSave', 'string']); done(); }, { if: 'yes' });
  model.beforeSave(function(done) { this.getHistory().push('boom'); done(); }, { if: 'no' });
  model.beforeSave(function(done) { this.getHistory().push(['beforeSave', 'string']); done(); }, { unless: 'no' });
  model.beforeSave(function(done) { this.getHistory().push('boom'); done(); }, { unless: 'yes' });

  // combined if and unless
  model.beforeSave(function(done) { this.getHistory().push(['beforeSave', 'combined']); done(); }, { if: 'yes', unless: 'no' });
  model.beforeSave(function(done) { this.getHistory().push('boom'); done(); }, { if: 'yes', unless: 'yes' });

  model.instanceMethods({
    yes: function() { return true; },
    otherYes: function() { return true; },
    no:  function() { return false; },
    otherNo:  function() { return false; }
  });

  model.instanceMethod('save', function(callback) {
    this.runCallbacks('save', callback);
  });
});

var CleanPerson = Rejoin.createModel('CleanPerson', ConditionalPerson, function(model) {
  model.resetCallbacks('save');
});

var CallbackObject = function() {
};

CallbackObject.prototype.before = function(caller, done) {
  caller.record.push('before');
  done();
};

CallbackObject.prototype.beforeSave = function(caller, done) {
  caller.record.push('beforeSave');
  done();
};

var UsingObjectBefore = Rejoin.createModel('UsingObjectBefore', NewBase, function(model) {
  model.mixin(CallbackSystem);
  model.defineCallbacks('save');
  model.setCallback('save', Type.BEFORE, new CallbackObject());

  model.instanceMethods({
    initialize: function() {
      this.record = [];
      this._super.apply(this, arguments);
    },

    save: function(callback) {
      this.runCallbacks('save', function(done) { this.record.push('yielded'); done(); }, callback);
    }
  });
});

var CustomScopeObject = Rejoin.createModel('CustomScopeObject', NewBase, function(model) {
  model.mixin(CallbackSystem);
  model.defineCallbacks('save', { scope: ['type', 'name'] });
  model.setCallback('save', Type.BEFORE, new CallbackObject());

  model.instanceMethods({
    initialize: function() {
      this.record = [];
      this._super.apply(this, arguments);
    },

    save: function(callback) {
      this.runCallbacks('save', function(done) { this.record.push('yielded'); done(null, 'CallbackResult'); }, callback);
    }
  });
});

var CallbackTerminator = Rejoin.createModel('CallbackTerminator', NewBase, function(model) {
  model.mixin(CallbackSystem);
  model.defineCallbacks('save');

  model.setCallback('save', Type.BEFORE, 'first');
  model.setCallback('save', Type.BEFORE, 'second');
  model.setCallback('save', Type.BEFORE, 'third');

  model.setCallback('save', Type.AFTER, 'first');
  model.setCallback('save', Type.AFTER, 'second');
  model.setCallback('save', Type.AFTER, 'third');

  model.instanceMethods({
    initialize: function() {
      this.history = [];
      this.saved = null;
      this.halted = null;
      this._super.apply(this, arguments);
    },

    first: function(done) {
      this.history.push('first');
      done();
    },

    second: function(done) {
      this.history.push('second');
      done(null, true);
    },

    third: function(done) {
      this.history.push('third');
      done();
    },

    save: function(callback) {
      this.runCallbacks('save', function(done) { this.saved = true; done(); }, callback);
    },

    _haltedCallbackHook: function(filter) {
      this.halted = filter;
    }
  });
});

var HyphenatedCallbacks = Rejoin.createModel('HyphenatedCallbacks', NewBase, function(model) {
  model.mixin(CallbackSystem);
  model.defineCallbacks('save');

  model.setCallback('save', Type.BEFORE, 'action', { if: 'yes' });

  model.instanceMethods({
    initialize: function() {
      this.stuff = null;
      this._super.apply(this, arguments);
    },

    yes: function() {
      return true;
    },

    action: function(done) {
      this.stuff = 'ACTION';
      done();
    },

    save: function(callback) {
      this.runCallbacks('save', function(done) { done(null, this.stuff); }, callback);
    }
  });
});

var WriterSkipper = Rejoin.createModel('WriterSkipper', Person, function(model) {
  model.skipCallback('save', Type.BEFORE, 'beforeSaveMethod', { if: function() { return this.age > 21; } });
});

var ExtendModule = function(model) {
  model.instanceMethod('record3', function(done) {
    this.recorder.push(3);
    done();
  });
};

ExtendModule.mixedIn = function(model) {
  model.setCallback('save', Type.BEFORE, 'record3');
};

var IncludeModule = function(model) {
  model.instanceMethod('record2', function(done) {
    this.recorder.push(2);
    done();
  });
};

IncludeModule.mixedIn = function(model) {
  model.setCallback('save', Type.BEFORE, 'record2');
};

var ExtendCallbacks = Rejoin.createModel('ExtendCallbacks', NewBase, function(model) {
  model.mixin(CallbackSystem);
  model.defineCallbacks('save');

  model.setCallback('save', Type.BEFORE, 'record1');

  model.mixin(IncludeModule);

  model.instanceMethods({
    initialize: function() {
      this.recorder = [];
      this._super.apply(this, arguments);
    },

    save: function(callback) {
      this.runCallbacks('save', callback);
    },

    record1: function(done) {
      this.recorder.push(1);
      done();
    }
  });
});

var OneTwoThreeSave = Rejoin.createModel('OneTwoThreeSave', NewBase, function(model) {
  model.mixin(CallbackSystem);
  model.defineCallbacks('save');

  model.instanceMethods({
    initialize: function() {
      this.record = [];
      this._super.apply(this, arguments);
    },

    save: function(callback) {
      this.runCallbacks('save', function(done) {
        this.record.push('yielded');
        done();
      }, callback);
    },

    first: function(done) {
      this.record.push('one');
      done();
    },

    second: function(done) {
      this.record.push('two');
      done();
    },

    third: function(done) {
      this.record.push('three');
      done();
    }
  });
});

var DuplicatingCallbacks = Rejoin.createModel('DuplicatingCallbacks', OneTwoThreeSave, function(model) {
  model.setCallback('save', Type.BEFORE, 'first', 'second');
  model.setCallback('save', Type.BEFORE, 'first', 'third');
});

var DuplicatingCallbacksInSameCall = Rejoin.createModel('DuplicatingCallbacksInSameCall', OneTwoThreeSave, function(model) {
  model.setCallback('save', Type.BEFORE, 'first', 'second', 'first', 'third');
});



function buildModelWithFilter(filter, n) {
  n = n || 1;

  return Rejoin.createModel(_.uniqueId('ModelNo'), NewBase, function(model) {
    model.mixin(CallbackSystem);
    model.defineCallbacks('foo');

    for (var i = 0; i < n; i++) {
      model.setCallback('foo', Type.BEFORE, filter);
    }

    model.instanceMethod('run', function(callback) {
      this.runCallbacks('foo', callback);
    });

    model.classMethod('skip', function(thing) {
      this.skipCallback('foo', Type.BEFORE, thing);
    });
  });
}

function buildModelWithCondition(condition) {
  return Rejoin.createModel(_.uniqueId('ModelNo'), NewBase, function(model) {
    model.mixin(CallbackSystem);
    model.defineCallbacks('foo');
    model.setCallback('foo', Type.BEFORE, 'foo', { if: condition });

    model.instanceMethods({
      foo: function(done) {
        done();
      },

      run: function(callback) {
        this.runCallbacks('foo', callback);
      }
    });
  });
}

function buildModelWithMemo(memo) {
  return Rejoin.createModel(_.uniqueId('ModelNo'), NewBase, function(model) {
    model.mixin(CallbackSystem);
    model.defineCallbacks('foo');
    model.setCallback('foo', Type.BEFORE, 'hello');

    model.instanceMethods({
      hello: function(done) {
        memo.push('hi');
        done();
      },

      run: function(callback) {
        this.runCallbacks('foo', callback);
      }
    });
  });
}



suite('callback system mixin', function() {
  test('optimized first compile', function(done) {
    OneTimeCompile.new(function(err, around) {
      if (err) { done(err); return; }

      around.save(function(err, _) {
        if (err) { done(err); return; }

        assert.deepEqual(around.getHistory(), [
          ['beforeSave', 'startsTrue', 'if'],
          ['beforeSave', 'startsTrue', 'unless']
        ]);

        done();
      });
    });
  });

  test('afterSave runs in the reverse order', function(done) {
    AfterSaveConditionalPerson.new(function(err, person) {
      if (err) { done(err); return; }

      person.save(function(err, _) {
        if (err) { done(err); return; }

        assert.deepEqual(person.getHistory(), [
          ['afterSave', 'string2'],
          ['afterSave', 'string1']
        ]);

        done();
      });
    });
  });

  test('save around', function(done) {
    AroundPerson.new(function(err, person) {
      if (err) { done(err); return; }

      person.save(function(err, result) {
        if (err) { done(err); return; }

        assert.deepEqual(person.history, ['tweedleDee', 'yup1', 'yup2', 'running', 'after', 'w0tyes', 'tweedle']);
        assert.equal(result, 'FOO');

        done();
      });
    });
  });

  test('skip person', function(done) {
    PersonSkipper.new(function(err, person) {
      if (err) { done(err); return; }

      person.save(function(err, result) {
        if (err) { done(err); return; }

        assert.deepEqual(person.getHistory(), [
          ['beforeSave', 'function'],
          ['beforeSave', 'object'],
          ['beforeSave', 'block'],
          ['afterSave', 'block'],
          ['afterSave', 'class'],
          ['afterSave', 'object'],
          ['afterSave', 'function'],
          ['afterSave', 'string']
        ]);

        done();
      });
    });
  });

  test('skip person programmatically', function(done) {
    PersonForProgrammaticSkipping.getSaveCallbacks().forEach(function(callback) {
      if (callback.getType() === Type.BEFORE) {
        PersonForProgrammaticSkipping.skipCallback('save', Type.BEFORE, callback.getFilter());
      }
    });

    PersonForProgrammaticSkipping.new(function(err, person) {
      if (err) { done(err); return; }

      assert.deepEqual(person.getHistory(), []);

      person.save(function(err, result) {
        if (err) { done(err); return; }

        assert.deepEqual(person.getHistory(), [
          ['afterSave', 'block'],
          ['afterSave', 'class'],
          ['afterSave', 'object'],
          ['afterSave', 'function'],
          ['afterSave', 'string']
        ]);

        done();
      });
    });
  });

  test('save person', function(done) {
    Person.new(function(err, person) {
      if (err) { done(err); return; }

      assert.deepEqual(person.getHistory(), []);

      person.save(function(err, result) {
        if (err) { done(err); return; }

        assert.deepEqual(person.getHistory(), [
          ['beforeSave', 'string'],
          ['beforeSave', 'function'],
          ['beforeSave', 'object'],
          ['beforeSave', 'class'],
          ['beforeSave', 'block'],
          ['afterSave', 'block'],
          ['afterSave', 'class'],
          ['afterSave', 'object'],
          ['afterSave', 'function'],
          ['afterSave', 'string']
        ]);

        done();
      });
    });
  });

  test('save conditional person', function(done) {
    ConditionalPerson.new(function(err, person) {
      if (err) { done(err); return; }

      person.save(function(err, result) {
        if (err) { done(err); return; }

        assert.deepEqual(person.getHistory(), [
          ['beforeSave', 'function'],
          ['beforeSave', 'function'],
          ['beforeSave', 'string'],
          ['beforeSave', 'string'],
          ['beforeSave', 'combined']
        ]);

        done();
      });
    });
  });

  test('save clean person', function(done) {
    CleanPerson.new(function(err, person) {
      if (err) { done(err); return; }

      person.save(function(err, result) {
        if (err) { done(err); return; }

        assert.deepEqual(person.getHistory(), []);

        done();
      });
    });
  });

  test('before object', function(done) {
    UsingObjectBefore.new(function(err, u) {
      if (err) { done(err); return; }

      u.save(function(err, result) {
        if (err) { done(err); return; }

        assert.deepEqual(u.record, ['before', 'yielded']);

        done();
      });
    });
  });

  test('customized object', function(done) {
    CustomScopeObject.new(function(err, u) {
      if (err) { done(err); return; }

      u.save(function(err, result) {
        if (err) { done(err); return; }

        assert.deepEqual(u.record, ['beforeSave', 'yielded']);
        assert.equal(result, 'CallbackResult');

        done();
      });
    });
  });

  test('termination', function(done) {
    CallbackTerminator.new(function(err, terminator) {
      if (err) { done(err); return; }

      terminator.save(function(err, result) {
        if (err) { done(err); return; }

        assert.deepEqual(terminator.history, ['first', 'second', 'third', 'second', 'first']);
        assert.equal(terminator.halted, 'second');
        assert(!terminator.saved);

        done();
      });
    });
  });

  test('hyphenated key', function(done) {
    HyphenatedCallbacks.new(function(err, o) {
      if (err) { done(err); return; }

      o.save(function(err, result) {
        if (err) { done(err); return; }

        assert.equal(o.stuff, 'ACTION');
        assert.equal(result, 'ACTION');

        done();
      });
    });
  });

  test('skip writer', function(done) {
    WriterSkipper.new(function(err, o) {
      if (err) { done(err); return; }

      o.age = 18;

      assert.deepEqual(o.getHistory(), []);

      o.save(function(err, result) {
        if (err) { done(err); return; }

        assert.deepEqual(o.getHistory(), [
          ['beforeSave', 'string'],
          ['beforeSave', 'function'],
          ['beforeSave', 'object'],
          ['beforeSave', 'class'],
          ['beforeSave', 'block'],
          ['afterSave', 'block'],
          ['afterSave', 'class'],
          ['afterSave', 'object'],
          ['afterSave', 'function'],
          ['afterSave', 'string']
        ]);

        done();
      });
    });
  });

  test('extend callbacks', function(done) {
    ExtendCallbacks.mixin(ExtendModule);

    ExtendCallbacks.new(function(err, o) {
      if (err) { done(err); return; }

      o.save(function(err, result) {
        if (err) { done(err); return; }

        assert.deepEqual(o.recorder, [1, 2, 3]);

        done();
      });
    });
  });

  test('excludes duplicates in separate calls', function(done) {
    DuplicatingCallbacks.new(function(err, o) {
      if (err) { done(err); return; }

      o.save(function(err, result) {
        if (err) { done(err); return; }

        assert.deepEqual(o.record, ['two', 'one', 'three', 'yielded']);

        done();
      });
    });
  });

  test('excludes duplicates in one call', function(done) {
    DuplicatingCallbacksInSameCall.new(function(err, o) {
      if (err) { done(err); return; }

      o.save(function(err, result) {
        if (err) { done(err); return; }

        assert.deepEqual(o.record, ['two', 'one', 'three', 'yielded']);

        done();
      });
    });
  });

  test('function arity 1', function(done) {
    var calls = [];
    var Model = buildModelWithFilter(function(next) { calls.push('foo'); next(); });

    Model.new(function(err, o) {
      if (err) { done(err); return; }

      o.run(function(err, result) {
        if (err) { done(err); return; }

        assert.deepEqual(calls, ['foo']);

        done();
      });
    });
  });

  test('function arity 2', function(done) {
    var calls = [];
    var Model = buildModelWithFilter(function(x, next) { calls.push(x); next(); });

    Model.new(function(err, o) {
      if (err) { done(err); return; }

      o.run(function(err, result) {
        if (err) { done(err); return; }

        assert.deepEqual(calls, [o]);

        done();
      });
    });
  });

  test('function arity other', function() {
    assert.throws(function() {
      var Model = buildModelWithFilter(function() {});
      var o = new Model();
      o.run();
    }, /invalid filter arity/);

    assert.throws(function() {
      var Model = buildModelWithFilter(function(x, y, z) {});
      var o = new Model();
      o.run();
    }, /invalid filter arity/);
  });

  test('class conditional with scope', function(done) {
    var z = [];
    var condition = { foo: function(x) { z.push(x); return true; } };

    var Model = Rejoin.createModel(_.uniqueId('ModelNo'), NewBase, function(model) {
      model.mixin(CallbackSystem);
      model.defineCallbacks('foo', { scope: ['name'] });
      model.setCallback('foo', Type.BEFORE, 'foo', { if: condition });

      model.instanceMethods({
        run: function(callback) {
          this.runCallbacks('foo', callback);
        },

        foo: function(done) {
          done();
        }
      });
    });

    Model.new(function(err, o) {
      if (err) { done(err); return; }

      o.run(function(err, result) {
        if (err) { done(err); return; }

        assert.deepEqual(z, [o]);

        done();
      });
    });
  });

  test('class conditional', function(done) {
    var z = [];
    var condition = { before: function(x) { z.push(x); return true; } };

    var Model = buildModelWithCondition(condition);

    Model.new(function(err, o) {
      if (err) { done(err); return; }

      o.run(function(err, result) {
        if (err) { done(err); return; }

        assert.deepEqual(z, [o]);

        done();
      });
    });
  });

  test('function conditional arity 0', function(done) {
    var z = [];
    var Model = buildModelWithCondition(function() { z.push(0); return true; });

    Model.new(function(err, o) {
      if (err) { done(err); return; }

      o.run(function(err, result) {
        if (err) { done(err); return; }

        assert.deepEqual(z, [0]);

        done();
      });
    });
  });

  test('function conditional arity 1', function(done) {
    var z = [];
    var Model = buildModelWithCondition(function(x) { z.push(x); return true; });

    Model.new(function(err, o) {
      if (err) { done(err); return; }

      o.run(function(err, result) {
        if (err) { done(err); return; }

        assert.deepEqual(z, [o]);

        done();
      });
    });
  });

  test('function conditional arity 2', function() {
    assert.throws(function() {
      var Model = buildModelWithCondition(function(x, y) { return true; });
      var o = new Model();
      o.run();
    }, /invalid conditional arity/);
  });

  test('reset callbacks', function(done) {
    var events = [];
    var Model = buildModelWithMemo(events);

    Model.new(function(err, o) {
      if (err) { done(err); return; }

      o.run(function(err, result) {
        if (err) { done(err); return; }

        assert.equal(events.length, 1);

        Model.resetCallbacks('foo');

        Model.new(function(err, o) {
          if (err) { done(err); return; }

          o.run(function(err, result) {
            if (err) { done(err); return; }

            assert.equal(events.length, 1);

            done();
          });
        });
      });
    });
  });

  test('reset_impacts_subclasses', function(done) {
    var events = [];
    var Model = buildModelWithMemo(events);

    var Subclass = Rejoin.createModel(Model.name + 'Subclass', Model, function(model) {
      model.setCallback('foo', Type.BEFORE, 'world');

      model.instanceMethod('world', function(done) {
        events.push('world');
        done();
      });
    });

    Subclass.new(function(err, o) {
      if (err) { done(err); return; }

      o.run(function(err, result) {
        if (err) { done(err); return; }

        assert.equal(events.length, 2);

        Model.resetCallbacks('foo');

        Subclass.new(function(err, o) {
          if (err) { done(err); return; }

          o.run(function(err, result) {
            if (err) { done(err); return; }

            assert.equal(events.length, 3);

            done();
          });
        });
      });
    });
  });

  test('add object', function(done) {
    var calls = [];
    var filter = { before: function(o, done) { calls.push(o); done(); } };
    var Model = buildModelWithFilter(filter, 10);

    Model.new(function(err, o) {
      if (err) { done(err); return; }

      o.run(function(err, result) {
        if (err) { done(err); return; }

        assert.equal(calls.length, 10);

        done();
      });
    });
  });

  test('add lambda', function(done) {
    var calls = [];
    var filter = function(o, done) { calls.push(o); done(); };
    var Model = buildModelWithFilter(filter, 10);

    Model.new(function(err, o) {
      if (err) { done(err); return; }

      o.run(function(err, result) {
        if (err) { done(err); return; }

        assert.equal(calls.length, 10);

        done();
      });
    });
  });

  test('add string', function(done) {
    var calls = [];
    var filter = 'bar';
    var Model = buildModelWithFilter(filter, 10);

    Model.instanceMethod(filter, function(done) {
      calls.push(Model);
      done();
    });

    Model.new(function(err, o) {
      if (err) { done(err); return; }

      o.run(function(err, result) {
        if (err) { done(err); return; }

        assert.equal(calls.length, 1);

        done();
      });
    });
  });

  test('skip object', function(done) {
    var calls = [];
    var filter = { before: function(o, done) { calls.push(o); done(); } };
    var Model = buildModelWithFilter(filter, 10);

    var fn = function(i, callback) {
      Model.skip(filter);

      Model.new(function(err, o) {
        if (err) { done(err); return; }

        o.run(function(err, result) {
          if (err) { done(err); return; }

          assert.equal(calls.length, i);
          calls = [];

          callback();
        });
      });
    };

    async.eachSeries([9, 8, 7, 6, 5, 4, 3, 2, 1, 0], fn, done);
  });

  test('skip function', function(done) {
    var calls = [];
    var filter = function(o, done) { calls.push(o); done(); };
    var Model = buildModelWithFilter(filter, 10);

    for (var i = 0; i < 10; i++) {
      Model.skip(filter);
    }

    Model.new(function(err, o) {
      if (err) { done(err); return; }

      o.run(function(err, result) {
        if (err) { done(err); return; }

        assert.equal(calls.length, 10);

        done();
      });
    });
  });

  test('skip string', function(done) {
    var calls = [];
    var filter = 'bar';
    var Model = buildModelWithFilter(filter, 10);

    Model.instanceMethod(filter, function(done) {
      calls.push(Model);
      done();
    });

    Model.skip(filter);

    Model.new(function(err, o) {
      if (err) { done(err); return; }

      o.run(function(err, result) {
        if (err) { done(err); return; }

        assert.equal(calls.length, 0);

        done();
      });
    });
  });
});



var GrandParent = Rejoin.createModel(_.uniqueId('ModelNo'), NewBase, function(model) {
  model.mixin(CallbackSystem);
  model.defineCallbacks('dispatch');
  model.setCallback('dispatch', Type.BEFORE, 'before1', 'before2', { if: function(c) { return c.actionName === 'index' || c.actionName === 'update'; } });
  model.setCallback('dispatch', Type.AFTER, 'after1', 'after2', { if: function(c) { return c.actionName === 'update' || c.actionName === 'delete'; } });

  model.instanceMethods({
    initialize: function(actionName, callback) {
      this.actionName = actionName;
      this.log = [];
      this._super(callback);
    },

    before1: function(done) {
      this.log.push('before1');
      done();
    },

    before2: function(done) {
      this.log.push('before2');
      done();
    },

    after1: function(done) {
      this.log.push('after1');
      done();
    },

    after2: function(done) {
      this.log.push('after2');
      done();
    },

    dispatch: function(callback) {
      var self = this;

      this.runCallbacks('dispatch', function(cb) { self.log.push(self.actionName); cb(); }, callback);
    }
  });
});

var Parent = Rejoin.createModel(_.uniqueId('ModelNo'), GrandParent, function(model) {
  model.skipCallback('dispatch', Type.BEFORE, 'before2', { unless: function(c) { return c.actionName === 'update'; } });
  model.skipCallback('dispatch', Type.AFTER, 'after2', { unless: function(c) { return c.actionName === 'delete'; } });
});

var Child = Rejoin.createModel(_.uniqueId('ModelNo'), GrandParent, function(model) {
  model.skipCallback('dispatch', Type.BEFORE, 'before2', { unless: function(c) { return c.actionName === 'update'; }, if: 'isStateOpen' });

  model.instanceMethods({
    initialize: function(actionName, state, callback) {
      this.state = state;
      this._super(actionName, callback);
    },

    isStateOpen: function() {
      return this.state === 'open';
    }
  });
});

var EmptyParent = Rejoin.createModel(_.uniqueId('ModelNo'), NewBase, function(model) {
  model.mixin(CallbackSystem);
  model.defineCallbacks('dispatch');

  model.instanceMethods({
    performed: function() {
      if (typeof this._performed === 'undefined') {
        this._performed = false;
      }

      return this._performed;
    },

    perform: function(done) {
      this._performed = true;
      done();
    },

    dispatch: function(callback) {
      this.runCallbacks('dispatch', callback);
    }
  });
});

var EmptyChild = Rejoin.createModel(_.uniqueId('ModelNo'), EmptyParent, function(model) {
  model.setCallback('dispatch', Type.BEFORE, 'doNothing');

  model.instanceMethod('doNothing', function(done) { done(); });
});

var CountingParent = Rejoin.createModel(_.uniqueId('ModelNo'), NewBase, function(model) {
  model.mixin(CallbackSystem);
  model.defineCallbacks('dispatch');

  model.instanceMethods({
    initialize: function() {
      this.count = 0;
      this._super.apply(this, arguments);
    },

    increment: function() {
      this.count++;
    },

    dispatch: function(callback) {
      this.runCallbacks('dispatch', callback);
    }
  });
});

var CountingChild = Rejoin.createModel(_.uniqueId('ModelNo'), CountingParent);



suite('callback system mixin inheritance', function() {
  test('basic conditional callback1', function(done) {
    GrandParent.new('index', function(err, o) {
      if (err) { done(err); return; }

      o.dispatch(function(err, result) {
        if (err) { done(err); return; }

        assert.deepEqual(o.log, ['before1', 'before2', 'index']);

        done();
      });
    });
  });

  test('basic conditional callback2', function(done) {
    GrandParent.new('update', function(err, o) {
      if (err) { done(err); return; }

      o.dispatch(function(err, result) {
        if (err) { done(err); return; }

        assert.deepEqual(o.log, ['before1', 'before2', 'update', 'after2', 'after1']);

        done();
      });
    });
  });

  test('basic conditional callback3', function(done) {
    GrandParent.new('delete', function(err, o) {
      if (err) { done(err); return; }

      o.dispatch(function(err, result) {
        if (err) { done(err); return; }

        assert.deepEqual(o.log, ['delete', 'after2', 'after1']);

        done();
      });
    });
  });

  test('inherited excluded', function(done) {
    Parent.new('index', function(err, o) {
      if (err) { done(err); return; }

      o.dispatch(function(err, result) {
        if (err) { done(err); return; }

        assert.deepEqual(o.log, ['before1', 'index']);

        done();
      });
    });
  });

  test('inherited not excluded', function(done) {
    Parent.new('update', function(err, o) {
      if (err) { done(err); return; }

      o.dispatch(function(err, result) {
        if (err) { done(err); return; }

        assert.deepEqual(o.log, ['before1', 'before2', 'update', 'after1']);

        done();
      });
    });
  });

  test('inherited partially excluded', function(done) {
    Parent.new('delete', function(err, o) {
      if (err) { done(err); return; }

      o.dispatch(function(err, result) {
        if (err) { done(err); return; }

        assert.deepEqual(o.log, ['delete', 'after2', 'after1']);

        done();
      });
    });
  });

  test('crazy mix on', function(done) {
    Child.new('update', 'open', function(err, o) {
      if (err) { done(err); return; }

      o.dispatch(function(err, result) {
        if (err) { done(err); return; }

        assert.deepEqual(o.log, ['before1', 'update', 'after2', 'after1']);

        done();
      });
    });
  });

  test('crazy mix off', function(done) {
    Child.new('update', 'closed', function(err, o) {
      if (err) { done(err); return; }

      o.dispatch(function(err, result) {
        if (err) { done(err); return; }

        assert.deepEqual(o.log, ['before1', 'before2', 'update', 'after2', 'after1']);

        done();
      });
    });
  });

  test('callbacks looks to the superclass before running', function(done) {
    EmptyChild.new(function(err, child) {
      if (err) { done(err); return; }

      child.dispatch(function(err, result) {
        if (err) { done(err); return; }

        assert(!child.performed());

        EmptyParent.setCallback('dispatch', Type.BEFORE, 'perform');

        EmptyChild.new(function(err, child) {
          if (err) { done(err); return; }

          child.dispatch(function(err, result) {
            if (err) { done(err); return; }

            assert(child.performed());

            done();
          });
        });
      });
    });
  });

  test('callbacks should be performed once in child class', function(done) {
    CountingParent.setCallback('dispatch', Type.BEFORE, function(done) { this.increment(); done(); });

    CountingChild.new(function(err, child) {
      if (err) { done(err); return; }

      child.dispatch(function(err, result) {
        if (err) { done(err); return; }

        assert.equal(child.count, 1);

        done();
      });
    });
  });
});
