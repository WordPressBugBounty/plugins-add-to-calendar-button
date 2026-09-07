const path = require('path');
const DependencyExtractionWebpackPlugin = require('@wordpress/dependency-extraction-webpack-plugin');

module.exports = {
  entry: {
    block: './block.js',
  },
  output: {
    path: path.resolve(__dirname, 'build'),
    filename: 'block.js',
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: 'babel-loader',
      },
    ],
  },
  plugins: [new DependencyExtractionWebpackPlugin()],
};
