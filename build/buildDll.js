const ora = require('ora')
const rm = require('rimraf')
const path = require('path')
const chalk = require('chalk')
const webpack = require('webpack')
const dllConfig = require('./webpack.dll.config.js')

const spinner = ora({
  color: 'green',
  text: 'Dll生产中...'
})
spinner.start()

rm(path.resolve(__dirname, '../dll'), err => {
  if (err) throw err
  webpack(dllConfig, function(err, stats) {
    spinner.stop()
    if (err) throw err
    process.stdout.write(stats.toString({
      colors: true,
      modules: false,
      children: false,
      chunks: false,
      chunkModules: false
    }) + '\n\n')

    console.log(chalk.cyan('  dll succeed ！.\n'))
  })
})
