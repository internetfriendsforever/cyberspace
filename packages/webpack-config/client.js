const path = require('path')
const { StatsWriterPlugin } = require('webpack-stats-plugin')
const rules = require('./rules')

module.exports = {
  entry: [
    require.resolve('@babel/polyfill'),
    './src/client.js'
  ],

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
      filename: 'scripts/client',
      transform (data) {
        return data.assetsByChunkName.main
      }
    })
  ]
}
