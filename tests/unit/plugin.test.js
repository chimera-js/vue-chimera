import Vue from 'vue'
import VueChimera from '../../src/index'
import install from '../../src/index.es'

describe('test-import', function () {
  it('should be a vue plugin', function () {
    expect(typeof VueChimera).toBe('function')
    expect(typeof install).toBe('function')

    const plugin = require('../../dist/vue-chimera.umd')
    expect(typeof plugin.install).toBe('function')
  })
})

describe('test-mixin', function () {
  let mixinOptions, baseOptions, LocalVue
  beforeEach(() => {
    LocalVue = Vue
    LocalVue.use(VueChimera, {
      headers: {
        'X-Test-1': '1'
      },
      params: {
        a: 1
      }
    })
    mixinOptions = {
      $options: {
        headers: { 'X-Test-2': '2' },
        params: { b: 1 }
      },
      test: {
        url: '/a'
      }
    }
    baseOptions = {
      $options: {
        baseURL: 's',
        headers: { 'X-Test-3': '3' },
        params: {
          a: 2
        }
      },
      test: {
        url: '/b',
        headers: { 'X-Test-4': '4' }
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
    expect(vm.test.requestHeaders).toEqual({
      'X-Test-1': '1',
      'X-Test-2': '2',
      'X-Test-3': '3',
      'X-Test-4': '4'
    })
    expect(vm.test.url).toEqual('/b')
    expect(vm.test.baseURL).toEqual('s')
    expect(vm.test.params).toEqual({ a: 2, b: 1 })
  })

  it('should inherit options with functions', function () {
    const vm = new LocalVue({
      mixins: [
        { chimera: () => mixinOptions }
      ],
      chimera () {
        return {
          ...baseOptions,
          noParams: {
            params: null
          }
        }
      }
    })

    expect(vm.test.url).toEqual('/b')
    expect(vm.test.requestHeaders).toEqual({
      'X-Test-1': '1',
      'X-Test-2': '2',
      'X-Test-3': '3',
      'X-Test-4': '4'
    })
    expect(vm.test.baseURL).toEqual('s')
    expect(vm.test.params).toEqual({ a: 2, b: 1 })
    expect(vm.noParams.params).toBeNull()
  })
})
