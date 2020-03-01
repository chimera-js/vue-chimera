import VueChimera from './VueChimera'
import { isPlainObject } from './utils'

export default (options = {}) => ({
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
      const { $options, ...resources } = vmOptions.chimera
      chimera = new VueChimera(this, resources, { ...options, ...$options })
    } else {
      throw new Error('[Chimera]: chimera options should be an object or a function that returns object')
    }

    this._chimera = chimera
    if (!Object.prototype.hasOwnProperty.call(this, '$chimera')) {
      Object.defineProperty(this, '$chimera', {
        get: () => chimera._resources
      })
    }
  },

  data () {
    /* istanbul ignore if */
    if (!this._chimera) return {}
    return {
      $chimera: this._chimera._resources
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
      results.forEach(r => {
        r && ChimeraSSR.addResource(r)
      })
    })
  }
})
