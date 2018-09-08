const path = require('path')
const nodeExternals = require('webpack-node-externals')

module.exports = [{
  entry: path.join(__dirname, 'src/server.js'),

  target: 'node',

  node: {
    __dirname: false,
    __filename: false
  },

  externals: [nodeExternals()],

  output: {
    path: path.join(__dirname, 'build'),
    filename: 'server.js',
    publicPath: '/'
  },

  module: {
    rules: [{
      test: /\.js$/,
      exclude: /node_modules/,
      loader: 'babel-loader'
    }, {
      test: /\.(jpg|jpeg|png|gif|woff|woff2|svg|ttf|otf|ico)$/,
      loader: 'file-loader',
      options: {
        name: '[name]-[hash].[ext]',
        outputPath: 'static'
      }
    }]
  }
}]
