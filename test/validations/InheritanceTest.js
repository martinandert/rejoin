'use strict';

var assert = require('assert');
var Rejoin = require('../../');

var Cat = Rejoin.createModel('Cat', function(model) {
  model.attribute('name');
  model.attribute('gender');

  model.validatesPresenceOf('name');
});

var Tiger = Rejoin.createModel('Tiger', Cat, function(model) {
  model.validatesPresenceOf('gender');
});

suite('validation inheritance', function() {
  test('model does not have validators of subclass', function() {
    assert.equal(Cat.getValidators().name.length, 1);
    assert.equal(Cat.getValidators().gender, undefined);

    assert.equal(Tiger.getValidators().name.length, 1);
    assert.equal(Tiger.getValidators().gender.length, 1);
  });
});
