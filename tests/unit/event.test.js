import Vue from 'vue'
import VueChimera from '../../src/index'
import * as events from '../../src/events'
import Endpoint from '../../src/Endpoint'

let server
let httpMock = {
  request: () => new Promise((resolve, reject) => {
    server = { resolve, reject }
  }),
  isCancelError (err) {
    return !!err.cancel
  }
}
beforeEach(() => {
  server = null
})

describe('test-events', function () {
  let endpoint
  beforeEach(() => {
    endpoint = new Endpoint({
      test: '/test',
      auto: false,
      http: httpMock
    })
  })
  it('should broadcast success event', function (done) {
    const spies = new Array(5).fill(1).map(() => jest.fn())
    spies.forEach(spy => {
      endpoint.on(events.SUCCESS, spy)
    })

    endpoint.on(events.SUCCESS, endpoint => {
      expect(endpoint.data).toEqual({ test: 'test' })
    })

    endpoint.fetch().then(() => {
      spies.forEach(spy => expect(spy).toBeCalledTimes(1))
      done()
    }).catch(done)

    server.resolve({ status: 200, data: { test: 'test' } })
  })

  it('should broadcast error event', function (done) {
    endpoint.fetch().catch(() => {})

    server.reject({ status: 500, data: { test: 'test' } })

    endpoint.on(events.ERROR, endpoint => {
      expect(endpoint.error).toEqual({ test: 'test' })
      done()
    })
  })

  it('should broadcast loading event', function (done) {
    endpoint.on(events.LOADING, endpoint => {
      expect(endpoint.loading).toBeTruthy()
      server && server.resolve({})
      done()
    })

    endpoint.fetch()
  })

  it('should broadcast cancel event', function (done) {
    const spy = jest.fn()
    endpoint = new Endpoint({
      url: '/users',
      auto: false,
      on: {
        [events.CANCEL] () {
          done()
        }
      }
    })

    endpoint.on(events.ERROR, spy)
    endpoint.on(events.SUCCESS, spy)

    endpoint.fetch()
    endpoint.cancel()
    expect(spy).not.toBeCalled()
  })
})

describe('test-listener-inheritance', function () {
  it('should inherit all listeners', function (done) {
    const pluginSpy = jest.fn().mockName('pluginSpy')
    const optionsSpy = jest.fn().mockName('optionsSpy')
    const mixinSpy = jest.fn().mockName('mixinSpy')
    const endpointSpy = jest.fn().mockName('endpointSpy')

    Vue.use(VueChimera, {
      on: {
        [events.SUCCESS]: pluginSpy
      }
    })

    let vm = new Vue({
      mixins: [
        {
          chimera: {
            $options: {
              on: {
                [events.SUCCESS]: mixinSpy
              }
            }
          }
        }
      ],
      chimera: {
        $options: {
          on: {
            [events.SUCCESS]: optionsSpy
          }
        },
        test: {
          url: '/',
          auto: false,
          http: httpMock,
          on: {
            [events.SUCCESS]: endpointSpy
          }
        }
      }
    })

    expect(Object.values(vm.test.listeners.success)).toHaveLength(4)

    vm.test.fetch().then(() => {
      expect(endpointSpy).toBeCalledTimes(1)
      expect(optionsSpy).toBeCalledTimes(1)
      expect(pluginSpy).toBeCalledTimes(1)
      expect(mixinSpy).toBeCalledTimes(1)

      done()
    }).catch(done)

    server.resolve({ data: 's', status: 200 })
  })
})
