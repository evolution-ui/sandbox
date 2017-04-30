var webpack = require('webpack');
var path = require('path');

module.exports = {
  context: path.join(__dirname, '/source/assets/scripts'),
  entry: [
    './main.js'
  ],
  output: {
    path: path.join(__dirname, '.dev/assets/scripts'),
    filename: 'evolution-ui.js'
  },
  plugins: [
    new webpack.NamedModulesPlugin()
  ],
  module: {
    loaders: [
      {
        test: /\.js?$/,
        exclude: /node_modules/,
        loaders: ['babel-loader?presets[]=es2015']
      }
    ]
  }
};
