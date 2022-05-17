// eslint-disable-next-line @typescript-eslint/no-var-requires
const { merge } = require('webpack-merge');

// Intended file target: libs/custom-code/src/includes/native-request.ts
// Webpack gets mad when it can't bundle all the dependencies, but the custom-code library means that isn't an option
//
// This will disable the associated warning with a dynamic require
//
module.exports = config => {
  return merge(config, {
    module: {
      noParse: new RegExp('\\/native-require.ts$'),
    },
  });
};
