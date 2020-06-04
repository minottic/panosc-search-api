module.exports = (Model, options) => {
  'use strict';
  // Set score property
  Model.afterRemote('**', (ctx, result, next) => {
    ctx.result.forEach((instance) => {
      instance.score = 0;
    });
    next();
  });
};
