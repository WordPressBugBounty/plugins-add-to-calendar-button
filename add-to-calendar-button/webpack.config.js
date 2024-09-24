const defaultConfig = require("@wordpress/scripts/config/webpack.config");

module.exports = {
  ...defaultConfig,
  entry: {
    'block': './block.js',
  },
  output: {
    path: __dirname + '/build',
    filename: 'block.js',
  },
  externals: {
    react: 'React',
    'react-dom': 'ReactDOM',
  },
  performance: {
    maxEntrypointSize: 512000,
    maxAssetSize: 512000
  }
};
