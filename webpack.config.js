var path = require('path');
var fs = require('fs');

module.exports = {
  watch: false,
  target: 'electron-renderer',
  mode: 'development',
  devtool: 'inline-source-map',
  entry: `./src/app/core/index.ts`,
  output: {
    path: path.resolve(__dirname, 'dist/app'),
    filename: 'bundle.js',
  },
  resolve: {
    // Add `.ts` and `.tsx` as a resolvable extension.
    extensions: ['.ts', '.tsx', '.js'],
  },
  module: {
    rules: [
      // all files with a `.ts` or `.tsx` extension will be handled by `ts-loader`
      { test: /\.tsx?$/, loader: 'ts-loader' },
      {
        test: /\.(scss)$/,
        use: [
          {
            loader: 'style-loader',
          },
          {
            loader: 'css-loader',
          },
          {
            loader: 'postcss-loader',
            options: {
              postcssOptions: {
                plugins: () => [require('autoprefixer')],
              },
            },
          },
          {
            loader: 'sass-loader',
          },
        ],
      },
    ],
  },
};
