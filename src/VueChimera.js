import Vue from 'vue'
import Resource from './Resource'
import NullResource from './NullResource'
import { createAxios } from './utils'

// Start intervals, unregister events, prefetch
export default class VueChimera {
  constructor (vm, resources, { ...options }) {
    this._vm = vm
    this._watchers = []

    this._axios = options.axios = createAxios(options.axios)
    this._options = options
    this._resources = resources
    // this._vm.$on('hook:created', this.init)
  }

  init () {
    const resources = this._resources = Object.assign({}, this._resources)
    for (let key in resources) {
      if (key.charAt(0) === '$') continue

      let r = resources[key]
      if (typeof r === 'function') {
        this._watchers.push(this._vm.$watch(() => r.call(this._vm), (t, f) => this.updateResource(key, t, f), {
          immediate: true,
          deep: true
        }))
      } else {
        resources[key] = this.resourceFrom(r, key)
      }
      Object.defineProperty(this._vm, key, {
        get: () => resources[key],
        configurable: true,
        enumerable: true
      })
    }

    Object.defineProperty(resources, '$cancelAll', { value: this.cancelAll.bind(this) })
    Object.defineProperty(resources, '$axios', { get: () => this._axios })
    Object.defineProperty(resources, '$loading', { get () { return !!Object.values(this).find(Boolean) } })
  }

  updateResource (key, newValue, oldValue) {
    const oldResource = this._resources[key]
    const newResource = this.resourceFrom(newValue, key)

    // Keep data
    if (oldValue && oldValue.keepData) {
      newResource.setInitial(oldResource)
    }
    if (oldValue && oldResource) {
      oldResource.stopInterval()
      newResource.lastLoaded = oldResource.lastLoaded
    }

    if (newResource.prefetch) newResource.reload()
    this._resources[key] = newResource
  }

  resourceFrom (value, key) {
    if (value == null) return new NullResource()
    if (typeof value === 'string') value = { url: value }

    return new Resource(Object.assign(Object.create(this._options), value))
  }

  cancelAll () {
    Object.values(this._resources).forEach(r => {
      r.cancel()
    })
  }

  destroy () {
    const vm = this._vm

    this.cancelAll()
    delete vm._chimera
  }
}
