import { render } from '@vue/server-test-utils'
import { createLocalVue } from '@vue/test-utils'
import VueChimera from '../src/index'
import ssr from '../ssr/index'

let localVue

beforeEach(() => {
  localVue = createLocalVue()
  localVue.mixin({
    beforeCreate () {
      Object.defineProperty(this, '$isServer', {
        get () {
          return true
        }
      })
    }
  })
  localVue.use(VueChimera, {
    prefetch: true,
    ssrContext: '__CONTEXT__.chimera'
  })
})

describe('test-server-side-rendering', function () {
  it('should render correctly', async function () {
    await render({
      name: 'ssr-component',
      render (h) {
        return h('span', {}, [this.$chimera.users.loading ? 't' : 'f'])
      },
      chimera: {
        users: {
          url: 'test',
          key: 'test',
          http: {
            request: () => Promise.resolve({ data: { test: 1 } })
          }
        }
      }
    }, {
      localVue
    })

    expect(ssr.getStates().test.data).toEqual({ test: 1 })
  })
})
