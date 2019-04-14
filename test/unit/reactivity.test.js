import Vue from 'vue'
import VueChimera from '../../dist/vue-chimera.es'
import sinon from 'sinon'
import { assert } from 'chai'
import { EVENT_SUCCESS } from '../../src/Resource'

Vue.use(VueChimera)
Vue.config.devtools = false
Vue.config.productionTip = false

describe('vue-test-reactivity', function () {
  let app
  let server
  let responseData
  beforeEach(() => {
    app = new Vue({

      chimera: {
        users: '/users'
      }

    })

    responseData = [{ id: 1, name: 'chimera1' }, { id: 2, name: 'chimera2' }]

    server = sinon.createFakeServer()

    // server.respondWith('GET', '/users', [
    //     200, {'Content-Type': 'application/json'}, JSON.stringify(responseData)
    // ])
  })

  after(() => {
    server.restore()
  })

  describe('test-app-reactivity', function () {
    this.timeout(5000)

    it('should react to chimera resource changes', function (done) {
      let loading, data, lastLoaded, status
      app.$watch('$chimera.users', (t, f) => {
        loading = t.loading
        data = t.data
        lastLoaded = t.lastLoaded
        status = t.status
      }, { deep: true })

      app.$chimera.users.execute().then(res => {
        assert.equal(loading, false)
        assert.deepEqual(data, responseData)
        assert.equal(status, 200)
        assert.instanceOf(lastLoaded, Date)
        assert.equal(lastLoaded.getTime() - Date.now() < 1000, true)

        done()
      }).catch(done)

      setTimeout(() => {
        server.respond([200, { 'Content-Type': 'application/json' }, JSON.stringify(responseData)])
      }, 100)
    })
  })

  describe('test-function-init', function() {
    const app = new Vue({
      chimera() {
        return {
          users: '/users'
        }
      }
    })

    it('should initialized with a function', function () {
      assert.equal(app._chimera.constructor.name, 'VueChimera')
      assert.equal(app.$chimera.users.constructor.name, 'Resource')
    })
  })

  describe('test-event-handler-context', function() {
    this.timeout(10000)
    it('should broadcast success event', function (done) {
      server.respondWith('GET', '/users', [
        200,
        { 'Content-Type': 'application/json' },
        JSON.stringify({})
      ])

      const app = new Vue({
        chimera() {
          return {
            users: {
              url: '/users',
              on: {
                success(resource) {
                  assert(app === this, 'This is not the Vue instance')
                  assert.equal(resource.constructor.name, 'Resource')
                  assert(!!resource.data)
                  done()
                },
              }
            }
          }
        }
      })

      app.$chimera.users.execute()

      setTimeout(() => {
        server.respond([200, { 'Content-Type': 'application/json' }, JSON.stringify(responseData)])
      }, 100)
    })
  })

})
