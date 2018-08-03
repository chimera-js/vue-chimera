import axios from 'axios'
import Vue from 'vue'
import mixin from './mixin'

import Resource from "./Resource";
import NullResource from './NullResource'
import { remove, isPlainObject } from './utils'

import LocalStorageCache from "./LocalStorageCache";
import NullCache from "./NullCache";


export class VueChimera {

    static install(Vue, options) {

        options = options || {}

        Resource.cache = options.cache || 'no-cache'
        Vue.mixin(mixin(options))

    }

    constructor(options, context) {

        options = options || {}

        this._vm = null

        if (options.axios) {
            if (isPlainObject(options.axios))
                this._axios =  axios.create(options.axios)
            else if (options.axios instanceof axios)
                this._axios = options.axios
            else
                throw 'Your client should be a axios config object or an axios instance.'
        } else {
            this._axios = axios.create()
        }
        this._listeners = []
        this._context = context
        this._reactiveResources = {}

        const resources = options.resources

        for (let key in resources) {
            let r = resources[key]

            if (typeof r === 'function') {
                resources[key] = new NullResource()
                this._reactiveResources[key] = r.bind(context)
            } else
                resources[key] = Resource.from(r)

            Object.defineProperty(resources, '$' + key, {
                set(x) {
                    this[key] = Resource.from(x)
                }
            })
        }

        this._initVM(resources)
        this._resources = resources
    }

    _initVM(data) {
        const silent = Vue.config.silent
        Vue.config.silent = true
        this._vm = new Vue({
            data,
            computed: {
                $loading() {
                    for (let key in this.$data) {
                        if (this.$data[key].loading)
                            return true
                    }
                    return false
                }
            }
        })
        data.$loading = () => this._vm.$loading
        data.$client = () => this._axios
        Vue.config.silent = silent
    }

    watch() {
        return this._vm.$watch('$data', () => {
            let i = this._listeners.length
            while (i--) {
                let vm = this._listeners[i]
                if (vm)
                    vm.$nextTick(() => vm.$forceUpdate())
            }
        }, {deep: true})
    }

    subscribe(vm) {
        this._listeners.push(vm)
    }

    unsubscribe(vm) {
        remove(this._listeners, vm)
    }

    updateReactiveResources() {
        for (let key in this._reactiveResources)
            this.updateReactiveResource(key)
    }

    updateReactiveResource(key) {
        this._resources[key] = Resource.from(this._reactiveResources[key]())
    }

    get resources() {
        return this._resources
    }
}


// Auto-install
let GlobalVue = null
if (typeof window !== 'undefined') {
    GlobalVue = window.Vue
} else if (typeof global !== 'undefined') {
    GlobalVue = global.Vue
}

if (GlobalVue) {
    GlobalVue.use(VueChimera.install)
}

export default VueChimera.install
