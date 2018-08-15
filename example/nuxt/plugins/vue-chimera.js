import Vue from 'vue'
import VueChimera from '../../../src/index'
import Resource from '../../../src/Resource'

Vue.use(VueChimera, {
    axios: {
        baseURL: 'https://jsonplaceholder.typicode.com'
    }
})

export default ({app, beforeNuxtRender}, inject) => {

    if (beforeNuxtRender) {
        beforeNuxtRender((ssrContext) => {
            let { Components } = ssrContext
            ssrContext.chimera = {}
            Components.forEach(component => {

                const options = component.options
                if (options.chimera) {
                    ssrContext.chimera[component.cid] = {}
                    for (let key in options.chimera.resources) {
                        let resource = options.chimera.resources[key];
                        resource = Resource.from(resource)
                        // resource._data = [{title : 'sdfsdfsjkhfjh'}]
                        // resource.ssrPrefetched = true;
                        // ssrContext.chimera[component.cid][key] = resource;
                    }
                }

            })
        })
    }
}