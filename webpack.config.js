'use strict'

const path = require('path')
const webpack = require('webpack')

const processEnvPlugin = new webpack.DefinePlugin({
  'process.env': {
    'SOCKET_URL': '"' + process.env.SB_SOCKET_URL + '"'
  }
})

module.exports = {
  module: {
    loaders: [
      {test: /\.jsx$/, loader: 'jsx-loader?insertPragma=React.DOM'}
    , {test: /\.js$/, loader: 'uglify'}
    , {test: /\.scss$/, loader: 'style!css!sass'}
    , {test: /\.jade$/, loader: 'jade'}
    , {test: /\.json$/, loader: 'json'}
    , {test: /\.(eot|woff|ttf|svg|png)$/, loader: 'url-loader'}
    ]
  }
, resolve: {
    root: [
      path.join(__dirname, 'frontend')
    , path.join(__dirname, 'frontend', 'App', 'Strings')
    ]
  }
, resolveLoader: {
    root: path.join(__dirname, 'node_modules')
 }
, entry: {
  base: './frontend/Base.jsx'
}
, output: {
    path: './dist'
  , filename: '[name].bundle.js'
  }
, plugins: [processEnvPlugin]
}
