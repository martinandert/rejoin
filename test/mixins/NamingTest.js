'use strict';

var _       = require('lodash-node');
var assert  = require('assert');
var I18n    = require('counterpart');
var Person  = require('../models/Person');
var Child   = require('../models/Child');

suite('naming mixin', function() {
  var translations;

  setup(function() {
    translations = _.clone(I18n.__registry.translations);
    I18n.__registry.translations = {};
  });

  teardown(function() {
    I18n.__registry.translations = translations;
  });

  test('translated model attributes', function() {
    I18n.registerTranslations('en', { rejoin: { attributes: { person: { name: 'person name attribute' } } } });
    assert.equal(Person.getHumanAttributeName('name'), 'person name attribute');
  });

  test('translated model attributes with default', function() {
    I18n.registerTranslations('en', { rejoin: { attributes: { name: 'name default attribute' } } });
    assert.equal(Person.getHumanAttributeName('name'), 'name default attribute');
  });

  test('translated model attributes using fallback option', function() {
    assert.equal(Person.getHumanAttributeName('name', { fallback: 'name default attribute fallback' }), 'name default attribute fallback');
  });

  test('translated model attributes using fallback option as symbol', function() {
    I18n.registerTranslations('en', { default_name: 'name default fallback attribute' });
    assert.equal(Person.getHumanAttributeName('name', { fallback: ':default_name' }), 'name default fallback attribute');
  });

  test('translated model attributes falling back to default', function() {
    assert.equal(Person.getHumanAttributeName('name'), 'Name');
  });

  test('translated model attributes using fallback option as symbol and falling back to default', function() {
    assert.equal(Person.getHumanAttributeName('name', { fallback: ':default_name' }), 'Name');
  });

  test('translated model attributes with ancestor', function() {
    I18n.registerTranslations('en', { rejoin: { attributes: { child: { name: 'child name attribute'} } } });
    assert.equal(Child.getHumanAttributeName('name'), 'child name attribute');
  });

  test('translated model attributes with ancestors fallback', function() {
    I18n.registerTranslations('en', { rejoin: { attributes: { person: { name: 'person name attribute'} } } });
    assert.equal(Child.getHumanAttributeName('name'), 'person name attribute');
  });

  test('translated model names', function() {
    I18n.registerTranslations('en', { rejoin: { models: { person: 'person model' } } });
    assert.equal(Person.getHumanName(), 'person model');
  });

  test('translated model names with sti', function() {
    I18n.registerTranslations('en', { rejoin: { models: { child: 'child model' } } });
    assert.equal(Child.getHumanName(), 'child model');
  });

  test('translated model names with ancestors fallback', function() {
    I18n.registerTranslations('en', { rejoin: { models: { person: 'person model' } } });
    assert.equal(Child.getHumanName(), 'person model');
  });

  test('getHumanName does not modify options', function() {
    var options = { fallback: 'person model' };
    Person.getHumanName(options);
    assert.deepEqual(options, { fallback: 'person model' });
  });

  test('getHumanAttributeName does not modify options', function() {
    var options = { fallback: 'Cool gender' };
    Person.getHumanAttributeName('gender', options);
    assert.deepEqual(options, { fallback: 'Cool gender' });
  });
});
