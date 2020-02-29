import mixin from './mixin'

const plugin = {

  options: {
    axios: null,
    cache: null,
    debounce: 50,
    deep: true,
    keepData: true,
    autoFetch: 'get', // false, true, '%METHOD%',
    prefetch: false,
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
  GlobalVue.use(plugin, plugin.options)
}

export default plugin

export * from './Resource'
export { StorageCache } from './cache/StorageCache'
export { MemoryCache } from './cache/MemoryCache'
