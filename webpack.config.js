const path = require('path');
const webpack = require('webpack');
const ExtractTextPlugin = require("extract-text-webpack-plugin");
const OptimizeCSSPlugin = require('optimize-css-assets-webpack-plugin');
const SemverWebpackPlugin = require('semver-webpack-plugin');
const FriendlyErrorsPlugin = require('friendly-errors-webpack-plugin');

const isProd = process.env.NODE_ENV === 'production';

let options = {
  devtool: !isProd ? '#cheap-source-map' : false,
  entry: {
    content_script: path.join(__dirname, 'src/scripts/content_script.js'),
    background: path.join(__dirname, 'src/scripts/background.js'),
    vendor: ['jquery', 'vue', 'lodash', 'file-saver', 'jszip']
  },
  output: {
    path: path.join(__dirname, 'chrome/scripts'),
    filename: '[name].js'
  },
  resolve: {
    alias: {
      'vue$': 'vue/dist/vue.esm',
      jquery: 'jquery/dist/jquery'
    },
    extensions: ['.js', '.vue', '.json']
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        loader: 'babel-loader',
        exclude: /node_modules/,
        include: [
          path.resolve(__dirname, 'src'),
          path.resolve(__dirname, 'jquery/dist/jquery')
        ]
      },
      {
        test: /\.vue$/, 
        loader: 'vue-loader', 
        options: {
          loaders: {
            stylus: ExtractTextPlugin.extract({
              use: ['css-loader', 'stylus-loader'],
              fallback: 'vue-style-loader'
            })
          }
        }
      }
    ]
  },
  plugins: [
    new webpack.DefinePlugin({
      'process.env': {
        NODE_ENV: '"production"' // 关闭Vue的调试工具消息,反正也用不了
      }
    }),

    new webpack.optimize.CommonsChunkPlugin({
      name: "vendor",
      filename: "vendor.js",
      minChunks: 2,
    }),

    new webpack.ProvidePlugin({
      $: 'jquery',
      jquery: 'jquery',
      jQuery: 'jquery',
      'window.jquery': 'jquery'
    }),

    new ExtractTextPlugin("../styles/[name].css"),
    new webpack.NoEmitOnErrorsPlugin(),
    new FriendlyErrorsPlugin()
  ]
};

if (isProd) {
  options.plugins.push(new OptimizeCSSPlugin({
    cssProcessorOptions: {
      safe: true
    }
  }));

  options.plugins.push(
    new webpack.optimize.UglifyJsPlugin({
      // 最紧凑的输出
      beautify: false,
      // 删除所有的注释
      comments: false,
      compress: {
        // 在UglifyJs删除没有用到的代码时不输出警告
        warnings: false,
        // 删除所有的 `console` 语句
        // 还可以兼容ie浏览器
        drop_console: false,
        // 内嵌定义了但是只用到一次的变量
        collapse_vars: true,
        // 提取出出现多次但是没有定义成变量去引用的静态值
        reduce_vars: true,
      }
    })
  );

  options.plugins.push(new SemverWebpackPlugin({
    files: [
      path.resolve(__dirname, "chrome/manifest.json")
    ],
    incArgs: ['patch']
  }));

}

module.exports = options;
