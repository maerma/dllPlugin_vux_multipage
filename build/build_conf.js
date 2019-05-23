const chalk = require('chalk')
const config = require('../config')
const fs = require('fs')
const glob = require('glob')
const path = require('path')
const ora = require('ora')
const spinner = ora('start building for conf...')
const appid = require('../package.json').apps
spinner.start()

const _resolve = url => {
  return path.resolve(__dirname, url)
}

const build_conf = (url, data) => {
  fs.writeFileSync(url, data)
}

const build = function() {
  let build_conf_h5 = {}
  let build_conf_client = { appList: [] }
  let dir = glob.sync(path.resolve(__dirname, '../src/modules/*/conf.json'))
  let { exclude } = config.build
  dir.forEach(confPath => {
    // 获取包名
    let moduleName = path.dirname(confPath).split('/').pop()
    // require包下面的conf.json
    let moduleConf = require(confPath)

    build_conf_client.appList.push({
      packageName: moduleName,
      appId: appid[moduleName],
      modulesName: []
    })

    for (let m in moduleConf) {
      if (!exclude.includes(m) && /^name_/.test(m)) {
        for (let p in moduleConf[m]) {
          let { needLogin } = moduleConf[m][p]
          if (needLogin === false) {
            build_conf_h5[`/${moduleName}/${m}/${p}`] = needLogin
          }
        }

        build_conf_client.appList[build_conf_client.appList.length - 1].modulesName.push(m)
      }
    }
  })

  return {
    h5: build_conf_h5,
    client: build_conf_client
  }
}

let data = build()
build_conf(_resolve('helper/build_h5_conf.json'), JSON.stringify(data.h5))
console.log(chalk.cyan('\n\n build_h5_conf.json complete.\n'))
build_conf(_resolve('helper/build_client_conf.json'), JSON.stringify(data.client))
console.log(chalk.cyan(' build_client_conf.json complete.\n'))
spinner.succeed('build conf complete \n')
spinner.stop()
