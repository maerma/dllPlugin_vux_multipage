'use strict'
const path = require('path')
const utils = require('./utils')
const webpack = require('webpack')
const config = require('../config')
const merge = require('webpack-merge')
const baseWebpackConfig = require('./webpack.base.conf')
const CopyWebpackPlugin = require('copy-webpack-plugin')
const ExtractTextPlugin = require('extract-text-webpack-plugin')
const OptimizeCSSPlugin = require('optimize-css-assets-webpack-plugin')
const UglifyJsPlugin = require('uglifyjs-webpack-plugin')

const env = require('../config/prod.env')
const vHost = config.build.virtualHost
const vHostPath = vHost.substr(1) // 去除第一个/
const vHostPath2 = vHost.substr(2) // 去除两个/

const webpackConfig = merge(baseWebpackConfig, {
  module: {
    rules: utils.styleLoaders({
      sourceMap: config.build.productionSourceMap,
      extract: true
      // usePostCSS: true
    })
  },
  devtool: config.build.productionSourceMap ? config.build.devtool : false,
  output: {
    // path: config.build.assetsRoot,
    filename: utils.assetsPath('[name].[chunkhash:6].js'), // 入口文件名
    chunkFilename: utils.assetsPath('[name].[chunkhash:6].js') // 非入口文件名
  },
  plugins: [
    // http://vuejs.github.io/vue-loader/en/workflow/production.html
    // DefinePlugin 允许创建一个在编译时可以配置的全局常量
    new webpack.DefinePlugin({
      'process.env': env,
      'rootPath': env.assestRootPath
    }),
    new UglifyJsPlugin({
      uglifyOptions: {
        compress: {
          warnings: false,
          drop_console: true
        }
      },
      sourceMap: config.build.productionSourceMap,
      parallel: true
    }),
    // extract css into its own file
    new ExtractTextPlugin({
      filename: utils.assetsPath('[name].[chunkhash:6].css')
      // Setting the following option to `false` will not extract CSS from codesplit chunks.
      // Their CSS will instead be inserted dynamically with style-loader when the codesplit chunk has been loaded by webpack.
      // It's currently set to `true` because we are seeing that sourcemaps are included in the codesplit bundle as well when it's `false`,
      // increasing file size: https://github.com/vuejs-templates/webpack/issues/1110
      // allChunks: true,
    }), // extract css into its own file

    // Compress extracted CSS. We are using this plugin so that possible
    // duplicated CSS from different components can be deduped.
    new OptimizeCSSPlugin({
      cssProcessorOptions: {
        safe: true
      }
    }),
    // generate dist index.html with correct asset hash for caching.
    // you can customize output by editing /index.html
    // see https://github.com/ampedandwired/html-webpack-plugin
    // new HtmlWebpackPlugin({
    //     filename: config.build.index,
    //     template: 'index.html',
    //     inject: true,
    //     minify: {
    //         removeComments: true,
    //         collapseWhitespace: true,
    //         removeAttributeQuotes: true
    //         // more options:
    //         // https://github.com/kangax/html-minifier#options-quick-reference
    //     },
    //     // necessary to consistently work with multiple chunks via CommonsChunkPlugin
    //     chunksSortMode: 'dependency'
    // }),
    // keep module.id stable when vendor modules does not change
    new webpack.HashedModuleIdsPlugin(),
    // enable scope hoisting
    new webpack.optimize.ModuleConcatenationPlugin(),
    // split vendor js into its own file
    // new webpack.optimize.CommonsChunkPlugin({
    //     name: 'vendor',
    //     filename: vHostPath + '/common/vendor.[chunkhash:6].js',
    //     minChunks: (m) =>
    //         // /\.js$/.test(m.resource) &&
    //         (((/node_modules/.test(m.context)
    //             && !/node_modules\/(?:echarts|zrender)/.test(m.context))
    //             || /src\/(?:client|utils|scss|common)/.test(m.context)))
    // }),
    // new webpack.optimize.CommonsChunkPlugin({
    //     name: 'vue_vux',
    //     filename: vHostPath + '/common/vue_vux.[chunkhash:6].js',
    //     minChunks: (m) => /\.js$/.test(m.resource)
    //         && (/node_modules\/(?:vue|vux)/.test(m.context)
    //             || /src\/(?:client|utils)/.test(m.context))
    // }),
    // new webpack.optimize.CommonsChunkPlugin({
    //     name: 'client',
    //     filename: vHostPath + '/common/client.[chunkhash:6].js',
    //     minChunks: (m) => /src\/(?:client|utils)/.test(m.context)
    // }),
    new webpack.optimize.CommonsChunkPlugin({
      name: 'vendor',
      minChunks: function(module, count) {
        // any required modules inside node_modules are extracted to vendor
        return (
          module.resource &&
                    /\.js$/.test(module.resource) &&
                    module.resource.indexOf(
                      path.join(__dirname, '../node_modules')
                    ) === 0
        )
      }
    }),
    // extract webpack runtime and module manifest to its own file in order to
    // prevent vendor hash from being updated whenever app bundle is updated
    // 缓存公共模块，供后续使用，而不是每次打开一个新页面都调用一次
    new webpack.optimize.CommonsChunkPlugin({
      name: 'manifest',
      // filename: vHostPath + '/common/manifest.[chunkhash:6].js',
      chunks: Object.keys(baseWebpackConfig.entry),
      minChunks: 2

      // chunks: Object.keys(baseWebpackConfig.entry),
      // minChunks: 2
    }),
    // This instance extracts shared chunks from code splitted chunks and bundles them
    // in a separate chunk, similar to the vendor chunk
    // see: https://webpack.js.org/plugins/commons-chunk-plugin/#extra-async-commons-chunk
    new webpack.optimize.CommonsChunkPlugin({
      name: 'app',
      async: 'vendor-async',
      children: true
    }),

    // copy custom static assets
    // new CopyWebpackPlugin([
    //     {
    //         from: path.resolve(__dirname, '../static'),
    //         to: vHostPath2 + '/common',
    //         ignore: ['.*']
    //     }
    // ])

    // copy custom static assets
    new CopyWebpackPlugin([
      {
        from: path.resolve(__dirname, '../static'),
        // to: vHostPath2 + '/common',
        to: path.resolve(__dirname, '../dist/www/' + vHost),
        ignore: ['.*']
      }
    ])
  ]
})

if (config.build.productionGzip) {
  const CompressionWebpackPlugin = require('compression-webpack-plugin')

  webpackConfig.plugins.push(
    new CompressionWebpackPlugin({
      asset: '[path].gz[query]',
      algorithm: 'gzip',
      test: new RegExp(
        '\\.(' +
                config.build.productionGzipExtensions.join('|') +
                ')$'
      ),
      threshold: 10240,
      minRatio: 0.8
    })
  )
}

if (config.build.bundleAnalyzerReport) {
  const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin
  webpackConfig.plugins.push(new BundleAnalyzerPlugin())
}

module.exports = webpackConfig
