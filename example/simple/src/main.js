import Vue from 'vue'
import VueChimera from '../../../src/index'
import App from './App.vue'

Vue.config.productionTip = false

Vue.use(VueChimera)

new Vue({
  render: h => h(App),
}).$mount('#app')
