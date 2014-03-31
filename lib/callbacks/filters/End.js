'use strict';

function End(env, cb) {
  if (!env.halted && env.fn) {
    var args = env.args || [];

    args.push(function(err, result) {
      env.error = err;

      if (typeof result !== 'undefined') {
        env.result = result;
      }

      cb(env);
    });

    env.fn.apply(env.target, args);
  } else {
    cb(env);
  }
}

module.exports = End;
