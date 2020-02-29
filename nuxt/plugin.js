import Vue from 'vue'
import VueChimera from 'vue-chimera'
import ChimeraSSR from 'vue-chimera/ssr'

Vue.use(VueChimera, <%= serialize(options, null, 2) %>)

// export default VueChimera.NuxtPlugin()
export default function ({ beforeNuxtRender, app }) {
    if (!beforeNuxtRender) { return }

    beforeNuxtRender(({ nuxtState }) => {
        // nuxtState.chimera = ChimeraSSR.getStates()
    })

    /*const cancelTokens = []
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
            const { $options, ...resources } = chimera
            const options = Object.assign({}, baseOptions, $options)
            if (!options.axios) options.axios = $axios

            for (let key in resources) {
                let resource = resources[key]
                if (resource && typeof resource !== 'function') {
                    resource = resource && resource._data ? resource : Resource.from(resource, options)
                    cancelTokens.push(resource.cancel.bind(resource))
                    if (!resource.prefetch || !resource.ssrPrefetch) continue
                    try {
                        isDev && console.log('  Prefetching: ' + resource.requestConfig.url) // eslint-disable-line no-console
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
            for (let cancel of cancelTokens) if (typeof cancel === 'function') cancel()
            isDev && console.error(err.message) // eslint-disable-line no-console
        })
    })*/
}
