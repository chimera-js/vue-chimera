import mixin from './mixin'
import VueChimera from './VueChimera'
import ChimeraEndpoint from './components/ChimeraEndpoint'
import Endpoint from './Endpoint'
import { mergeExistingKeys } from './utils'

const DEFAULT_OPTIONS = {
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
}

export function install (Vue, options = {}) {
  options = mergeExistingKeys({}, DEFAULT_OPTIONS, options)

  Vue.mixin(mixin)
  Vue.component('chimera-endpoint', ChimeraEndpoint)

  const { deep, ssrContext, ...endpointOptions } = options
  Object.assign(Endpoint.prototype, endpointOptions)
  Object.assign(VueChimera.prototype, {
    deep,
    ssrContext
  })
}

export default install

export * from './events'
export { StorageCache } from './cache/StorageCache'
export { MemoryCache } from './cache/MemoryCache'
