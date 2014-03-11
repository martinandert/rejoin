'use strict';

var isFunc = require('../utils/isFunc');
var except = require('../utils/except');

module.exports = {
  name: "Persistence",

  prototype: {
    isNew: function() {
      return this._newRecord;
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
        cb.call(this, 'cannot delete on a new or destroyed record object');
        return;
      }

      this.constructor.delete(this.getID(), function(err) {
        if (err) {
          cb.call(this, err);
        } else {
          this._destroyed = true;
          this.freeze();

          cb.call(this, null);
        }
      }.bind(this));
    },

    destroy: function(cb) {
      if (!this.isPersisted()) {
        cb.call(this, 'cannot destroy on a new or destroyed record object');
        return;
      }

      this._destroyAssociations(function(err) {
        if (err) {
          cb.call(this, err);
        } else {
          this._destroyRecord(function(err) {
            if (err) {
              cb.call(this, err);
            } else {
              this._destroyed = true;
              this.freeze();

              cb.call(this, null);
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
          cb.call(this, err);
        } else {
          cb.call(this, saveErr, status);
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
        cb.call(this, 'cannot update on a new record object');
        return;
      }

      this.constructor.unscoped().where({ id: this.getID() }).updateAll(attributes, function(err, updatedCount) {
        if (err) {
          cb.call(this, err);
        } else {
          for (var name in attributes) {
            this._rawWriteAttribute(name, attributes[name]);
          }

          cb.call(this, null, updatedCount === 1);
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
        cb.call(this, 'cannot touch on a new record object');
        return;
      }

      var attributes = this._getTimestampAttributesForUpdate();

      if (attribute) {
        attributes.push(attribute);
      }

      var now = new Date();
      var changes = {};

      for (var index in attributes) {
        var column = attributes[index];

        changes[column] = this._writeAttribute(column, now);
      }

      this._changedAttributes = except(this._changedAttributes, Object.keys(changes));

      this.constructor.unscoped().where({ id: this.getID() }).updateAll(changes, function(err, updatedCount) {
        if (err) {
          cb.call(this, err);
        } else {
          cb.call(this, null, updatedCount === 1);
        }
      });
    },

    _destroyAssociations: function() {
    },

    _destroyRecord: function(cb) {
      return this.constructor.unscoped().where({ id: this.getID() }).deleteAll(cb);
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
          cb.call(this, err);
        } else {
          this.setID(newID);
          this._isNew = false;

          cb.call(this, null, this.getID());
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
        cb.call(this, null, 0);
      }
    }
  }
};
