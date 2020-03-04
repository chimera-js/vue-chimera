import mixin from './mixin'
import ChimeraEndpoint from './components/ChimeraEndpoint.vue'

const plugin = {

  options: {
    axios: null,
    cache: null,
    debounce: 50,
    deep: true,
    keepData: true,
    auto: 'get', // false, true, '%METHOD%',
    prefetch: null,
    prefetchTimeout: 4000,
    transformer: null,
    ssrContext: null
  },

  install (Vue, options = {}) {
    Object.keys(options).forEach(key => {
      if (key in this.options) {
        this.options[key] = options[key]
      }
    })

    Vue.mixin(mixin(this.options))
    Vue.component('chimera-endpoint', ChimeraEndpoint)
    Vue.prototype.$chimeraOptions = this.options
  }

}

// Auto-install
let GlobalVue = null
/* istanbul ignore if */
/* istanbul ignore else */
if (typeof window !== 'undefined') {
  GlobalVue = window.Vue
} else if (typeof global !== 'undefined') {
  GlobalVue = global.Vue
}

/* istanbul ignore if */
if (GlobalVue) {
  GlobalVue.use(plugin, plugin.options)
}

export default plugin

export * from './events'
export { StorageCache } from './cache/StorageCache'
export { MemoryCache } from './cache/MemoryCache'
