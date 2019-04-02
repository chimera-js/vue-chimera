import Vue from 'vue'
import VueChimera from 'vue-chimera'

Vue.use(VueChimera, <%= JSON.stringify(options, null, 2) %>)

export default VueChimera.NuxtPlugin()
