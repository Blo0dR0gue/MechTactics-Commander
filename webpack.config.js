const path = require('path');

module.exports = {
  watch: false,
  target: 'electron-renderer',
  mode: 'development',
  devtool: 'inline-source-map',
  entry: {
    // Define your entry points here
    index: './src/app/renderer/index.ts',
    update: './src/app/renderer/update.ts',
    dashboard: './src/app/renderer/dashboard.ts',
  },
  output: {
    path: path.resolve(__dirname, 'dist/app/renderer'),
    filename: '[name].bundle.js',
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
