'use strict'
const utils = require('./utils')
const webpack = require('webpack')
const config = require('../config')
const merge = require('webpack-merge')
const path = require('path')
const baseWebpackConfig = require('./webpack.base.conf')
const CopyWebpackPlugin = require('copy-webpack-plugin')
const FriendlyErrorsPlugin = require('friendly-errors-webpack-plugin')
const portfinder = require('portfinder')
const vConsolePlugin = require('vconsole-webpack-plugin')

const HOST = process.env.HOST
const PORT = process.env.PORT && Number(process.env.PORT)

const express = require('express')
const app = express()
// app.use('/mock', express.static('./mock'));
// app.listen(8787, () => {
//     console.log('App listening at port 8787');
// });

const devWebpackConfig = merge(baseWebpackConfig, {
  module: {
    rules: utils.styleLoaders({
      sourceMap: config.dev.cssSourceMap,
      usePostCSS: true
    })
  },
  // cheap-module-eval-source-map is faster for development
  devtool: config.dev.devtool,

  // these devServer options should be customized in /config/index.js
  devServer: {
    clientLogLevel: 'warning',
    historyApiFallback: {
      rewrites: [
        {
          from: /.*/,
          to: path.posix.join(config.dev.assetsPublicPath, 'index.html')
        }
      ]
    },
    hot: true,
    contentBase: false, // since we use CopyWebpackPlugin.
    compress: true,
    host: HOST || config.dev.host,
    port: PORT || config.dev.port,
    open: config.dev.autoOpenBrowser,
    overlay: config.dev.errorOverlay ? {
      warnings: false,
      errors: true
    } : false,
    publicPath: config.dev.assetsPublicPath,
    proxy: config.dev.proxyTable,
    quiet: true, // necessary for FriendlyErrorsPlugin
    watchOptions: {
      ignored: /node_modules/,
      poll: config.dev.poll
    }
  },
  plugins: [
    new webpack.DefinePlugin({
      'process.env': require('../config/dev.env'),
      'rootPath': '"/public"'
    }),
    new webpack.HotModuleReplacementPlugin(),
    new webpack.NamedModulesPlugin(), // HMR shows correct file names in console on update.
    new webpack.NoEmitOnErrorsPlugin(),
    // https://github.com/ampedandwired/html-webpack-plugin
    // new HtmlWebpackPlugin({
    //     filename: 'index.html',
    //     template: 'index.html',
    //     inject: true
    // }),
    // copy custom static assets
    /* mhs 生产的贴过来 */
    /* new webpack.optimize.CommonsChunkPlugin({
            name: 'vendor',
            minChunks: function (module, count) {
                // any required modules inside node_modules are extracted to vendor
                return (
                    module.resource &&
                    // /\.js$/.test(module.resource) && // 只打包js比较慢
                    module.resource.indexOf(
                        path.join(__dirname, '../node_modules')
                    ) === 0
                );
            }
        }), */
    new webpack.optimize.CommonsChunkPlugin({
      name: 'manifest',
      chunks: Object.keys(baseWebpackConfig.entry),
      // deepChildren: true,
      minChunks: 2
    }),
    new CopyWebpackPlugin([
      {
        from: path.resolve(__dirname, '../static'),
        to: config.dev.assetsSubDirectory,
        ignore: ['.*']
      },
      {
        from: path.resolve(__dirname, '../mock'),
        to: config.device.assetsSubDirectory,
        ignore: ['.*']
      },
      /* dll使用 */
      {
        from: path.resolve(__dirname, '../dll'), // dll设置，改为dll
        to: config.dev.assetsSubDirectory,
        ignore: ['.*']
      }
    ]),
    new vConsolePlugin({
      filter: [], // 需要过滤的入口文件
      enable: true // 发布代码前记得改回 false
    }),
    /* mhs dll使用, 链接dll */
    new webpack.DllReferencePlugin({
      context: __dirname,
      manifest: require('../dll/libs-mainfest.json') // 指向生成的manifest.json
    })
  ]
})

if (config.dev.bundleAnalyzerReport) {
  const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin
  devWebpackConfig.plugins.push(new BundleAnalyzerPlugin())
}

module.exports = new Promise((resolve, reject) => {
  portfinder.basePort = process.env.PORT || config.dev.port
  portfinder.getPort((err, port) => {
    if (err) { reject(err) } else {
      // publish the new Port, necessary for e2e tests
      process.env.PORT = port
      // add port to devServer config
      devWebpackConfig.devServer.port = port

      console.log(app.get('env')) // NODE_ENV 的值
      // Add FriendlyErrorsPlugin
      devWebpackConfig.plugins.push(new FriendlyErrorsPlugin({
        compilationSuccessInfo: {
          messages: [`Your application is running here: http://${devWebpackConfig.devServer.host}:${port}`]
        },
        onErrors: config.dev.notifyOnErrors
          ? utils.createNotifierCallback() : undefined
      }))

      resolve(devWebpackConfig)
    }
  })
})
