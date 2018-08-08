import Vue from 'vue'
import VueChimera from '../../../src/index'

Vue.use(VueChimera, {
    axios: {
        baseURL: 'https://idehhub.com/api/v1',

        transformResponse: [(res) => {
            res = JSON.parse(res)
            res.title = res.title.toUpperCase()
            return res
        }]
    }
})

export default ({app}, inject) => {

    

    // inject('chimera', {})
}