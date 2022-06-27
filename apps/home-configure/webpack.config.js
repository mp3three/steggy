// Helper for combining webpack config objects
const { merge } = require('webpack-merge');
const MonacoWebpackPlugin = require('monaco-editor-webpack-plugin');

// FIXME: Using this breaks HMR
// Also, add comments on what this is doing if used again
module.exports = (config, context) => {
  return merge(config, {
    module: {
      rules: [
        // {
        //   test: /\.css$/,
        //   use: ['style-loader', 'css-loader'],
        // },
      ],
    },
    plugins: [new MonacoWebpackPlugin()],
    resolve: {
      fallback: {
        path: require.resolve('path-browserify'),
      },
    },
  });
};
