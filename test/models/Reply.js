'use strict';

var Rejoin  = require('../../');
var Topic   = require('./Topic');

module.exports = Rejoin.createModel('Reply', Topic, function(model) {
  model.validate('errorsOnEmptyContent');
  model.validate('titleIsWrongCreate', { on: 'create' });

  model.validate('checkEmptyTitle');
  model.validate('checkContentMismatch', { on: 'create' });
  model.validate('checkWrongUpdate', { on: 'update' });

  model.instanceMethods({
    checkEmptyTitle: function(done) {
      if (!this.getTitle() || this.getTitle().length === 0) {
        this.getErrors().set('title', 'is Empty');
      }

      done();
    },

    errorsOnEmptyContent: function(done) {
      if (!this.getContent() || this.getContent().length === 0) {
        this.getErrors().set('content', 'is Empty');
      }

      done();
    },

    checkContentMismatch: function(done) {
      if (this.getTitle() && this.getContent() === 'Mismatch') {
        this.getErrors().set('title', 'is Content Mismatch');
      }

      done();
    },

    titleIsWrongCreate: function(done) {
      if (this.getTitle() === 'Wrong Create') {
        this.getErrors().set('title', 'is Wrong Create');
      }

      done();
    },

    checkWrongUpdate: function(done) {
      if (this.getTitle() === 'Wrong Update') {
        this.getErrors().set('title', 'is Wrong Update');
      }

      done();
    }
  });
});
