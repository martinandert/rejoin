'use strict';

var models = process.__rejoinModelRegistry = process.__rejoinModelRegistry || {};

function register(model) {
  if (models[model.name]) {
    throw new Error('a model named "' + model.name + '" is already defined');
  }

  models[model.name] = model;
}

register(require('./Model'));

module.exports = {
  models:   models,
  register: register
};
