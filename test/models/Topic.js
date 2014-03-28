'use strict';

var Rejoin = require('../../');

module.exports = Rejoin.createModel('Topic', {
  attributes: {
    title:        Rejoin.DataType.STRING,
    author_name:  Rejoin.DataType.STRING,
    content:      Rejoin.DataType.TEXT,
    approved:     Rejoin.DataType.BOOLEAN,
    created_at:   Rejoin.DataType.DATETIME
  },

  callbacks: [{
    on: Rejoin.Callback.AFTER_VALIDATION,
    do: 'performAfterValidation'
  }],

  prototype: {
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

    myValidationWithArgs: function(getter, attr) {
      if (this[getter]() === null) {
        this.getErrors().add(attr, 'is missing');
      }
    }
  }
});
