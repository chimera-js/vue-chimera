import Resource from './Resource'

export default function () {
  let baseOptions = this.options

  return function ({ beforeNuxtRender, isDev, $axios }) {
    if (!baseOptions.axios && $axios != null) {
      Resource.config.axios = $axios
    }

    if (!beforeNuxtRender) { return }

    async function prefetchAsyncData ({ Components, nuxtState }) {
      nuxtState.chimera = nuxtState.chimera || {}

      for (let i = 0, len = Components.length; i < len; i++) {
        let component = Components[i]
        const options = component.options

        if (!options.chimera) { continue }

        let nuxtChimera = {}
        for (let key in options.chimera.resources) {
          if (key && key.charAt(0) === '$') { continue }

          let resource = options.chimera.resources[key]

          if (resource && typeof resource !== 'function') {
            resource = resource && resource._data ? resource : Resource.from(resource)
            if (!resource.prefetch || !resource.ssrPrefetch) continue
            try {
              isDev && console.log('  Prefetching: ' + resource.requestConfig.url) // eslint-disable-line no-console

              // resource.axios = Axios
              let response = await resource.execute()
              resource._data = response.data
            } catch (e) {
              isDev && console.error(e.message) // eslint-disable-line no-console
            }
            resource.ssrPrefetched = true
            options.chimera.resources[key] = nuxtChimera[key] = resource
          }
        }
        if (Object.keys(nuxtChimera).length) {
          nuxtState.chimera[i] = nuxtChimera
        }
      }
    }

    beforeNuxtRender((...args) => {
      return new Promise((resolve, reject) => {
        prefetchAsyncData(...args).then(resolve).catch(reject)
        setTimeout(reject, baseOptions.ssrPrefetchTimeout, new Error('  SSR Prefetch Timeout.'))
      }).catch(err => {
        isDev && console.error(err.message) // eslint-disable-line no-console
      })
    })
  }
}
