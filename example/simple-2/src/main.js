import Vue from 'vue'
import VueChimera from '../../../dist/vue-chimera'
import App from './App.vue'

Vue.use(VueChimera)

new Vue({
  el: '#app',
  render: h => h(App)
})
