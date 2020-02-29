import VueChimera from './VueChimera'
import { isPlainObject } from './utils'

export default (options = {}) => ({
  beforeCreate () {
    const vmOptions = this.$options
    let chimera

    // Stop if instance doesn't have chimera or already initialized
    if (!vmOptions.chimera || vmOptions._chimera) return

    if (typeof vmOptions.chimera === 'function') {
      // Initialize with function
      vmOptions.chimera = vmOptions.chimera.call(this)
    }

    if (vmOptions.chimera instanceof VueChimera) {
      chimera = vmOptions.chimera
    } else if (isPlainObject(vmOptions.chimera)) {
      const { $options, ...resources } = vmOptions.chimera
      chimera = new VueChimera(this, resources, { ...options, ...$options })
    }

    this._chimera = chimera
    Object.defineProperty(this, '$chimera', {
      get: () => chimera._resources
    })
  },

  data () {
    if (!this._chimera) return {}
    return {
      $chimera: this._chimera._resources
    }
  },

  created () {
    if (!this._chimera) return
    this._chimera.init()
    this.$isServer && this._chimera.initServer()
  },

  serverPrefetch (...args) {
    if (!this.$_chimeraPromises) return
    const ChimeraSSR = require('../ssr/index')
    return Promise.all(this.$_chimeraPromises).then(results => {
      results.forEach(r => {
        r && ChimeraSSR.addResource(r)
      })
    })
  }
})
