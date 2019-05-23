// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue'
import '@/common/scss/index.scss'
import '@/client' // 用于开发环境>虚拟连接,生产环境>
import { DatetimePlugin } from 'vux' // vux的datetime注册全局插件

const FastClick = require('fastclick')
FastClick.attach(document.body)

Vue.config.productionTip = false
Vue.use(DatetimePlugin)
Vue.config.devtools = process.env.NODE_ENV !== 'production'

if (process.env.NODE_ENV !== 'production') {
  Vue.config.errorHandler = function(err, vm, info) {
    console.log(err.name + ': ' + err.message + ' \n ' + err.stack) // 控制台打印捕获的错误
  }
}
