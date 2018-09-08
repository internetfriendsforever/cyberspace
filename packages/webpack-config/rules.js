module.exports = [
  {
    test: /\.js$/,
    exclude: /node_modules/,
    loader: require.resolve('babel-loader'),
    options: {
      presets: [
        require.resolve('@babel/preset-env'),
        require.resolve('@babel/preset-react')
      ],

      plugins: [
        require.resolve('babel-plugin-emotion'),
        require.resolve('@babel/plugin-proposal-class-properties'),
        require.resolve('@babel/plugin-proposal-object-rest-spread')
      ]
    }
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
        loader: 'file-loader',
        options: {
          name: '[name]-[hash].[ext]',
          outputPath: 'static'
        }
      },
      'extract-loader',
      'css-loader'
    ]
  }
]
