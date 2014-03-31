'use strict';

var _ = require('lodash-node');

function Before(nextCallback, userCallback, userConditions, chainConfig, filter) {
  if (userConditions.length) {
    return function(env, done) {
      if (!env.halted && !env.error && _.every(userConditions, function(c) { return c(env.target, env.result); })) {
        userCallback(env, function(env) {
          if (env.halted) {
            env.target._haltedCallbackHook(filter);
          }

          if (env.error) {
            done(env);
          } else {
            nextCallback(env, done);
          }
        });
      } else if (env.error) {
        done(env);
      } else {
        nextCallback(env, done);
      }
    };
  } else {
    return function(env, done) {
      if (!env.halted && !env.error) {
        userCallback(env, function(env) {
          if (env.halted) {
            env.target._haltedCallbackHook(filter);
          }

          if (env.error) {
            done(env);
          } else {
            nextCallback(env, done);
          }
        });
      } else if (env.error) {
        done(env);
      } else {
        nextCallback(env, done);
      }
    };
  }
}

module.exports = Before;
