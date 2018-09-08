const path = require('path')
const nodeExternals = require('webpack-node-externals')
const rules = require('./rules')

module.exports = {
  entry: './src/server.js',

  target: 'node',

  node: {
    __dirname: false,
    __filename: false
  },

  externals: [nodeExternals()],

  output: {
    path: path.join(process.cwd(), 'build'),
    filename: 'server.js',
    publicPath: '/'
  },

  module: {
    rules
  }
}
