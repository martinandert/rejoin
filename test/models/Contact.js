'use strict';

var Rejoin = require('../../');

module.exports = Rejoin.createModel('Contact', function(model) {
  model.attributes({
    name:         Rejoin.DataType.STRING,
    age:          Rejoin.DataType.INTEGER,
    created_at:   Rejoin.DataType.DATETIME,
    awesome:      Rejoin.DataType.BOOLEAN,
    preferences:  Rejoin.DataType.TEXT
  });

  model.instanceMethods({
    social: function() {
      return ['twitter', 'github'];
    },

    network: function() {
      return { git: 'github' };
    },

    pseudonyms: function() {
      return null;
    },

    isPersisted: function() {
      return this.hasID();
    }
  });
});
