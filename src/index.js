import mixin from './mixin'
import VueChimera from './VueChimera'
import ChimeraEndpoint from './components/ChimeraEndpoint'
import Endpoint from './Endpoint'

const DEFAULT_OPTIONS = {
  baseURL: null,
  cache: null,
  debounce: 50,
  deep: true,
  keepData: true,
  auto: 'get', // false, true, '%METHOD%',
  prefetch: true,
  prefetchTimeout: 4000,
  transformer: null,
  ssrContext: null
}

export function install (Vue, options = {}) {
  options = Object.assign({}, DEFAULT_OPTIONS, options)

  Vue.mixin(mixin)
  Vue.component('chimera-endpoint', ChimeraEndpoint)

  const { deep, ssrContext, ...endpointOptions } = options
  Endpoint.prototype.options = endpointOptions
  Object.assign(VueChimera.prototype, {
    deep,
    ssrContext
  })

  // const merge = Vue.config.optionMergeStrategies.methods
  Vue.config.optionMergeStrategies.chimera = function (toVal, fromVal, vm) {
    if (!toVal) return fromVal
    if (!fromVal) return toVal

    if (typeof fromVal === 'function') fromVal = fromVal.call(vm)
    if (typeof toVal === 'function') toVal = toVal.call(vm)

    return Object.assign({}, toVal, fromVal, toVal.$options && fromVal.$options ? {
      $options: Endpoint.applyDefaults(toVal.$options, fromVal.$options)
    } : {})
  }
}

export default install

export * from './events'
export { StorageCache } from './cache/StorageCache'
export { MemoryCache } from './cache/MemoryCache'
