import Vue from 'vue'
import VueChimera from 'vue-chimera/dist/vue-chimera.es.js'

Vue.use(VueChimera, <%= JSON.stringify(options, null, 2) %>)

export default VueChimera.NuxtPlugin()
