const fs = require('fs')
const glob = require('glob')
const path = require('path')
const _ = require('lodash')
const HtmlWebpackPlugin = require('html-webpack-plugin')
// bundle-config.json中读取文件名, 配合html-webpack-plugin自动加入到html中
let bundleConfig = ''
try {
  bundleConfig = require('../dll/bundle-config.json')
} catch (err) {
  bundleConfig = ''
}
const config = require('../config')
const dev = process.env.NODE_ENV !== 'production' // 是否开发模式
// 源文件打包错误
// let args = process.argv.splice(2)
let args = config.build.includeModuleName // 生产的所有模块
let all = args[args.length - 1] === 'all' // 最后一个是否 all
const chalk = require('chalk')
if (dev && !bundleConfig) { console.log(chalk.red('如果使用dllPlugin, 请先运行"npm run dll !"\n')); throw 'error' } // 如果是开发模式而且没有dll/bundle-config.json文件, 则提示使用dllPlugin

/*
    返回一个HtmlWebpackPlugin配置, 根据页面输出 .html 文件
    fileName main.js 'demo/test/vuxTest'或'test/vuxTest的'
   title 标题
*/
let build_entry_html = (fileName, title) => {
  // const vHost = config.build.virtualHost
  // let manifest = 'manifest';
  // let vendor = 'vendor';
  // let vue_vux = 'vue_vux';
  // let client = 'client';
  let chunks = ['manifest', 'vendor', fileName]
  let minify = dev ? {} : { // 生产环境的minify
    removeComments: true,
    collapseWhitespace: true,
    removeAttributeQuotes: true,
    minifyJS: true,
    minifyCSS: true
  }
  return new HtmlWebpackPlugin({ // 返回一个HtmlWebpackPlugin配置
    filename: `${fileName}.html`,
    template: 'template.html',
    title,
    minify,
    inject: true,
    chunks,
    chunksSortMode: 'dependency',
    vhost: dev ? '' : '../../' + config.build.virtualHost, // 资源放置的目录
    libJsName: dev && bundleConfig ? '/' + bundleConfig.libs.js : ''
  })
}
const checkFile = name => {
  let mainfile = path.resolve(__dirname, '../src/module', name)
  return fs.existsSync(mainfile)
}
/* 返回模块名拼接成的字符串, '*' */
function genDir(includeModuleName) {
  if (args && !dev) return args[0] // 生产为第一模块
  else { // 开发可以多模块
    let dir = '' // 没有空情况
    let includeModuleNameLength = includeModuleName.length
    if (includeModuleNameLength === 0) { // 没有就运行全部
      dir = '*'
    } else if (includeModuleNameLength === 1) { //
      dir = includeModuleName[0]
    } else {
      dir = '{' + includeModuleName.join(',') + '}' // 类似 "{demo,othe_module}" 字符串
    }
    return dir //
  }
}
/* { HtmlWebpackPlugin: [], entrys: {} } */
exports.genMultiEntries = function() {
  // args 生产打包模块
  if (!all && !dev) { // 不是all, 不是dev需要判断长度
    if (args.length <= 0) {
      console.log(chalk.yellow('npm run build 需要指定打包的模块名!'))
      throw 'error'
    }
    if (args.length > 1) {
      console.log(chalk.yellow('npm run build 每次只能打一个包,请检查参数！！'))
      throw 'error'
    }
  }
  // includeModuleName 开发模式要加载的模块
  let includeModuleName = config.local.includeModuleName
  let includeSubModuleName = config.local.includeSubModuleName // 生产子模块有什么用???
  let hasSubModuleFilter = includeSubModuleName.length !== 0 // 是否有子模块

  let files = {
    HtmlWebpackPlugin: [], // 所有页面HtmlWebpackPlugin的数组
    entrys: {}
  }

  let dir = path.resolve(__dirname, '../src/module/' + genDir(includeModuleName) + '/conf.json') // /module/中的.json文件
  /* glob.sync(dir) 获取文件列表 */
  glob.sync(dir).forEach(confPath => { // confPath模块的路径???
    let moduleName = path.dirname(confPath).split('/').pop() // 返回删除的元素, 返回模块名???
    let moduleConf = require(confPath) //
    for (let m in moduleConf) { // 二级文件夹
      // 开发模式命中子模块加载
      if (dev && hasSubModuleFilter && !includeSubModuleName.includes(m)) continue
      for (let p in moduleConf[m]) { // 每个页面
        let {
          entry = `${m}/${p}/main.js`, title = null
        } = moduleConf[m][p]

        if (!title) { // 标题是必须的
          throw `配置有误！\n${moduleName}/${m}/${p}的配置信息不完整！`
        }
        // 检查开发人员是否正常配置，没有的话需有抛出错误，规则虽简单，一定程度上减少失误
        /* 检查当不存在main.js 或index.vue时出错 */
        if (!checkFile(`${moduleName}/${m}/${p}/main.js`) || !checkFile(`${moduleName}/${m}/${p}/index.vue`)) {
          console.log(chalk.yellow(`配置有误！\n ${entry} 的配置信息不完整！`))
          throw 'error'
        }
        let entryPath = dev ? `${moduleName}/${m}/${p}` : `${m}/${p}`
        files.HtmlWebpackPlugin.push(build_entry_html(entryPath, title))
        files.entrys[entryPath] = path.resolve(__dirname, '../src/module/', moduleName, entry)
        if (!dev) files.moduleName = moduleName // 生产环境, 模块名属性
        // let mpath = path.resolve(__dirname, '../src/module/', moduleName, entry);
        // if (fs.existsSync(mpath)) {
        //     console.log('文件存在')
        // } else {
        //     console.log(mpath);
        // }
      }
    }
  })
  return files
}
