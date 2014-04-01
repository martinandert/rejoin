'use strict';

var _ = require('lodash-node');

module.exports = {
  checkValidity: function() {
    var delimiter = this._getDelimiter();

    if (!_.isArray(delimiter) && !_.isFunction(delimiter)) {
      throw new Error('An array or a function must be supplied as the in (or within) option of the configuration hash');
    }
  },

  _getDelimiter: function() {
    if (typeof this._delimiter === 'undefined') {
      this._delimiter = this.options.in || this.options.within || null;
    }

    return this._delimiter;
  },

  _includes: function(record, value) {
    var delimiter = this._getDelimiter();
    var members   = _.isFunction(delimiter) ? delimiter(record) : delimiter;

    return _.contains(members, value);
  }
};
