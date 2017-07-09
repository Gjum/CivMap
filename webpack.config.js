module.exports = {
  entry: {
    javascript: "./app/js/app.js",
    html: "./app/index.html",
    css: "./app/style.css",
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
    loaders: [
      {
        test: /\.html$/,
        loader: "file?name=[name].[ext]",
      },
      {
        test: /\.css$/,
        loader: "file?name=[name].[ext]",
      },
      {
        test: /\.jsx?$/,
        exclude: /node_modules/,
        loaders: ["react-hot", 'babel?'+JSON.stringify(
          {
            presets: ['react', 'es2015'],
            "plugins": [
              "syntax-class-properties",
              "syntax-decorators",
              "syntax-object-rest-spread",
              "transform-class-properties",
              "transform-object-rest-spread",
            ],
          },
        )],
      },
    ],
  },
};
