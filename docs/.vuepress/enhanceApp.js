import Vue from 'vue'
import VueChimera from '../../src/index'

Vue.use(VueChimera, {
  baseURL: 'https://jsonplaceholder.typicode.com',
  prefetch: false
})
