// Helper for combining webpack config objects
const { merge } = require('webpack-merge');
const MonacoWebpackPlugin = require('monaco-editor-webpack-plugin');

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
