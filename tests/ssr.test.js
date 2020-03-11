import Vue from 'vue'
import { render } from '@vue/server-test-utils'
import VueChimera from '../src/index'

Vue.use(VueChimera, {
  prefetch: true,
  ssrContext: '__CONTEXT__.chimera'
})

describe('test-server-side-rendering', function () {
  it('should ', async function () {
    await render(Vue.extend({
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
    }))

    // console.log(result)
  })
})
