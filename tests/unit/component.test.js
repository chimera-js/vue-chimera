import { mount } from '@vue/test-utils'
import ChimeraEndpoint from '../../src/components/ChimeraEndpoint'
import NullEndpoint from '../../src/NullEndpoint'
import Endpoint from '../../src/Endpoint'

Endpoint.prototype.auto = false

const mountEndpoint = (options, slot, props) => mount(ChimeraEndpoint, {
  propsData: {
    options,
    ...props
  },
  scopedSlots: {
    default: slot || '<p>{{props.data}}</p>'
  }
})

describe('test-chimera-endpoint-component', function () {
  it('should instantiate string', function () {
    const wrapper = mountEndpoint('/test')
    expect(wrapper.vm.endpoint.url).toEqual('/test')
  })
  it('should instantiate null', function () {
    const wrapper = mountEndpoint(null)
    expect(wrapper.vm.endpoint).toBeInstanceOf(NullEndpoint)
  })

  it('should have multiple slot', function () {
    const wrapper = mountEndpoint('/test', '<p>{{props.data}}</p>', { tag: 'div' })
    expect(wrapper.html()).toBeTruthy()
  })

  it('should instantiate endpoint', async function () {
    const wrapper = mountEndpoint({
      url: 'test',
      auto: true,
      key: 'test',
      http: {
        request: () => Promise.resolve({ status: 200, data: { test: '__TEST__' } })
      }
    })

    const endpoint = wrapper.vm.endpoint
    await (new Promise(resolve => {
      endpoint.on('success', resolve)
    }))
    expect(endpoint.url).toBe('test')
    expect(endpoint.auto).toBeTruthy()
    expect(endpoint.baseURL).toBeUndefined()

    expect(wrapper.isVueInstance()).toBeTruthy()
    expect(wrapper.text().includes('__TEST__')).toBeTruthy()
  })

  it('should use ssr context', async function () {
    window.context = {
      test: {
        data: {
          test: '__TEST__'
        }
      }
    }
    const wrapper = mountEndpoint({
      url: 'test',
      auto: true,
      key: 'test'
    }, null, {
      ssrContext: 'context'
    })

    const endpoint = wrapper.vm.endpoint
    expect(endpoint.auto).toBeTruthy()
    expect(endpoint.prefetch).toBeTruthy()
    expect(wrapper.text().includes('__TEST__')).toBeTruthy()
  })
})
