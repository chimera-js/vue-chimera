import VueChimera from './VueChimera'
import { isPlainObject } from './utils'

export default (config = {}) => ({
  beforeCreate () {
    const options = this.$options
    let _chimera

    // Stop if instance doesn't have chimera or already initialized
    if (!options.chimera || options._chimera) return

    if (typeof options.chimera === 'function') {
      // Initialize with function
      options.chimera = options.chimera.call(this)
    }

    if (options.chimera instanceof VueChimera) {
      _chimera = options.chimera
    } else if (isPlainObject(options.chimera)) {
      const { $options, ...resources } = options.chimera
      _chimera = new VueChimera(
        this, resources, { ...config, ...$options }
      )
    }

    options.computed = options.computed || {}
    options.watch = options.watch || {}

    // Nuxtjs prefetch
    const NUXT = typeof process !== 'undefined' && process.server && this.$ssrContext
      ? this.$ssrContext.nuxt
      : (typeof window !== 'undefined' ? window.__NUXT__ : null)
    if (_chimera && NUXT && NUXT.chimera) {
      try {
        if (this.$router) {
          let matched = this.$router.match(this.$router.currentRoute.fullPath);
          (matched ? matched.matched : []).forEach((m, i) => {
            let nuxtChimera = NUXT.chimera[i]
            if (nuxtChimera) {
              Object.keys(_chimera.resources).forEach(key => {
                let localResource = _chimera.resources[key]
                let ssrResource = nuxtChimera[key]
                if (localResource && ssrResource && ssrResource._data) {
                  [
                    '_data', '_status', '_headers', 'ssrPrefetched',
                    '_lastLoaded'].forEach(key => {
                    localResource[key] = ssrResource[key]
                  })
                }
              })
            }
          })
          // if (process.client) {
          //   delete NUXT.chimera
          // }
        }
      } catch (e) {}
    }
    this._chimera = _chimera
  },

  data () {
    if (this._chimera) {
      return { $chimera: this._chimera.resources }
    }
    return {}
  },

  mounted () {
    if (this._chimera) {
      this._chimera.updateReactiveResources()
      for (let r in this._chimera.resources) {
        let resource = this._chimera.resources[r]
        if (resource.prefetch && (!resource.ssrPrefetched || resource.ssrPrefetch === 'override')) {
          resource.reload()
        }
      }
    }
  },

  beforeDestroy () {
    if (!this._chimera) {
      return
    }

    this._chimera.cancelAll()
    this._chimera = null
    delete this._chimera
  }
})
