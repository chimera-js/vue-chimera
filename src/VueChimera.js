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
      if (key.charAt(0) === '$' || !resources.hasOwnProperty(key)) continue

      let r = resources[key]

      if (typeof r === 'function') {
        r = r.bind(this._vm)
        resources[key] = new NullResource()
        this._reactiveResources[key] = r
        vmOptions.computed['$_chimera__' + key] = r
        vmOptions.watch['$_chimera__' + key] = (t) => this.updateReactiveResource(key, t)
      } else {
        resources[key] = Resource.from(r, this.options)
      }
      vmOptions.computed[key] = () => resources[key]
      resources[key].bindListeners(this._vm)
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
    Object.keys(this._reactiveResources).forEach(key => {
      this.updateReactiveResource(key)
    })
  }

  updateReactiveResource (key) {
    const oldResource = this.resources[key]
    oldResource.stopInterval()
    let r = Resource.from(this._reactiveResources[key].call(this._vm), this.options)

    // Keep data
    if (oldResource.keepData) {
      r._data = oldResource._data
      r._status = oldResource._status
      r._headers = oldResource._headers
      r._error = oldResource._error
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
