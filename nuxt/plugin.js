import Vue from 'vue'
import VueChimera from 'vue-chimera'

Vue.use(VueChimera, <%= serialize(options, null, 2) %>)

export default function ({ beforeNuxtRender, app }) {
    if (process.server) {
        const ChimeraSSR = require('vue-chimera/ssr')
        beforeNuxtRender(({ nuxtState }) => {
            nuxtState.chimera = ChimeraSSR.getStates()
        })
    }
}
