'use strict';

var Rejoin = require('../../');

module.exports = Rejoin.createModel('Topic', function(model) {
  model.attributes({
    title:        Rejoin.DataType.STRING,
    author_name:  Rejoin.DataType.STRING,
    content:      Rejoin.DataType.TEXT,
    approved:     Rejoin.DataType.BOOLEAN,
    created_at:   Rejoin.DataType.DATETIME
  });

  model.afterValidation('performAfterValidation');

  model.instanceMethods({
    afterValidationPerformed: false,

    getConditionIsTrue: function() {
      return true;
    },

    getConditionIsTrueButItsNot: function() {
      return false;
    },

    performAfterValidation: function(done) {
      this.afterValidationPerformed = true;
      done();
    },

    myValidation: function() {
      if (this.getTitle() === null) {
        this.getErrors().add('title', 'is missing');
      }
    },

    myValidationWithArg: function(attr) {
      if (this._attributes[attr] === null) {
        this.getErrors().add(attr, 'is missing');
      }
    }
  });
});
