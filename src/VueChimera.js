import Resource from './Resource'
import NullResource from './NullResource'
import { createAxios } from './utils'

export default class VueChimera {
  constructor (vm, resources, options) {
    this._vm = vm
    this._reactiveResources = {}
    this.options = options || {}

    this.axios = this.options.axios = (!this.options.axios && this._vm.$axios) ? this._vm.$axios : createAxios(this.options.axios)

    const vmOptions = this._vm.$options
    vmOptions.computed = vmOptions.computed || {}
    vmOptions.watch = vmOptions.watch || {}

    resources = Object.assign({}, resources)

    for (let key in resources) {
      if (key.charAt(0) === '$') continue

      let r = resources[key]

      if (typeof r === 'function') {
        r = r.bind(this._vm)
        resources[key] = new NullResource()
        this._reactiveResources[key] = r
        vmOptions.computed['__' + key] = r
        vmOptions.watch['__' + key] = (t) => this.updateReactiveResource(key, t)
      } else {
        resources[key] = Resource.from(r, this.options, this._vm, this)
      }
      vmOptions.computed[key] = () => resources[key]
    }

    Object.defineProperty(resources, '$cancelAll', { value: this.cancelAll.bind(this) })
    Object.defineProperty(resources, '$axios', { get: () => this.axios })
    Object.defineProperty(resources, '$loading', {
      get () {
        for (let r in this) {
          if (r.loading) return true
        }
        return false
      }
    })
    this.resources = resources
  }

  updateReactiveResources () {
    for (let key in this._reactiveResources) {
      this.updateReactiveResource(key)
    }
  }

  updateReactiveResource (key) {
    const oldResource = this.resources[key]
    oldResource.stopInterval()
    let r = Resource.from(this._reactiveResources[key].call(this._vm), this.options, this)

    // Keep data
    if (oldResource.keepData !== false) {
      ['_status', '_data', '_headers', '_error'].forEach(key => {
        r[key] = oldResource
      })
    }

    r._lastLoaded = oldResource._lastLoaded
    if (r.prefetch) r.reload()
    this.resources[key] = r
  }

  cancelAll () {
    Object.keys(this.resources).forEach(r => {
      this.resources[r].cancel()
    })
  }
}
