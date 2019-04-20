import Vue from 'vue'
import VueChimera from '../../src/index'
import Cache from '../../src/cache/index'
import WebStorageCache from '../../src/cache/WebStorageCache'
import sinon from 'sinon'
import { assert } from 'chai'

Vue.use(VueChimera)
Vue.config.devtools = false
Vue.config.productionTip = false

describe('vue-test-cache', function () {
  let app
  let server
  beforeEach(() => {
    app = new Vue({
      chimera: {
        $options: {
          cache: {
            store: 'localStorage',
            strategy: 'cache-first',
          },
          prefetch: false,
        },
        users: '/users',
        networkFirst: {
          url: 'users',
          cache: {
            strategy: 'network-first'
          }
        }
      }
    })


    server = sinon.createFakeServer()
  })

  after(() => {
    server.restore()
    localStorage.clear()
  })

  const respond = (response, status = 200) => {
    setTimeout(() => {
      server.respond([status, {'Content-Type': 'application/json'}, response ? JSON.stringify(response) : ''])
    }, 100)
  }

  describe('test-cache-class', function () {
    it('should set and get cache', async function () {
      const cache = app._chimera.cache

      assert.instanceOf(cache, Cache)
      assert.instanceOf(cache.store, WebStorageCache)
      assert.equal(cache.store.storage, localStorage)

      respond({ test: 1 })

      cache.set(app.users)
      assert(cache.get(app.users), 'Cache should has users')
      assert(app._uid && cache.getCacheKey(app.users).startsWith('$_chimera_' + app._uid))

      cache.clear()
      assert(!cache.get(app.users), 'Cache should be cleared')
    })
  })

  describe('test-cache-first', function () {
    this.timeout(2000)

    it('should read from cache second time', async function () {
      let cache = app._chimera.cache
      let responseData = [{ id: 1, name: 'chimera1' }, { id: 2, name: 'chimera2' }]

      assert.instanceOf(cache, Cache)
      assert.instanceOf(app.users.cache, Cache)
      respond(responseData)

      assert(!cache.get(app.users), 'Cache should not have users')

      let originalData = app.users.fetch()
      assert(app.users.loading)
      originalData = await originalData
      assert(!app.users.loading)

      assert.notEqual(app.users.cacheHit, true, 'Cache shouldn\'t be hit')
      assert(cache.get(app.users), 'Cache should have users')


      let cacheData = app.users.fetch()
      assert(!app.users.loading)
      cacheData = await cacheData
      assert(!app.users.loading)

      assert.equal(app.users.cacheHit, true, 'Cache should be hit')

      assert.deepEqual(originalData, cacheData)
    })
  })

  describe('test-network-first', function () {
    this.timeout(2000)
    it('should try network', async function () {
      const cache = app._chimera.cache

      assert.instanceOf(cache, Cache)
      assert.instanceOf(app.networkFirst.cache, Cache)

      respond({})
      await app.networkFirst.fetch()
      assert.equal(app.networkFirst.cacheHit, false)

      respond({ salam: true })
      await app.networkFirst.fetch()
      assert.equal(app.networkFirst.cacheHit, false)

      respond(null, 500)
      await app.networkFirst.fetch()
      // console.warn(app.networkFirst.data)
      assert.equal(app.networkFirst.cacheHit, true)
      assert.deepEqual(app.networkFirst.data, { salam: true }, 'Response should be the last response got')

    })
  })



})
