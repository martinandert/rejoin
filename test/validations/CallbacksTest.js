'use strict';

var assert = require('assert');
var Rejoin = require('../../');

var Dog = Rejoin.createModel('Dog', function(model) {
  model.attributes({
    name: Rejoin.DataType.STRING
  });

  model.instanceMethods({
    initialize: function() {
      this.history = [];
      this._super.apply(this, arguments);
    },

    getHistory: function() {
      return this.history;
    }
  });
});

var DogWithMethodCallbacks = Rejoin.createModel('DogWithMethodCallbacks', Dog, function(model) {
  model.beforeValidation('setBeforeValidationMarker');
  model.afterValidation('setAfterValidationMarker');

  model.instanceMethods({
    setBeforeValidationMarker: function(done) {
      this.getHistory().push('before_validation_marker');
      done();
    },

    setAfterValidationMarker: function(done) {
      this.getHistory().push('after_validation_marker');
      done();
    }
  });
});

var DogValidatorsAreFunctions = Rejoin.createModel('DogValidatorsAreFunctions', Dog, function(model) {
  model.beforeValidation(function(done) {
    this.getHistory().push('before_validation_marker');
    done();
  });

  model.afterValidation(function(done) {
    this.getHistory().push('after_validation_marker');
    done();
  });
});

var DogWithTwoValidators = Rejoin.createModel('DogWithTwoValidators', Dog, function(model) {
  model.beforeValidation(function(done) {
    this.getHistory().push('before_validation_marker1');
    done();
  });

  model.beforeValidation(function(done) {
    this.getHistory().push('before_validation_marker2');
    done();
  });
});

var DogValidatorReturningFalse = Rejoin.createModel('DogValidatorReturningFalse', Dog, function(model) {
  model.beforeValidation(function(done) {
    done(null, true);
  });

  model.beforeValidation(function(done) {
    this.getHistory().push('before_validation_marker2');
    done();
  });
});

var DogWithMissingName = Rejoin.createModel('DogWithMissingName', Dog, function(model) {
  model.beforeValidation(function(done) {
    this.getHistory().push('before_validation_marker');
    done();
  });

  model.validatesPresenceOf('name');
});

var DogValidatorWithIfCondition = Rejoin.createModel('DogValidatorWithIfCondition', Dog, function(model) {
  model.beforeValidation('setBeforeValidationMarker1', { if: function() { return true; } });
  model.beforeValidation('setBeforeValidationMarker2', { if: function() { return false; } });

  model.afterValidation('setAfterValidationMarker1', { if: function() { return true; } });
  model.afterValidation('setAfterValidationMarker2', { if: function() { return false; } });

  model.instanceMethods({
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
  });
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
        assert.strictEqual(valid, false);

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
        assert.strictEqual(valid, false);

        done();
      });
    });
  });
});
