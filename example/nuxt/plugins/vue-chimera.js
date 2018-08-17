import Vue from 'vue'
import VueChimera from '../../../src/index'
import { NuxtPlugin } from '../../../src/NuxtPlugin'

Vue.use(VueChimera, {
    axios: {
        baseURL: 'https://jsonplaceholder.typicode.com'
    }
})

export default NuxtPlugin