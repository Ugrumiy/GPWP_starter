'use strict';

const webpack = require('webpack');
const path = require('path');
const getEntries = require('./get-entries');
const args = require('yargs').argv;
const CommonsPlugin = new require("webpack/lib/optimize/CommonsChunkPlugin");

// Path variables
const rootPath = path.join(__dirname, 'src');

// Entries
const mainEntry = {main: path.join(rootPath, '/globals/js/script_global.js')};
const commonEntry =  {common: ['jquery']};

const entries = Object.assign({}, mainEntry, getEntries(rootPath));

// plugins

let plugins = [];
if(args.prod) {
  plugins.push(
    new webpack.optimize.UglifyJsPlugin({
      debug: true,
      minimize: true,
      sourceMap: false,
      output: {
        comments: false
      },
      compressor: {
        warnings: false
      }
    })
  );
}


module.exports = {

  entry: entries,
  output: {
    //jsonpFunction: 'bridgestonePack',
    path: path.join(__dirname, 'build/resources/js'),
    filename:  '[name].js',
    //chunkFileName: ENV === 'production' ? '[id].[chunkhash].js' : '[name].js',
    //publicPath: '/assets/js/'
  },

  module: {
  loaders: [
    {
      test: /\.js$/,
      exclude: /(node_modules|bower_components)/,
      loader: 'babel-loader',
      query: {
        presets: ['es2015']
      }
    }
  ]
  },
    resolve: {
      alias: {
        pages: path.resolve(rootPath, 'pages'),
        components: path.resolve(rootPath, 'components'),
        modulesDirectories: ['node_modules']
      }
  },
    plugins: [
    new webpack.ProvidePlugin({
      $: "jquery",
      jQuery: "jquery",
      "window.jQuery": "jquery"
    }),
    new webpack.optimize.CommonsChunkPlugin({
      minChunks: 2,
      name: 'common',
      filename: 'common.js'
    })
  ].concat(plugins)
};
