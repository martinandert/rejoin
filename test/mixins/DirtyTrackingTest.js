'use strict';

var assert  = require('assert');
var Rejoin  = require('../../');

var DirtyModel = Rejoin.createModel('DirtyModel', function(model) {
  model.attributes({
    name:   Rejoin.DataType.STRING,
    color:  Rejoin.DataType.STRING,
    size:   Rejoin.DataType.INTEGER
  });

  model.instanceMethods({
    save: function() {
      this._changesApplied();
    },

    reload: function() {
      this._resetChanges();
    }
  });
});

suite('dirty tracking mixin', function() {
  test('setting attribute will result in change', function(done) {
    DirtyModel.new(function(err, model) {
      if (err) { done(err); return; }

      assert(!model.hasChanged());
      assert(!model.hasNameChanged());

      model.setName('Ringo');

      assert(model.hasChanged());
      assert(model.hasNameChanged());

      done();
    });
  });

  test('list of changed attribute keys', function(done) {
    DirtyModel.new(function(err, model) {
      if (err) { done(err); return; }

      assert.deepEqual(model.getChangedAttributeNames(), []);

      model.setName('Paul');

      assert.deepEqual(model.getChangedAttributeNames(), ['name']);

      done();
    });
  });

  test('changes to attribute values', function(done) {
    DirtyModel.new(function(err, model) {
      if (err) { done(err); return; }

      assert(!model.getChanges().name);

      model.setName('John');

      assert.deepEqual(model.getChanges().name, [null, 'John']);

      done();
    });
  });

  test('checking if an attribute has changed to a particular value', function(done) {
    DirtyModel.new(function(err, model) {
      if (err) { done(err); return; }

      model.setName('Ringo');

      assert(model.hasNameChanged({ from: null, to: 'Ringo' }));
      assert(!model.hasNameChanged({ from: 'Pete', to: 'Ringo' }));
      assert(model.hasNameChanged({ to: 'Ringo' }));
      assert(!model.hasNameChanged({ to: 'Pete' }));
      assert(model.hasNameChanged({ from: null }));
      assert(!model.hasNameChanged({ from: 'Pete' }));

      done();
    });
  });

  test('be consistent with arguments after the changes are applied', function(done) {
    DirtyModel.new(function(err, model) {
      if (err) { done(err); return; }

      model.setName('David');

      assert(model.hasAttributeChanged('name'));

      model.save();
      model.setName('Rafael');

      assert(model.hasAttributeChanged('name'));

      done();
    });
  });

  test('attribute mutation', function(done) {
    DirtyModel.new(function(err, model) {
      if (err) { done(err); return; }

      model._attributes.name = ['Yam'];

      assert.deepEqual(model.getName(), ['Yam']);
      assert(!model.hasNameChanged());

      model.getName().push('Hadad');

      assert.deepEqual(model.getName(), ['Yam', 'Hadad']);
      assert(!model.hasNameChanged());

      model.setNameWillChange();
      model.getName().push('Baal');

      assert.deepEqual(model.getName(), ['Yam', 'Hadad', 'Baal']);
      assert(model.hasNameChanged());

      done();
    });
  });

  test('resetting attribute', function(done) {
    DirtyModel.new(function(err, model) {
      if (err) { done(err); return; }

      model.setName('Bob');
      model.resetName();

      assert.strictEqual(model.getName(), null);
      assert(!model.hasNameChanged());

      done();
    });
  });

  test('setting color to same value should not result in change being recorded', function(done) {
    DirtyModel.new(function(err, model) {
      if (err) { done(err); return; }

      model.setColor('red');

      assert(model.hasColorChanged());

      model.save();

      assert(!model.hasColorChanged());
      assert(!model.hasChanged());

      model.setColor('red');

      assert(!model.hasColorChanged());
      assert(!model.hasChanged());

      done();
    });
  });

  test('saving should reset model\'s changed status', function(done) {
    DirtyModel.new(function(err, model) {
      if (err) { done(err); return; }

      model.setName('Alf');

      assert(model.hasChanged());

      model.save();

      assert(!model.hasChanged());
      assert(!model.hasNameChanged());

      done();
    });
  });

  test('saving should preserve previous changes', function(done) {
    DirtyModel.new(function(err, model) {
      if (err) { done(err); return; }

      model.setName('Jericho Cane');
      model.save();

      assert.deepEqual(model.getPreviouslyChangedAttributes().name, [null, 'Jericho Cane']);

      done();
    });
  });

  test('previous value is preserved when changed after save', function(done) {
    DirtyModel.new(function(err, model) {
      if (err) { done(err); return; }

      assert.deepEqual(model.getChangedAttributes(), {});

      model.setName('Paul');

      assert.deepEqual(model.getChangedAttributes(), { name: null });

      model.save();
      model.setName('John');

      assert.deepEqual(model.getChangedAttributes(), { name: 'Paul' });

      done();
    });
  });

  test('changing the same attribute multiple times retains the correct original value', function(done) {
    DirtyModel.new(function(err, model) {
      if (err) { done(err); return; }

      model.setName('Otto');
      model.save();
      model.setName('DudeFella ManGuy');
      model.setName('Mr. Manfredgensonton');

      assert.deepEqual(model.getNameChange(), ['Otto', 'Mr. Manfredgensonton']);

      assert.equal(model.getNameWas(), 'Otto');

      done();
    });
  });

  test('set a numeric attribute value', function(done) {
    DirtyModel.new(function(err, model) {
      if (err) { done(err); return; }

      model.setSize(1);

      assert(model.hasSizeChanged());

      done();
    });
  });

  test('reload should reset all changes', function(done) {
    DirtyModel.new(function(err, model) {
      if (err) { done(err); return; }

      model.setName('Dmitry');
      model.hasNameChanged();
      model.save();
      model.setName('Bob');

      assert.deepEqual(model.getPreviouslyChangedAttributes().name, [null, 'Dmitry']);
      assert.equal(model.getChangedAttributes().name, 'Dmitry');

      model.reload();

      assert.deepEqual(model.getPreviouslyChangedAttributes(), {});
      assert.deepEqual(model.getChangedAttributes(), {});

      done();
    });
  });
});
