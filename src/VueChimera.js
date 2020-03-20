import BaseEndpoint from './Endpoint'
import NullEndpoint from './NullEndpoint'
import { isPlainObject, getServerContext, warn, removeUndefined } from './utils'
import { createAxios } from './http/axiosAdapter'

const shouldAutoFetch = r => r.auto && (!r.prefetched || r.prefetch === 'override')

export default class VueChimera {
  constructor (vm, { ...endpoints }, options) {
    this._vm = vm
    this._watchers = []

    let { deep, ssrContext, axios, ...endpointOptions } = options || {}
    const LocalEndpoint = this.LocalEndpoint = class Endpoint extends BaseEndpoint {}
    bindVmToEvents(endpointOptions, this._vm)
    LocalEndpoint.prototype.options = LocalEndpoint.applyDefaults(LocalEndpoint.prototype.options, endpointOptions)
    Object.assign(this, removeUndefined({ deep, ssrContext, axios }))
    LocalEndpoint.prototype.axios = createAxios(typeof this.axios === 'function' && !this.axios.request ? this.axios.call(vm) : this.axios)

    this._ssrContext = getServerContext(this.ssrContext)
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
          () => r.call(vm),
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
    Object.defineProperty(endpoints, '$loading', { get () { return !!Object.values(this).find(el => !!el.loading) } })
    this.endpoints = endpoints
  }

  init () {
    this._watchers = this._watchers.map(w => this._vm.$watch(...w))
  }

  initServer () {
    this._vm.$_chimeraPromises = []
    Object.values(this.endpoints).forEach(endpoint => {
      if (endpoint.auto && endpoint.prefetch) {
        /* istanbul ignore if */
        if (!endpoint.key) {
          warn('used prefetch with no key associated with endpoint!')
          return
        }
        this._vm.$_chimeraPromises.push(endpoint.fetch(true, { timeout: endpoint.prefetchTimeout }).then(() => endpoint).catch(() => null))
      }
    })
  }

  updateEndpoint (key, newValue, oldValue) {
    const oldEndpoint = this.endpoints[key]
    const newEndpoint = this.endpointFrom(newValue, oldEndpoint && oldEndpoint.keepData ? oldEndpoint.response : null)

    if (oldValue && oldEndpoint) {
      oldEndpoint.stopInterval()
      oldEndpoint.cancel(true)
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

    bindVmToEvents(value, this._vm)

    const endpoint = new (this.LocalEndpoint || BaseEndpoint)(value, initial)

    if (!this._server && !initial && endpoint.key && endpoint.prefetch && this._ssrContext) {
      initial = this._ssrContext[value.key]
      if (initial) initial.prefetched = true
      Object.assign(endpoint, initial)
    }
    return endpoint
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

function bindVmToEvents (value, vm) {
  if (isPlainObject(value.on)) {
    const bindVm = (handler) => {
      if (typeof handler === 'function') {
        handler = handler.bind(vm)
      }
      if (typeof handler === 'string') handler = vm[handler]
      return handler
    }
    Object.entries(value.on).forEach(([event, handlers]) => {
      value.on[event] = (Array.isArray(handlers) ? handlers.map(bindVm) : bindVm(handlers))
    })
  }
}
