'use strict'
module.exports = {
  NODE_ENV: '"production"',
  debug: true, // 是否启用debug模式（浏览器调试）
  silent: false, // 是否开启静默模式（屏蔽tools.log()的调试日志）
  assestRootPath: '"../public"',

  // 需要运行的模块
  includeModuleName: [
    'demo' // demo
  ],
  // 需要运行的子模块，空数组即全部运行
  includeSubModuleName: [
    // 'test'
  ]
}
