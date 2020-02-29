import Resource from './Resource'
import NullResource from './NullResource'
import { createAxios, hasKey, isPlainObject, getServerContext } from './utils'

const shouldAutoFetch = r => r.autoFetch && (!r.prefetched || r.prefetch === 'override')

export default class VueChimera {
  constructor (vm, { ...resources }, { deep, ssrContext, ...options }) {
    this._vm = vm
    this._watchers = []

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

    for (let key in resources) {
      if (key.charAt(0) === '$') continue

      let r = resources[key]
      if (typeof r === 'function') {
        this._watchers.push([
          () => r.call(this._vm),
          (t, f) => this.updateResource(key, t, f),
          watchOption
        ])
      } else {
        r = resources[key] = this.resourceFrom(r)
        !this._server && shouldAutoFetch(r) && r.reload()
      }
    }

    Object.defineProperty(resources, '$cancelAll', { value: this.cancelAll.bind(this) })
    Object.defineProperty(resources, '$axios', { get: () => this._axios })
    Object.defineProperty(resources, '$loading', { get () { return !!Object.values(this).find(el => !!el.loading) } })
    this._resources = resources

    // Init computeds
    const vmOptions = this._vm.$options
    const computeds = vmOptions.computed = vmOptions.computed || {}
    Object.keys(resources).forEach(key => {
      if (hasKey(computeds, key) || hasKey(vmOptions.props, key) || hasKey(vmOptions.methods, key)) return
      computeds[key] = () => this._resources[key]
    })
  }

  init () {
    this._watchers = this._watchers.map(w => this._vm.$watch(...w))
  }

  initServer () {
    this._vm.$_chimeraPromises = []
    Object.values(this._resources).forEach(r => {
      if (r.prefetch) {
        if (!r.key) {
          console.warn('[Chimera]: used prefetch with no key associated with resource!')
          return
        }
        this._vm.$_chimeraPromises.push(r.fetch(true).catch(() => null).then(() => r))
      }
    })
  }

  updateResource (key, newValue, oldValue) {
    const oldResource = this._resources[key]
    const newResource = this.resourceFrom(newValue, oldValue && oldValue.keepData ? oldResource.toObj() : null)

    if (oldValue && oldResource) {
      oldResource.stopInterval()
      newResource.lastLoaded = oldResource.lastLoaded
    }

    if (!this._server) {
      if (newValue.interval) {
        newResource.startInterval(newValue.interval)
      }

      if (shouldAutoFetch(newResource)) newResource.reload()
    }
    this._vm.$set(this._resources, key, newResource)
  }

  resourceFrom (value, initial) {
    if (value == null) return new NullResource()
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
    const r = new Resource(Object.assign(baseOptions, value), initial)

    if (!this._server && !initial && r.key && r.prefetch && this._ssrContext) {
      initial = this._ssrContext[value.key]
      if (initial) initial.prefetched = true
      Object.assign(r, initial)
    }
    return r
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
