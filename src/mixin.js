import VueChimera from './VueChimera'
import ChimeraSSR from '../ssr/index'
import { isPlainObject } from './utils'

export default (options = {}) => ({
  beforeCreate () {
    const vmOptions = this.$options
    let _chimera

    // Stop if instance doesn't have chimera or already initialized
    if (!vmOptions.chimera || vmOptions._chimera) return

    if (typeof vmOptions.chimera === 'function') {
      // Initialize with function
      vmOptions.chimera = vmOptions.chimera.call(this)
    }

    if (vmOptions.chimera instanceof VueChimera) {
      _chimera = vmOptions.chimera
    } else if (isPlainObject(vmOptions.chimera)) {
      const { $options, ...resources } = vmOptions.chimera
      _chimera = new VueChimera(this, resources, { ...options, ...$options })
    }

    // Nuxtjs prefetch
    // const NUXT = typeof process !== 'undefined' && process.server && this.$ssrContext
    //   ? this.$ssrContext.nuxt
    //   : (typeof window !== 'undefined' ? window.__NUXT__ : null)
    // if (_chimera && NUXT && NUXT.chimera) {
    //   try {
    //     if (this.$router) {
    //       let matched = this.$router.match(this.$router.currentRoute.fullPath);
    //       (matched ? matched.matched : []).forEach((m, i) => {
    //         let nuxtChimera = NUXT.chimera[i]
    //         if (nuxtChimera) {
    //           Object.keys(_chimera.resources).forEach(key => {
    //             let localResource = _chimera.resources[key]
    //             let ssrResource = nuxtChimera[key]
    //             if (localResource && ssrResource && ssrResource._data) {
    //               [
    //                 '_data', '_status', '_headers', 'ssrPrefetched',
    //                 '_lastLoaded'].forEach(key => {
    //                 localResource[key] = ssrResource[key]
    //               })
    //             }
    //           })
    //         }
    //       })
    //       // if (process.client) {
    //       //   delete NUXT.chimera
    //       // }
    //     }
    //   } catch (e) {}
    // }
    this._chimera = _chimera
    Object.defineProperty(this, '$chimera', {
      get: () => _chimera._resources
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

  serverPrefetch () {
    if (!this.$_chimeraPromises) return
    return Promise.all(this.$_chimeraPromises.map(p => p())).then(results => {
      results.forEach(r => {
        r && ChimeraSSR.addResource(r)
      })
    })
  }
})
