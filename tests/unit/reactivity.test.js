import Vue from 'vue'
import VueChimera from '../../src/index.js'
import Endpoint from '../../src/Endpoint'
import sinon from 'sinon'
import Axios from 'axios'

Vue.use(VueChimera, { axios: Axios })
Vue.config.devtools = false
Vue.config.productionTip = false

describe('vue-test-reactivity', function () {
  let server, responseData
  beforeEach(() => {
    responseData = [{ id: 1, name: 'chimera1' }, { id: 2, name: 'chimera2' }]
    server = sinon.createFakeServer()
  })

  afterEach(() => {
    server.restore()
  })

  describe('test-chimera-reactivity', function () {
    it('should react to chimera endpoint changes', async function () {
      let app = new Vue({
        chimera: {
          users: '/users'
        }
      })
      const watchers = [jest.fn()]
      app.$watch('users', watchers[0], { deep: true })

      let watcherKeys = Object.keys(app.users.response).concat(['loading'])
      watcherKeys.forEach(key => {
        if (key === 'error') return
        watchers.push(jest.fn())
        app.$watch('users.' + key, watchers[watchers.length - 1])
      })

      const p = app.$chimera.users.fetch()

      setTimeout(() => {
        server.respond([200, { 'Content-Type': 'application/json' }, JSON.stringify(responseData)])
      }, 100)

      await p
      await app.$nextTick()

      watchers.forEach((w) => {
        expect(w).toBeCalled()
      })
      expect(app.users.data).toEqual(responseData)
      expect(app.users.status).toBe(200)
      expect(app.users.lastLoaded).toBeInstanceOf(Date)
      expect(app.users.lastLoaded.getTime() - Date.now()).toBeLessThan(1000)
    })
  })

  describe('test-reactive-endpoints', function () {
    it('should react to changes', async function () {
      const watcher = jest.fn()
      let app = new Vue({
        chimera: {
          $options: {
            deep: false
          },
          users () {
            return {
              url: '/users/' + this.id,
              params: this.params,
              auto: this.auto
            }
          }
        },
        data () {
          return {
            id: 1,
            auto: false,
            params: {
              page: 2
            }
          }
        },
        watch: {
          users: watcher
        }
      })
      const fetchSpy = jest.spyOn(Endpoint.prototype, 'fetch')
      expect(app._chimera.deep).toBe(false)
      expect(app.users.url).toBe('/users/1')
      expect(app.users.params).toEqual({ page: 2 })

      expect(watcher).not.toBeCalled()

      app.id = 2
      expect(app.users.url).toBe('/users/2')
      await app.$nextTick()
      expect(watcher).toBeCalledTimes(1)

      app.params.page = 3
      await app.$nextTick()
      expect(watcher).toBeCalledTimes(1)

      app.params = { page: 5 }
      expect(app.users.params).toEqual({ page: 5 })
      await app.$nextTick()
      expect(watcher).toBeCalledTimes(2)

      expect(fetchSpy).not.toBeCalled()
      app.auto = true
      await app.$nextTick()
      expect(watcher).toBeCalledTimes(3)
      expect(fetchSpy).toBeCalled()
    })
  })

  describe('test-function-init', function () {
    it('should initialized with a function', function () {
      const app = new Vue({
        chimera () {
          return {
            $options: {
              auto: false
            },
            $users: '/users',
            users: '/users'
          }
        }
      })
      expect(app._chimera.constructor.name).toBe('VueChimera')
      expect(app.$chimera.users.constructor.name).toBe('Endpoint')

      expect(app.$chimera.$users).toBeUndefined()
      expect(app.users.auto).toBeFalsy()
    })

    it('should destroy', async function () {
      const app = new Vue({
        chimera () {
          return {
            $options: {
              auto: false
            },
            $users: '/users',
            users: '/users'
          }
        }
      })

      const cancel = jest.spyOn(app._chimera, 'cancelAll')
      const destroy = jest.spyOn(app._chimera, 'destroy')

      app.$destroy()

      await app.$nextTick()

      expect(cancel).toBeCalledTimes(1)
      expect(destroy).toBeCalledTimes(1)
    })
  })
})
