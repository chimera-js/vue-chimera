import mixin from './mixin'
import ChimeraEndpoint from './components/ChimeraEndpoint.vue'
import Endpoint from './Endpoint'
import { mergeExistingKeys } from './utils'

const plugin = {

  options: {
    baseURL: null,
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
    options = mergeExistingKeys(this.options, options)

    Vue.mixin(mixin(options))
    Vue.component('chimera-endpoint', ChimeraEndpoint)
    Vue.prototype.$chimeraOptions = options

    const { deep, ssrContext, ...endpointOptions } = options
    Object.assign(Endpoint.prototype, endpointOptions)
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
