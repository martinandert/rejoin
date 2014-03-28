'use strict';

var Rejoin = require('../../');

module.exports = Rejoin.createModel('Person', {
  attributes: {
    title: Rejoin.DataType.STRING,
    karma: Rejoin.DataType.STRING,
    salary: Rejoin.DataType.INTEGER,
    gender: Rejoin.DataType.STRING
  },

  prototype: {
    getConditionIsTrue: function() {
      return true;
    },
  }
});
