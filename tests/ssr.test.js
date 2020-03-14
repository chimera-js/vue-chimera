import Vue from 'vue'
import VueChimera from '../src/index'

const renderer = require('vue-server-renderer').createRenderer()

Vue.use(VueChimera, {
  prefetch: true,
  ssrContext: '__CONTEXT__.chimera'
})

describe('test-server-side-rendering', function () {
  it('should ', async function () {
    const app = Vue.extend({
      render (h) {
        return h('span', {}, [this.$chimera.users.loading ? 't' : 'f'])
      },
      chimera: {
        users: {
          url: 'test',
          key: 'test',
          axios: {
            request: () => Promise.resolve({ data: { test: 1 } })
          }
        }
      }
    })
    // console.log(result)
  })
})
