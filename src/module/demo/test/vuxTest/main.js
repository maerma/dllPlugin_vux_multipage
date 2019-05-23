import Vue from 'vue'
import '@/main'
import App from './index.vue'

window.__VUE__ = new Vue({
  el: '#app',
  template: '<App />',
  components: {
    App
  }
})
