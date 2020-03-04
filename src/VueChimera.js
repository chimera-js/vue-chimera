import Endpoint from './Endpoint'
import NullEndpoint from './NullEndpoint'
import { createAxios, hasKey, isPlainObject, getServerContext, warn } from './utils'

const shouldAutoFetch = r => r.auto && (!r.prefetched || r.prefetch === 'override')

export default class VueChimera {
  constructor (vm, { ...endpoints }, { deep, ssrContext, ...options }) {
    this._vm = vm
    this._watchers = []

    if (typeof options.axios === 'function') {
      options.axios = options.axios.bind(this._vm)
    }
    this._axios = options.axios = createAxios(options.axios)
    this._options = options
    this._deep = deep
    this._ssrContext = getServerContext(ssrContext)
    this._server = vm.$isServer
    const watchOption = {
      immediate: true,
      deep: this._deep,
      sync: true
    }

    for (let key in endpoints) {
      if (key.charAt(0) === '$') {
        delete endpoints[key]
        continue
      }

      let r = endpoints[key]
      if (typeof r === 'function') {
        this._watchers.push([
          () => r.call(this._vm),
          (t, f) => this.updateEndpoint(key, t, f),
          watchOption
        ])
      } else {
        r = endpoints[key] = this.endpointFrom(r)
        if (!this._server) {
          shouldAutoFetch(r) && r.reload()
        }
      }
    }

    Object.defineProperty(endpoints, '$cancelAll', { value: () => this.cancelAll() })
    Object.defineProperty(endpoints, '$axios', { get: () => this._axios })
    Object.defineProperty(endpoints, '$loading', { get () { return !!Object.values(this).find(el => !!el.loading) } })
    this.endpoints = endpoints

    // Init computeds
    const vmOptions = this._vm.$options
    const computeds = vmOptions.computed = vmOptions.computed || {}
    Object.keys(endpoints).forEach(key => {
      if (hasKey(computeds, key) || hasKey(vmOptions.props, key) || hasKey(vmOptions.methods, key)) return
      computeds[key] = () => this.endpoints[key]
    })
  }

  init () {
    this._watchers = this._watchers.map(w => this._vm.$watch(...w))
  }

  initServer () {
    this._vm.$_chimeraPromises = []
    Object.values(this.endpoints).forEach(r => {
      if (r.prefetch) {
        if (!r.key) {
          warn('used prefetch with no key associated with endpoint!')
          return
        }
        this._vm.$_chimeraPromises.push(r.fetch(true, { timeout: r.prefetchTimeout }).then(() => r).catch(() => null))
      }
    })
  }

  updateEndpoint (key, newValue, oldValue) {
    const oldEndpoint = this.endpoints[key]
    const newEndpoint = this.endpointFrom(newValue, oldValue && oldValue.keepData ? oldEndpoint.toObj() : null)

    if (oldValue && oldEndpoint) {
      oldEndpoint.stopInterval()
      newEndpoint.lastLoaded = oldEndpoint.lastLoaded
    }

    if (!this._server) {
      if (shouldAutoFetch(newEndpoint)) newEndpoint.reload()
    }
    this._vm.$set(this.endpoints, key, newEndpoint)
  }

  endpointFrom (value, initial) {
    if (value == null) return new NullEndpoint()
    if (typeof value === 'string') value = { url: value }

    if (isPlainObject(value.on)) {
      Object.entries(value.on).forEach(([event, handler]) => {
        if (typeof handler === 'function') {
          handler = handler.bind(this._vm)
        }
        if (typeof handler === 'string') handler = this._vm[handler]
        value.on[event] = handler
      })
    }

    const baseOptions = Object.create(this._options)
    const r = new Endpoint(Object.assign(baseOptions, value), initial)

    if (!this._server && !initial && r.key && r.prefetch && this._ssrContext) {
      initial = this._ssrContext[value.key]
      if (initial) initial.prefetched = true
      Object.assign(r, initial)
    }
    return r
  }

  cancelAll () {
    Object.values(this.endpoints).forEach(r => {
      r.cancel()
    })
  }

  destroy () {
    const vm = this._vm

    this.cancelAll()
    Object.values(this.endpoints).forEach(r => {
      r.stopInterval()
    })
    delete vm._chimera
  }
}
