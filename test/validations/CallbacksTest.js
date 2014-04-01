'use strict';

var assert = require('assert');
var Rejoin = require('../../');

var Dog = Rejoin.createModel('Dog', {
  attributes: {
    name: Rejoin.DataType.STRING
  },

  prototype: {
    initialize: function() {
      this.history = [];
      this._super.apply(this, arguments);
    },

    getHistory: function() {
      return this.history;
    }
  }
});

var DogWithMethodCallbacks = Rejoin.createModel('DogWithMethodCallbacks', {
  extends: Dog,

  callbacks: [{
    on: Rejoin.Callback.BEFORE_VALIDATION,
    do: 'setBeforeValidationMarker'
  }, {
    on: Rejoin.Callback.AFTER_VALIDATION,
    do: 'setAfterValidationMarker'
  }],

  prototype: {
    setBeforeValidationMarker: function(done) {
      this.getHistory().push('before_validation_marker');
      done();
    },

    setAfterValidationMarker: function(done) {
      this.getHistory().push('after_validation_marker');
      done();
    }
  }
});

var DogValidatorsAreFunctions = Rejoin.createModel('DogValidatorsAreFunctions', {
  extends: Dog,

  callbacks: [{
    on: Rejoin.Callback.BEFORE_VALIDATION,
    do: function(done) {
      this.getHistory().push('before_validation_marker');
      done();
    }
  }, {
    on: Rejoin.Callback.AFTER_VALIDATION,
    do: function(done) {
      this.getHistory().push('after_validation_marker');
      done();
    }
  }]
});

var DogWithTwoValidators = Rejoin.createModel('DogWithTwoValidators', {
  extends: Dog,

  callbacks: [{
    on: Rejoin.Callback.BEFORE_VALIDATION,
    do: function(done) {
      this.getHistory().push('before_validation_marker1');
      done();
    }
  }, {
    on: Rejoin.Callback.BEFORE_VALIDATION,
    do: function(done) {
      this.getHistory().push('before_validation_marker2');
      done();
    }
  }]
});

var DogValidatorReturningFalse = Rejoin.createModel('DogValidatorReturningFalse', {
  extends: Dog,

  callbacks: [{
    on: Rejoin.Callback.BEFORE_VALIDATION,
    do: function(done) {
      done(null, true);
    }
  }, {
    on: Rejoin.Callback.BEFORE_VALIDATION,
    do: function(done) {
      this.getHistory().push('before_validation_marker2');
      done();
    }
  }]
});

var DogWithMissingName = Rejoin.createModel('DogWithMissingName', {
  extends: Dog,

  callbacks: [{
    on: Rejoin.Callback.BEFORE_VALIDATION,
    do: function(done) {
      this.getHistory().push('before_validation_marker');
      done();
    }
  }],

  validations: {
    name: { presence: true }
  }
});

var DogValidatorWithIfCondition = Rejoin.createModel('DogValidatorWithIfCondition', {
  extends: Dog,

  callbacks: [{
    on: Rejoin.Callback.BEFORE_VALIDATION,
    do: 'setBeforeValidationMarker1',
    if: function() { return true; }
  }, {
    on: Rejoin.Callback.BEFORE_VALIDATION,
    do: 'setBeforeValidationMarker2',
    if: function() { return false; }
  }, {
    on: Rejoin.Callback.AFTER_VALIDATION,
    do: 'setAfterValidationMarker1',
    if: function() { return true; }
  }, {
    on: Rejoin.Callback.AFTER_VALIDATION,
    do: 'setAfterValidationMarker2',
    if: function() { return false; }
  }],

  prototype: {
    setBeforeValidationMarker1: function(done) {
      this.getHistory().push('before_validation_marker1');
      done();
    },

    setBeforeValidationMarker2: function(done) {
      this.getHistory().push('before_validation_marker2');
      done();
    },

    setAfterValidationMarker1: function(done) {
      this.getHistory().push('after_validation_marker1');
      done();
    },

    setAfterValidationMarker2: function(done) {
      this.getHistory().push('after_validation_marker2');
      done();
    }
  }
});

suite('validation callbacks', function() {
  test('before validation and after validation callbacks should be called', function(done) {
    DogWithMethodCallbacks.new(function(err, dog) {
      if (err) { done(err); return; }

      dog.validate(function(err, valid) {
        if (err) { done(err); return; }

        assert.deepEqual(dog.getHistory(), ['before_validation_marker', 'after_validation_marker']);

        done();
      });
    });
  });

  test('if condition is respected for before validation', function(done) {
    DogValidatorWithIfCondition.new(function(err, dog) {
      if (err) { done(err); return; }

      dog.validate(function(err, valid) {
        if (err) { done(err); return; }

        assert.deepEqual(dog.getHistory(), ['before_validation_marker1', 'after_validation_marker1']);

        done();
      });
    });
  });

  test('before validation and after validation callbacks should be called with function', function(done) {
    DogValidatorsAreFunctions.new(function(err, dog) {
      if (err) { done(err); return; }

      dog.validate(function(err, valid) {
        if (err) { done(err); return; }

        assert.deepEqual(dog.getHistory(), ['before_validation_marker', 'after_validation_marker']);

        done();
      });
    });
  });

  test('before validation and after validation callbacks should be called in declared order', function(done) {
    DogWithTwoValidators.new(function(err, dog) {
      if (err) { done(err); return; }

      dog.validate(function(err, valid) {
        if (err) { done(err); return; }

        assert.deepEqual(dog.getHistory(), ['before_validation_marker1', 'before_validation_marker2']);

        done();
      });
    });
  });

  test('further callbacks should not be called if before validation returns false', function(done) {
    DogValidatorReturningFalse.new(function(err, dog) {
      if (err) { done(err); return; }

      dog.validate(function(err, valid) {
        if (err) { done(err); return; }

        assert.deepEqual([], dog.getHistory());
        assert.strictEqual(false, valid);

        done();
      });
    });
  });

  test('validation test should be done', function(done) {
    DogWithMissingName.new(function(err, dog) {
      if (err) { done(err); return; }

      dog.validate(function(err, valid) {
        if (err) { done(err); return; }

        assert.deepEqual(dog.getHistory(), ['before_validation_marker']);
        assert.strictEqual(false, valid);

        done();
      });
    });
  });
});
