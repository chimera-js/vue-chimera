import Vue from 'vue'
import VueChimera from "../../src/VueChimera";
import NullResource from "../../src/NullResource";
import * as events from '../../src/events'
import Resource from "../../src/Resource";

global.window = {
  __STATE__: {
    chimera: {}
  }
}

Vue.config.devtools = false
Vue.config.productionTip = false

const chimeraFactory = function (resources, vm, options) {
  vm = vm || new Vue()
  return new VueChimera(vm, resources, {
    deep: true,
    ssrContext: '__STATE__.chimera',
    ...options
  })
}

const axiosMock = () => {
  const axiosResponse = {
    data: { test: 1 },
    headers: {},
    status: 200,
  }
  const axiosMock = jest.fn(() => Promise.resolve(axiosResponse))
  axiosMock.request = axiosMock
  return axiosMock
}

describe('test-vue-chimera', function () {

  it('should instantiate null resource', function () {
    const { _resources } = chimeraFactory({
      n: null,
    })

    expect(_resources.n).toBeInstanceOf(NullResource)
  });

  it('should bind vm to listeners', function () {
    let self, resource
    const spy = jest.fn()
    const chimera = chimeraFactory({
      test: {
        url: '/test',
        autoFetch: false,
        on: {
          test (r) {
            self = this
            resource = r
          },
          event: 'spy'
        }
      },
    }, new Vue({
      methods: {
        spy
      }
    }))

    chimera._resources.test.emit('test')
    chimera._resources.test.emit('event')
    expect(self).toBe(chimera._vm)
    expect(resource).toBe(chimera._resources.test)
    expect(spy).toBeCalled()
  });

  it('should cancel all resources', function () {
    const chimera = chimeraFactory({
      test: '/1',
      test2: '/2',
    })

    const spy = jest.spyOn(Resource.prototype, 'cancel')

    chimera.cancelAll()
    chimera._resources.$cancelAll()
    expect(spy).toBeCalledTimes(4)
  });

  it('should work with $loading', async function () {
    const vm = new Vue()
    const chimera = new VueChimera(vm, {
      test: '/test',
      test2: '/test2',
    }, {
      axios: axiosMock()
    })

    const p = chimera._resources.test.reload()
    expect(chimera._resources.$loading).toBeTruthy()
    await p
    expect(chimera._resources.$loading).toBeFalsy()
  });

  it('should start interval', async function () {
    jest.useFakeTimers()
    const startSpy = jest.spyOn(Resource.prototype, 'startInterval')
    const stopSpy = jest.spyOn(Resource.prototype, 'stopInterval')
    const chimera = chimeraFactory({
      test: {
        url: 'interval',
        interval: 1000,
        axios: axiosMock(),
      }
    })

    const resources = chimera._resources

    expect(startSpy).toBeCalledTimes(1)
    expect(resources.test.looping).toBeTruthy()

    chimera._resources.test.stopInterval()
    expect(stopSpy).toBeCalled()

  });
})
