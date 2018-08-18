import Vue from 'vue'
import VueChimera from '../../../dist/vue-chimera'
import NuxtPlugin from '../../../dist/vue-chimera-nuxt'

Vue.use(VueChimera, {
    axios: {
        baseURL: 'https://jsonplaceholder.typicode.com'
    }
})

export default NuxtPlugin