'use strict';

var isFunc = require('../utils/isFunc');
var except = require('../utils/except');

module.exports = {
  name: 'Persistence',

  prototype: {
    isNew: function() {
      return this._isNew;
    },

    isDestroyed: function() {
      return this._destroyed;
    },

    isPersisted: function() {
      return !(this.isNew() || this.isDestroyed());
    },

    save: function() {
      return this._createOrUpdate.apply(this, arguments);
    },

    delete: function(cb) {
      if (!this.isPersisted()) {
        cb(new Error('cannot delete on a new or destroyed record object'));
        return;
      }

      this.constructor.delete(this.getID(), function(err) {
        if (err) {
          cb(err);
        } else {
          this._destroyed = true;
          this.freeze();

          cb(null);
        }
      }.bind(this));
    },

    destroy: function(cb) {
      if (!this.isPersisted()) {
        cb(new Error('cannot destroy on a new or destroyed record object'));
        return;
      }

      this._destroyAssociations(function(err) {
        if (err) {
          cb(err);
        } else {
          this._destroyRecord(function(err) {
            if (err) {
              cb(err);
            } else {
              this._destroyed = true;
              this.freeze();

              cb(null);
            }
          }.bind(this));
        }
      }.bind(this));
    },

    updateAttribute: function(name, value, cb) {
      var setterMethod = this.constructor.attributeDefinitions[name].setterMethodName;

      this[setterMethod](value);
      return this.save({ validate: false }, cb);
    },

    update: function(attributes, cb) {
      var saveErr = null;

      this._withinTransaction(function() {
        this._assignAttributes(attributes);

        this.save(function(err) {
          saveErr = err;
        });
      }.bind(this), function(err, status) {
        if (err) {
          cb(err);
        } else {
          cb(saveErr, status);
        }
      });
    },

    updateColumn: function(name, value, cb) {
      var attributes = {};
      attributes[name] = value;

      return this.updateColumns(attributes, cb);
    },

    updateColumns: function(attributes, cb) {
      if (!this.isPersisted()) {
        cb(new Error('cannot update on a new record object'));
        return;
      }

      var conditions = {};
      conditions[this.constructor.getPrimaryKey()] = this.getID();

      this.constructor.unscoped().where(conditions).updateAll(attributes, function(err, updatedCount) {
        if (err) {
          cb(err);
        } else {
          for (var name in attributes) {
            this._rawWriteAttribute(name, attributes[name]);
          }

          cb(null, updatedCount === 1);
        }
      });
    },

    increment: function(attribute, by) {
      by = by || 1;

      this._attributes[attribute] = this._attributes[attribute] || 0;
      this._attributes[attribute] += 1;

      return this;
    },

    incrementAndSave: function(attribute, by, cb) {
      this.increment(attribute, by).updateAttribute(attribute, this._attributes[attribute], cb);
    },

    decrement: function(attribute, by) {
      by = by || 1;

      this._attributes[attribute] = this._attributes[attribute] || 0;
      this._attributes[attribute] -= 1;

      return this;
    },

    decrementAndSave: function(attribute, by, cb) {
      this.decrement(attribute, by).updateAttribute(attribute, this._attributes[attribute], cb);
    },

    toggle: function(attribute) {
      var queryMethod = this.constructor.attributeDefinitions[attribute].queryMethodName;

      this._attributes[attribute] = !this[queryMethod]();

      return this;
    },

    toggleAndSave: function(attribute, cb) {
      this.toggle(attribute).updateAttribute(attribute, this._attributes[attribute], cb);
    },

    touch: function(attribute, cb) {
      if (isFunc(attribute)) {
        cb = attribute;
        attribute = null;
      }

      if (!this.isPersisted()) {
        cb(new Error('cannot touch on a new record object'));
        return;
      }

      var attributes = this.getTimestampAttributesForUpdateInModel();

      if (attribute) {
        attributes.push(attribute);
      }

      var now = new Date();
      var changes = {};

      for (var index in attributes) {
        var name = attributes[index];

        changes[name] = this.writeAttribute(name, now);
      }

      this._changedAttributes = except(this._changedAttributes, Object.keys(changes));

      var conditions = {};
      conditions[this.constructor.getPrimaryKey()] = this.getID();

      this.constructor.unscoped().where(conditions).updateAll(changes, function(err, updatedCount) {
        if (err) {
          cb(err);
        } else {
          cb(null, updatedCount === 1);
        }
      });
    },

    _destroyAssociations: function() {
    },

    _destroyRecord: function(cb) {
      var conditions = {};
      conditions[this.constructor.getPrimaryKey()] = this.getID();

      return this.constructor.unscoped().where(conditions).deleteAll(cb);
    },

    _createOrUpdate: function() {
      if (this.isNew()) {
        this._createRecord.apply(this, arguments);
      } else {
        this._updateRecord.apply(this, arguments);
      }
    },

    _createRecord: function(attributeNames, cb) {
      if (isFunc(attributeNames)) {
        cb = attributeNames;
        attributeNames = null;
      }

      attributeNames = attributeNames || Object.keys(this._attributes);

      var attributes = this._getAttributesForCreate(attributeNames);

      this.constructor.unscoped().insert(attributes, function(err, newID) {
        if (err) {
          cb(err);
        } else {
          this.setID(newID);
          this._isNew = false;

          cb(null, this.getID());
        }
      });
    },

    _updateRecord: function(attributeNames, cb) {
      if (isFunc(attributeNames)) {
        cb = attributeNames;
        attributeNames = null;
      }

      attributeNames = attributeNames || Object.keys(this._attributes);

      var attributes = this._getAttributesForUpdate(attributeNames);

      if (Object.keys(attributes).length) {
        this.constructor.unscoped().updateRecord(attributes, this.getID(), this.getIDWas(), cb);
      } else {
        cb(null, 0);
      }
    }
  }
};
