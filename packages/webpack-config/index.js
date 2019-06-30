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

const configs = []

const clientEntry = gracefulResolve(path.join(process.cwd(), 'src/client'))

if (clientEntry) {
  configs.push({
    name: 'client',

    entry: [
      require.resolve('@babel/polyfill'),
      clientEntry
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
  })
}

const serverEntry = gracefulResolve(path.join(process.cwd(), 'src/server'))

if (serverEntry) {
  configs.push({
    name: 'server',

    entry: [
      require.resolve('@babel/polyfill'),
      serverEntry
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
  })
}

function gracefulResolve (path) {
  try {
    return require.resolve(path)
  } catch (error) {
    console.log('Could not resolve', path)
  }
}

module.exports = configs
