'use strict';

var _ = require('lodash-node');

function After(nextCallback, userCallback, userConditions, chainConfig) {
  if (chainConfig.skipAfterCallbacksIfHalted === true) {
    if (userConditions.length) {
      return function(env, done) {
        nextCallback(env, function(env) {
          if (!env.halted && !env.error && _.every(userConditions, function(c) { return c(env.target, env.result); })) {
            userCallback(env, done);
          } else {
            done(env);
          }
        });
      };
    } else {
      return function(env, done) {
        nextCallback(env, function(env) {
          if (env.halted || env.error) {
            done(env);
          } else {
            userCallback(env, done);
          }
        });
      };
    }
  } else {
    if (userConditions.length) {
      return function(env, done) {
        nextCallback(env, function(env) {
          if (!env.error && _.every(userConditions, function(c) { return c(env.target, env.result); })) {
            userCallback(env, done);
          } else {
            done(env);
          }
        });
      };
    } else {
      return function(env, done) {
        nextCallback(env, function(env) {
          if (env.error) {
            done(env);
          } else {
            userCallback(env, done);
          }
        });
      };
    }
  }
}

module.exports = After;
