import Vue from 'vue'
import VueChimera, { install } from '../../src/index'



describe('test-import', function () {
  it('should be a vue plugin', function () {
    expect(typeof VueChimera).toBe('function')
    expect(typeof install).toBe('function')

    const plugin = require('../../dist/vue-chimera.umd')
    expect(typeof plugin.install).toBe('function')
  })
})

describe('test-plugin-options', function () {
  // let localVue = Vue.extend()
  // const headers = {
  //   'X-Test': 'test'
  // }
  // Vue.use(VueChimera, {
  //   headers,
  //   auto: false
  // })
})

describe('test-mixin', function () {
  let mixinOptions, baseOptions, LocalVue
  beforeEach(() => {
    LocalVue = Vue
    LocalVue.use(VueChimera)
    mixinOptions = {
      $options: {
        headers: { 'X-Test2': 'test' }
      },
      test: {
        url: '/a'
      }
    }
    baseOptions = {
      $options: {
        baseURL: 's',
        params: {
          a: 1
        }
      },
      test: {
        url: '/b'
      }
    }
  })
  it('should inherit options', function () {
    const vm = new LocalVue({
      mixins: [
        { chimera: mixinOptions }
      ],
      chimera: baseOptions
    })

    expect(vm.$chimera.test === vm.test).toBeTruthy()
    expect(vm.test.headers).not.toEqual(mixinOptions.$options.headers)
    expect(vm.test.request.headers).toEqual(mixinOptions.$options.headers)
    expect(vm.test.request.url).toEqual('/b')
    expect(vm.test.request.baseURL).toEqual('s')
    expect(vm.test.request.params).toEqual({ a: 1 })
  })

  it('should inherit options with functions', function () {
    const vm = new LocalVue({
      mixins: [
        { chimera: () => mixinOptions }
      ],
      chimera () {
        return baseOptions
      }
    })

    expect(vm.test.request.url).toEqual('/b')
    expect(vm.test.request.headers).toEqual(mixinOptions.$options.headers)
    expect(vm.test.request.baseURL).toEqual('s')
    expect(vm.test.request.params).toEqual({ a: 1 })
  })
})
