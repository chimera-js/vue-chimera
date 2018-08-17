import Vue from 'vue'
import VueChimera from 'vue-chimera'
import { NuxtPlugin } from 'vue-chimera/src/NuxtPlugin'

Vue.use(VueChimera, {
    axios: {
        baseURL: 'https://jsonplaceholder.typicode.com'
    }
})

export default NuxtPlugin