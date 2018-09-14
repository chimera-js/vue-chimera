import Vue from 'vue'
import mixin from './mixin'
import NuxtPlugin from './NuxtPlugin'

Vue.config.silent = true
Vue.config.productionTip = false
Vue.config.devtools = false

const plugin = {

  options: {
    axios: null,
    cache: 'no-cache',
    debounce: 80,
    prefetch: 'get', // false, true, '%METHOD%',
    ssrPrefetch: true,
    ssrPrefetchTimeout: 4000
  },

  install (Vue, options = {}) {
    Object.assign(this.options, options)
    Vue.mixin(mixin(this.options))
  },

  NuxtPlugin

}

// Auto-install
let GlobalVue = null
if (typeof window !== 'undefined') {
  GlobalVue = window.Vue
} else if (typeof global !== 'undefined') {
  GlobalVue = global.Vue
}

if (GlobalVue) {
  GlobalVue.use(plugin)
}

export default plugin
