import Resource from './Resource'

export default function (options) {
  const { prefetch, prefetchTimeout } = Object.assign({
    prefetch: true,
    prefetchTimeout: 5000
  }, options)

  return function ({ beforeNuxtRender, isDev }) {
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
            if (!resource.prefetch) continue
            try {
              isDev && console.log('  Prefetching: ' + resource.requestConfig.url)

              let response = await resource.execute()
              resource._data = response.data
            } catch (e) {}
            resource.ssrPrefetched = true
            options.chimera.resources[key] = nuxtChimera[key] = resource
          }
        }
        nuxtState.chimera[i] = nuxtChimera
      }
    }

    if (prefetch) {
      beforeNuxtRender((...args) => {
        return new Promise((resolve, reject) => {
          prefetchAsyncData(...args).then(resolve).catch(reject)
          setTimeout(reject, prefetchTimeout, new Error('  SSR Prefetch Timeout.'))
        }).catch(err => {
          if (isDev) console.error(err.message)
        })
      })
    }
  }
}
