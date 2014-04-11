'use strict';

var async   = require('async');
var Rejoin  = require('../../');

module.exports = Rejoin.createModel('Automobile', function(model) {
  model.attributes({
    make:     Rejoin.DataType.STRING,
    model:    Rejoin.DataType.STRING,
    approved: Rejoin.DataType.BOOLEAN
  });

  model.validate('validations');

  model.instanceMethod('validations', function(done) {
    async.series([
      this.validatesPresenceOf('make'),
      this.validatesLengthOf('model', { minimum: 2, maximum: 10 }),
      this.validatesAcceptanceOf('approved', { allowNull: false }),
    ], done);
  });
});
