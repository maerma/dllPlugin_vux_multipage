const path = require('path')
const webpack = require('webpack') // 调用webpack内置DllPlugin插件
const ExtractTextPlugin = require('extract-text-webpack-plugin') // 提取css
const AssetsPlugin = require('assets-webpack-plugin') // 生成文件名，配合HtmlWebpackPlugin增加打包后dll的缓存
const CleanWebpackPlugin = require('clean-webpack-plugin') // 清空文件夹
const vueLoaderConfig = require('./vue-loader.conf')
const vuxLoader = require('vux-loader')
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin // 统计

const dllConfig = {
  entry: {
    // libs: ['vconsole/dist/vconsole.min.js', 'axios', 'qs']
    libs: ['sockjs-client/dist/sockjs.js', 'better-scroll/dist/bscroll.esm.js', 'vconsole/dist/vconsole.min.js', 'axios', 'qs', 'vux/index.js']
  },
  output: {
    path: path.resolve(__dirname, '../dll'),
    filename: '[name].[chunkhash:7].js',
    library: '[name]_library'
  },
  resolve: {
    extensions: ['.js', '.vue', '.json', '.scss']
  },
  plugins: [
    new webpack.DllPlugin({
      path: path.resolve(__dirname, '../dll/[name]-mainfest.json'),
      name: '[name]_library',
      context: __dirname // 执行的上下文环境，对之后DllReferencePlugin有用
    }),
    new ExtractTextPlugin('[name].[contenthash:7].css'),
    new webpack.optimize.UglifyJsPlugin({
      compress: {
        warnings: false
      }
    }),
    new AssetsPlugin({
      filename: 'bundle-config.json',
      path: './dll'
    }),
    new CleanWebpackPlugin(['dll'], {
      root: path.join(__dirname, '../'), // 绝对路径
      verbose: true, // 是否显示到控制台
      dry: false // 不删除所有
    }),
    new BundleAnalyzerPlugin() // 使用统计
  ],
  module: {
    rules: [{
      test: /\.vue$/,
      loader: 'vue-loader',
      options: vueLoaderConfig
    }, {
      test: /\.js$/,
      loader: 'babel-loader',
      include: path.resolve(__dirname, './node_modules/vux')
      // exclude: path.resolve(__dirname, './node_modules/vux'),
    }, {
      test: /\.css$/,
      use: ExtractTextPlugin.extract({
        fallback: 'style-loader',
        use: [{
          loader: 'css-loader',
          options: {
            minimize: true // 启用压缩
          }
        }]
      })
    }, {
      test: /\.(png|jpe?g|gif|svg)(\?.*)?$/,
      loader: 'url-loader',
      query: {
        limit: 10000,
        name: 'img/[name].[hash:7].[ext]'
      }
    }, {
      test: /\.(woff2?|eot|ttf|otf)(\?.*)?$/,
      loader: 'url-loader',
      query: {
        limit: 10000,
        name: 'fonts/[name].[hash:7].[ext]'
      }
    }]
  }
}
module.exports = vuxLoader.merge(dllConfig, {
  plugins: [
    'vux-ui' // v-cart/mixin.js 需要这个插件
    // 'duplicate-style',
  ] // 数组方式插件配置
})
