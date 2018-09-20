const fs = require('fs')
const path = require('path')
const nodeExternals = require('webpack-node-externals')
const { StatsWriterPlugin } = require('webpack-stats-plugin')

const defaultBabelOptions = {
  babelrc: false,

  presets: [
    require.resolve('@babel/preset-env'),
    require.resolve('@babel/preset-react')
  ],

  plugins: [
    require.resolve('babel-plugin-emotion'),
    require.resolve('@babel/plugin-syntax-dynamic-import'),
    require.resolve('@babel/plugin-proposal-class-properties'),
    require.resolve('@babel/plugin-proposal-object-rest-spread')
  ]
}

const projectBabelConfigPath = path.join(process.cwd(), 'src/.babelrc')
const projectBabelConfigExists = fs.existsSync(projectBabelConfigPath)
const babelOptions = !projectBabelConfigExists ? defaultBabelOptions : {}

const rules = [
  {
    test: /\.js$/,
    exclude: /node_modules/,
    loader: require.resolve('babel-loader'),
    options: babelOptions
  },

  {
    test: /\.(jpg|jpeg|png|gif|woff|woff2|svg|ttf|otf|ico)$/,
    loader: require.resolve('file-loader'),
    options: {
      name: '[name]-[hash].[ext]',
      outputPath: 'static'
    }
  },

  {
    test: /\.css$/,
    use: [
      {
        loader: require.resolve('file-loader'),
        options: {
          name: '[name]-[hash].[ext]',
          outputPath: 'static'
        }
      },
      require.resolve('extract-loader'),
      require.resolve('css-loader')
    ]
  }
]

const client = {
  name: 'client',

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

const server = {
  name: 'server',

  entry: [
    require.resolve('@babel/polyfill'),
    './src/server.js'
  ],

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

module.exports = [
  server,
  client
]
