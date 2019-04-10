import Vue from 'vue'
import VueChimera from 'vue-chimera'

Vue.use(VueChimera, <%= serialize(options, null, 2) %>)

export default VueChimera.NuxtPlugin()
