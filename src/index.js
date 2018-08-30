import Vue from 'vue'
import mixin from './mixin'
import Resource from './Resource'
import { createAxios } from './utils'

Vue.config.silent = true
Vue.config.productionTip = false
Vue.config.devtools = false

const plugin = {

  options: {
    axios: null,
    cache: 'no-cache',
    debounce: 200
  },

  install (Vue, options = {}) {
    Object.assign(this.options, options)
    Resource.cache = this.options.cache
    Resource.axios = createAxios(this.options.axios)
    Vue.mixin(mixin(this.options))
  }

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

export { default as NuxtPlugin } from './NuxtPlugin'

export default plugin
