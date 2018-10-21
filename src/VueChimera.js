import Resource from './Resource'
import NullResource from './NullResource'
import { createAxios } from './utils'

export default class VueChimera {
  constructor (vm, resources, options) {
    this._vm = vm
    this._reactiveResources = {}
    this.options = options || {}

    this._axios = this.options.axios = createAxios(this.options.axios)

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
        resources[key] = Resource.from(r, this.options)
      }
      vmOptions.computed[key] = () => resources[key]
    }

    Object.defineProperty(resources, '$cancelAll', { value: this.cancelAll.bind(this) })
    Object.defineProperty(resources, '$axios', { get: () => this._axios })
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
    let r = this.resources[key] = Resource.from(this._reactiveResources[key](), this.options)
    if (r.prefetch) r.reload()
  }

  cancelAll () {
    Object.keys(this.resources).forEach(r => {
      this.resources[r].cancel()
    })
  }
}
