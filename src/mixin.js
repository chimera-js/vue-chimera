import VueChimera from './VueChimera'
import { hasKey, isPlainObject } from './utils'

export default {
  beforeCreate () {
    const vmOptions = this.$options
    let chimera

    // Stop if instance doesn't have chimera or already initialized
    /* istanbul ignore if */
    if (!vmOptions.chimera || vmOptions._chimera) return

    if (typeof vmOptions.chimera === 'function') {
      // Initialize with function
      vmOptions.chimera = vmOptions.chimera.call(this)
    }
    /* istanbul ignore else */
    if (isPlainObject(vmOptions.chimera)) {
      const { $options, ...endpoints } = vmOptions.chimera
      chimera = new VueChimera(this, endpoints, $options)
    } else {
      throw new Error('[Chimera]: chimera options should be an object or a function that returns object')
    }

    if (!Object.prototype.hasOwnProperty.call(this, '$chimera')) {
      Object.defineProperty(this, '$chimera', {
        get: () => chimera.endpoints
      })
    }
    Object.keys(chimera.endpoints).forEach(key => {
      if (!(hasKey(vmOptions.computeds, key) || hasKey(vmOptions.props, key) || hasKey(vmOptions.methods, key))) {
        Object.defineProperty(this, key, {
          get: () => this.$chimera[key],
          enumerable: true,
          configurable: true
        })
      }
    })
    this._chimera = chimera
  },

  data () {
    /* istanbul ignore if */
    if (!this._chimera) return {}
    return {
      $chimera: this._chimera.endpoints
    }
  },

  created () {
    /* istanbul ignore if */
    if (!this._chimera) return
    this._chimera.init()
    this.$isServer && this._chimera.initServer()
  },

  beforeDestroy () {
    /* istanbul ignore if */
    if (!this._chimera) return
    this._chimera.destroy()
  },

  serverPrefetch (...args) {
    /* istanbul ignore if */
    if (!this.$_chimeraPromises) return
    const ChimeraSSR = require('../ssr/index')
    return Promise.all(this.$_chimeraPromises).then(results => {
      results.forEach(endpoint => {
        endpoint && ChimeraSSR.addEndpoint(endpoint)
      })
    })
  }
}
