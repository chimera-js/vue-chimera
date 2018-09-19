import VueChimera from './VueChimera'
import { isPlainObject } from './utils'

export default (config = {}) => ({
  beforeCreate () {
    const options = this.$options
    let _chimera

    // Stop if instance doesn't have chimera or already initialized
    if (!options.chimera || options._chimera) return

    if (options.chimera instanceof VueChimera) {
      _chimera = options.chimera
    } else if (typeof options.chimera === 'function') {
      // Initialize with function
      let chimeraOptions = options.chimera.bind(this)()
      if (chimeraOptions instanceof VueChimera) {
        _chimera = chimeraOptions
      } else {
        _chimera = new VueChimera(Object.assign({}, config, chimeraOptions), this)
      }
    } else if (isPlainObject(options.chimera)) {
      _chimera = new VueChimera(Object.assign({}, config, options.chimera), this)
    }

    this._chimeraWatcher = _chimera.watch()
    _chimera.subscribe(this)

    options.computed = options.computed || {}
    options.watch = options.watch || {}
    for (let key in _chimera.resources) {
      options.computed[key] = function () {
        return this.$chimera[key]
      }
    }
    for (let key in _chimera._reactiveResources) {
      options.computed['__' + key] = _chimera._reactiveResources[key]
      options.watch['__' + key] = () => _chimera.updateReactiveResource(key)
    }

    // Nuxtjs prefetch
    const NUXT = typeof process !== 'undefined' && process.server && this.$ssrContext
      ? this.$ssrContext.nuxt
      : (typeof window !== 'undefined' ? window.__NUXT__ : null)
    if (_chimera && NUXT && NUXT.chimera) {
      if (this.$router) {
        let matched = this.$router.match(this.$router.currentRoute.fullPath);
        (matched ? matched.matched : []).forEach((m, i) => {
          let nuxtChimera = NUXT.chimera[i]
          if (nuxtChimera) {
            Object.keys(_chimera.resources).forEach(key => {
              let localResource = _chimera.resources[key]
              let ssrResource = nuxtChimera[key]
              if (localResource && ssrResource && ssrResource._data) {
                ['_data', '_status', '_headers', 'ssrPrefetched', '_lastLoaded'].forEach(key => {
                  localResource[key] = ssrResource[key]
                })
              }
            })
          }
        })
        if (process.client) {
          delete NUXT.chimera
        }
      }
    }

    this.$chimera = _chimera.resources
    this._chimera = _chimera
  },

  mounted () {
    if (this._chimera) {
      this._chimera.updateReactiveResources()
      for (let r in this._chimera._resources) {
        let resource = this._chimera._resources[r]
        if (resource.prefetch && (!resource.ssrPrefetched || resource.ssrPrefetch === 'override')) { resource.reload() }
      }
    }
  },

  beforeDestroy () {
    if (!this._chimera) {
      return
    }

    this._chimera.unsubscribe(this)
    this._chimera.cancelAll()

    if (this._chimeraWatcher) {
      this._chimeraWatcher()
      delete this._chimeraWatcher
    }

    this._chimera = null
  }
})
