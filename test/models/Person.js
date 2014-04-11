'use strict';

var Rejoin = require('../../');

module.exports = Rejoin.createModel('Person', function(model) {
  model.attributes({
    title:  Rejoin.DataType.STRING,
    karma:  Rejoin.DataType.STRING,
    salary: Rejoin.DataType.INTEGER,
    gender: Rejoin.DataType.STRING
  });

  model.instanceMethods({
    getConditionIsTrue: function() {
      return true;
    },
  });
});
