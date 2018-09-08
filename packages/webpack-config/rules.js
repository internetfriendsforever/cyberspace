module.exports = [
  {
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
  }
]
