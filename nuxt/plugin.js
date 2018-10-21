import Vue from 'vue'
import VueChimera from 'vue-chimera/dist/vue-chimera.cjs'

Vue.use(VueChimera, <%= JSON.stringify(options, null, 2) %>)

export default VueChimera.NuxtPlugin()
