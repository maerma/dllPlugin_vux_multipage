'use strict'
// Template version: 1.2.8
// see http://vuejs-templates.github.io/webpack for documentation.

const path = require('path')
const LOCAL_ENV = require('./local.env')
const DEV_ENV = require('./dev.env')
const DEVICE_ENV = require('./device.env')
const PROD_ENV = require('./prod.env')

module.exports = {
  local: {
    includeModuleName: LOCAL_ENV.includeModuleName,
    includeSubModuleName: LOCAL_ENV.includeSubModuleName
  },
  dev: {

    // Paths
    assetsSubDirectory: './',
    assetsPublicPath: '/',
    assestRootPath: DEV_ENV.assestRootPath,
    proxyTable: {
      '/api': {
        target: 'http://localhost:80/api',
        changeOrigin: true,
        pathRewrite: {
          '^/api': '/'
        }
      }
    },

    // Various Dev Server settings
    host: '0.0.0.0', // can be overwritten by process.env.HOST
    port: 8080, // can be overwritten by process.env.PORT, if port is in use, a free one will be determined
    autoOpenBrowser: false,
    errorOverlay: true,
    notifyOnErrors: true,
    poll: false, // https://webpack.js.org/configuration/dev-server/#devserver-watchoptions-
    /**
     * Source Maps
     */
    // https://webpack.js.org/configuration/devtool/#development
    devtool: 'cheap-module-eval-source-map',
    // If you have problems debugging vue-files in devtools,
    // set this to false - it *may* help
    // https://vue-loader.vuejs.org/en/options.html#cachebusting
    cacheBusting: true,
    cssSourceMap: true,
    bundleAnalyzerReport: false // 是否使用统计工具
  },
  device: {
    assetsSubDirectory: './',
    assetsPublicPath: '/',
    host: '0.0.0.0',
    port: 1230,
    poll: true,
    devtool: 'none',
    cacheBusting: true,
    cssSourceMap: false
  },

  build: {
    // Template for index.html
    index: path.resolve(__dirname, '../dist/index.html'),
    // Paths
    assetsRoot: path.resolve(__dirname, '../dist/www'),
    assetsSubDirectory: './',
    assetsPublicPath: '/',
    /**
         * Source Maps
         */
    productionSourceMap: false,
    // https://webpack.js.org/configuration/devtool/#production
    devtool: 'none',
    // Gzip off by default as many popular static hosts such as
    // Surge or Netlify already gzip all static assets for you.
    // Before setting to `true`, make sure to:
    // npm install --save-dev compression-webpack-plugin
    productionGzip: false,
    productionGzipExtensions: ['js', 'css'],

    // Run the build command with an extra argument to
    // View the bundle analyzer report after build finishes:
    // `npm run build --report`
    // Set to `true` or `false` to always turn it on or off
    bundleAnalyzerReport: false,
    virtualHost: 'assets', // 本地配置静态公共资源文件
    includeModuleName: PROD_ENV.includeModuleName,
    includeSubModuleName: PROD_ENV.includeSubModuleName
  }
}
