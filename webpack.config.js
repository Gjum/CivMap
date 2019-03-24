module.exports = {
  entry: {
    javascript: "./app/js/app.js",
  },
  devtool: 'source-map',
  devServer: {
    contentBase: 'app/',
  },
  output: {
    path: __dirname + "/dist",
    filename: "./js/bundle.js",
    libraryTarget: 'var',
    library: 'CivMap',
  },
  module: {
    rules: [
      {
        test: /\.jsx?$/,
        exclude: /node_modules/,
        loaders: [
          'babel-loader',
          'react-hot-loader/webpack',
        ],
      },
    ],
  },
  resolve: {
    extensions: ['.js', '.jsx', '*'],
  },
}
