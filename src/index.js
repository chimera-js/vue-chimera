import Vue from 'vue'
import mixin from './mixin';
import Resource from './Resource';
import { createAxios } from './utils';

Vue.config.silent = true
Vue.config.productionTip = false
Vue.config.devtools = false

const plugin = {

    install (Vue, options = {}) {
        Resource.cache = options.cache || 'no-cache'
        Resource.axios = createAxios(options.axios)
        Vue.mixin(mixin(options))
    }

}

// Auto-install
let GlobalVue = null
if (typeof window !== 'undefined') {
  GlobalVue = window.Vue
}
else if (typeof global !== 'undefined') {
  GlobalVue = global.Vue
}

if (GlobalVue) {
  GlobalVue.use(plugin)
}

export { default as NuxtPlugin } from './NuxtPlugin'

export default plugin
