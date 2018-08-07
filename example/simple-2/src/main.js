import Vue from 'vue'
import VueChimera from 'vue-chimera'
import App from './App.vue'

console.log(VueChimera)

Vue.use(VueChimera)

new Vue({
  el: '#app',
  render: h => h(App)
})
