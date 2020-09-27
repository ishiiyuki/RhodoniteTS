const merge = require('webpack-merge')
const path = require('path')
const baseConfig = require('./webpack.config.base.js')
const webpack = require('webpack')

const config = merge(baseConfig, {
  mode: 'development',
  output: {
    filename: 'index.js',
    chunkFilename: "rhodonite-[name].js",
    path: path.resolve(__dirname, "dist/esm"),
    libraryTarget: "commonjs-module"
  },
  plugins: [
    new webpack.optimize.LimitChunkCountPlugin({
      maxChunks: 1,
    }),
  ],
})

module.exports = config
