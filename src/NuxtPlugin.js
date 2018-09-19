import Resource from './Resource'

export default function () {
  this.options = this.options || {}
  const baseOptions = this.options

  return function ({ beforeNuxtRender, isDev, $axios }) {
    if (!beforeNuxtRender) { return }

    const resources = []
    async function prefetchAsyncData ({ Components, nuxtState }) {
      nuxtState.chimera = nuxtState.chimera || {}

      for (let i = 0, len = Components.length; i < len; i++) {
        let component = Components[i]
        let chimera = component.options ? component.options.chimera : null

        if (typeof chimera === 'function') {
          // Append @Nuxtjs/axios to component (maybe needed by constructor)
          if ($axios && !component.$axios) component.$axios = $axios
          chimera = chimera.bind(component)()
        }

        if (!chimera) { continue }

        const nuxtChimera = {}
        const { resources, ...options } = chimera
        for (let key in resources) {
          let resource = resources[key]
          if (resource && typeof resource !== 'function') {
            resource = resource && resource._data ? resource : Resource.from(resource, Object.assign({}, baseOptions, options))
            resources.push(resource)
            if (!resource.prefetch || !resource.ssrPrefetch) continue
            try {
              isDev && console.log('  Prefetching: ' + resource.requestConfig.url) // eslint-disable-line no-console

              // resource.axios = Axios
              let response = await resource.execute()
              resource._data = response.data
            } catch (err) {
              isDev && console.error(err.message) // eslint-disable-line no-console
            }
            resource.ssrPrefetched = true
            resources[key] = nuxtChimera[key] = resource
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
        for (let resource of resources) typeof resource === 'object' && resource.cancel && resource.cancel()
        isDev && console.error(err.message) // eslint-disable-line no-console
      })
    })
  }
}
