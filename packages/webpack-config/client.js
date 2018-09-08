const path = require('path')
const { StatsWriterPlugin } = require('webpack-stats-plugin')
const rules = require('./rules')

module.exports = {
  entry: './src/client.js',

  target: 'web',

  output: {
    path: path.join(process.cwd(), 'build'),
    filename: 'static/client-[hash].js',
    publicPath: '/'
  },

  module: {
    rules
  },

  plugins: [
    new StatsWriterPlugin({
      filename: 'scripts/client.json',
      transform (data) {
        return JSON.stringify(data.assetsByChunkName.main)
      }
    })
  ]
}
