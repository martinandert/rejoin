'use strict';

var models = process.__rejoinModelRegistry = process.__rejoinModelRegistry || {};

function register(model) {
  models[model.name] = model;
}

module.exports = {
  models:   models,
  register: register
};
