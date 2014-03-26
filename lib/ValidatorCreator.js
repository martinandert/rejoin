'use strict';

var subclass = require('./utils/subclass');

module.exports = {
  createValidator: function(name, parent, proto) {
    return subclass(parent, name, proto);
  }
};
