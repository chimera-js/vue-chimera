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
    ssrPrefetchTimeout: 4000,
    transformer: null,
    headers: null
  },

  install (Vue, options = {}) {
    Object.keys(options).forEach(key => {
      if (key in this.options) {
        this.options[key] = options[key]
      }
    })

    if (!Vue.prototype.hasOwnProperty('$chimera')) {
      Object.defineProperty(Vue.prototype, '$chimera', {
        get () {
          if (this._chimera) {
            return this._chimera.resources
          }
          return null
        }
      })
    }

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
  GlobalVue.use(plugin, plugin.options)
}

export default plugin
