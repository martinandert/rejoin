'use strict';

function ModelBase() {  
  this.initialize.apply(this, arguments);
}

ModelBase.prototype.initialize = function() {
};

module.exports = ModelBase;
