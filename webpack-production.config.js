const webpack = require('webpack')
const defaultConf = require('./webpack.config.js')

module.exports = Object.assign({}, defaultConf, {
  mode: 'production', // enables optimizations like uglify
  plugins: [
    // Define production build to allow React to strip out unnecessary checks
    new webpack.DefinePlugin({
      'process.env': {
        'NODE_ENV': JSON.stringify('production'),
      },
    }),
  ],
})
