'use strict'
const path = require('path')
const utils = require('./utils')
const config = require('../config')
const vueLoaderConfig = require('./vue-loader.conf')
const vuxLoader = require('vux-loader')
const dev = process.env.NODE_ENV !== 'production'
const HappyPack = require('happypack') // mhs happypack
let os = require('os')
let happyThreadPool = HappyPack.ThreadPool({ size: os.cpus().length })
// 获取多入口方法
const { entrys, HtmlWebpackPlugin, moduleName } = require('./genMultiEntries').genMultiEntries()

function resolve(dir) {
  return path.join(__dirname, '..', dir) // dir 相对根路径
}

const vHost = process.env.NODE_ENV === 'production' ? config.build.virtualHost.substr(1) + '/' : './'

const webpackConfig = {
  // context: path.resolve(__dirname, '../'),
  entry: entrys,
  output: {
    // path: config.build.assetsRoot,
    path: dev ? config.build.assetsRoot : path.resolve(__dirname, '../dist/www/', moduleName),
    filename: '[name].js',
    publicPath: dev ? '/' : '../'
  },
  externals: {
    'Vue': 'window.Vue',
    'vue': 'window.Vue',
    'fastclick': 'window.FastClick'
    // 'Vuex': 'window.Vuex',
    // 'vuex': 'window.Vuex'
  },
  resolve: {
    extensions: ['.js', '.vue', '.json', '.scss'],
    alias: {
      // 'vue$': 'vue/dist/vue.esm.js',
      '@': resolve('src'),
      '@m': resolve('src/module'),
      '@a': resolve('src/assets'),
      '@c': resolve('src/components'),
      '@cb': resolve('src/components/base'),
      '@ce': resolve('src/components/extend')
    }
  },
  module: {
    rules: [
      {
        test: /\.vue$/,
        loader: 'vue-loader',
        options: vueLoaderConfig
      },
      /* 原版 */
      /* {
                test: /\.js$/,
                loader: 'babel-loader?cacheDirectory=true',
                include: [resolve('src'), resolve('test'), resolve('node_modules/webpack-dev-server/client')],
                // exclude: path.resolve(__dirname, './node_modules'),
            }, */
      {
        test: /\.js$/,
        loader: 'babel-loader',
        include: [resolve('src'), resolve('test'), resolve('node_modules/webpack-dev-server/client')],
        exclude: path.resolve(__dirname, './node_modules'),
        options: {
          cacheDirectory: './webpack_cache'
        }
      },
      /* 添加缓存和happypack */
      /* {
                test: /\.js$/,
                //把对.js 的文件处理交给id为happyBabel 的HappyPack 的实例执行
                loader: 'babel-loader',
                // include: [resolve('src'), resolve('test')],
                include: [resolve('src'), resolve('test'), resolve('node_modules/webpack-dev-server/client')],
                exclude: path.resolve(__dirname, './node_modules'),
                options: {
                    cacheDirectory: './webpack_cache'
                }
            }, */
      {
        test: /\.(png|jpe?g|gif|svg)(\?.*)?$/,
        loader: 'url-loader',
        options: {
          limit: 10000,
          name: utils.assetsPath('img/[name].[hash:7].[ext]')
        }
      },
      {
        test: /\.(mp4|webm|ogg|mp3|wav|flac|aac)(\?.*)?$/,
        loader: 'url-loader',
        options: {
          limit: 10000,
          name: utils.assetsPath('common/media/[name].[hash:7].[ext]')
        }
      },
      {
        test: /\.(woff2?|eot|ttf|otf)(\?.*)?$/,
        loader: 'url-loader',
        options: {
          limit: 10000,
          name: utils.assetsPath('common/fonts/[name].[hash:7].[ext]')
        }
      }
    ]
  },
  node: {
    // prevent webpack from injecting useless setImmediate polyfill because Vue
    // source contains it (although only uses it if it's native).
    setImmediate: false,
    // prevent webpack from injecting mocks to Node native modules
    // that does not make sense for the client
    dgram: 'empty',
    fs: 'empty',
    net: 'empty',
    tls: 'empty',
    child_process: 'empty'
  },
  plugins: [...HtmlWebpackPlugin]
}
module.exports = vuxLoader.merge(webpackConfig, {
  plugins: [
    'vux-ui',
    'duplicate-style'
    /* new HappyPack({
            //用id来标识 happypack处理那里类文件
            id: 'babel-happy1',
            threads: 2,
            //如何处理  用法和loader 的配置一样
            loaders: [
                {
                    loader: 'babel-loader',
                }
            ],
            verbose: true,
            debug: true
        }) */
  ] // 数组方式插件配置
})
