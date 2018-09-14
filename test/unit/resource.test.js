import { expect, assert } from 'chai'
import sinon from 'sinon'

import Resource, { EVENT_SUCCESS, EVENT_LOADING, EVENT_ERROR } from '../../src/Resource'
import axios from 'axios'

describe('resource', function () {
  this.timeout(5000)

  let server
  let resource
  let client

  before(() => {
    server = sinon.createFakeServer()
    server.autoRespond = true
    client = axios.create()
  })
  after(() => {
    server.restore()
  })

  beforeEach(() => {
    resource = Resource.from({
      url: '/users',
      prefetch: false,
      axios: client
    })
  })

  describe('test-from', function () {
    it('should instantiate Resource from string', function () {
      let r = Resource.from('/users')
      assert.instanceOf(r, Resource)
      assert.equal(r.requestConfig.method, 'GET')
      assert.equal(r.requestConfig.url, '/users')
    })

    it('should remain itself', function () {
      let r = new Resource('/u', 'POST')
      assert.equal(r, Resource.from(r))
    })

    it('should instantiate Resource from object', function () {
      let tr = (v) => v
      let r = Resource.from({
        url: '/u',
        prefetch: false,
        method: 'POST',
        transformer: {
          response: tr,
          error: tr
        }
      })
      assert.instanceOf(r, Resource)
      assert.equal(r.requestConfig.method, 'POST')
      assert.equal(r.requestConfig.url, '/u')
      assert.equal(r.responseTransformer, tr)
      assert.equal(r.errorTransformer, tr)
    })
  })

  describe('test-execution', function () {
    let data = [{ id: 1, name: 'User 1' }, { id: 2, name: 'User 2' }]
    let headers = { 'content-type': 'application/json', 'x-my-custom-header': 'my-custom-value' }

    it('should recieve status 200', function (done) {
      server.respondWith('GET', '/users', [
        200,
        headers,
        JSON.stringify(data)
      ])

      assert.equal(resource.loading, false)

      resource.execute().then(res => {
        assert.equal(resource.status, 200)
        assert.deepEqual(resource.data, data)
        assert.deepEqual(resource.headers, headers)
        assert.equal(resource.loading, false)
        assert.instanceOf(resource.lastLoaded, Date)
        done()
      }).catch(err => {
        assert.equal(resource.loading, false)
        done(err)
      })

      assert.equal(resource.loading, true)
    })

    it('should recieve status 501', function (done) {
      server.respondWith('GET', '/users', [
        501,
        { 'Content-Type': 'application/json' },
        JSON.stringify(data)
      ])

      assert.equal(resource.loading, false)
      resource.execute().then(done).catch(err => {
        assert.equal(resource.loading, false)
        assert.equal(resource.status, 501)
        assert.deepEqual(resource.error, data)
        done()
      })

      assert.equal(resource.loading, true)
    })
  })

  describe('test-interval', function () {
    it('should be repeated every seconds', function (done) {
      server.respondWith('GET', '/users', [
        200,
        { 'Content-Type': 'application/json' },
        JSON.stringify([{ id: 1, name: 'User 1' }, { id: 2, name: 'User 2' }])
      ])

      resource = Resource.from({
        url: '/users',
        interval: 100,
        axios: client
      })
      resource.execute()

      let count = 0
      resource.on(EVENT_SUCCESS, response => {
        count++
      })

      setTimeout(() => {
        assert.equal(count, 4)
        done()
      }, 410)
    })
  })

  describe('test-transformers', function () {
    let data = [{ id: 1, name: 'User 1' }, { id: 2, name: 'User 2' }]
    let tr = res => res.map(val => val.id)

    it('should transform response', function (done) {
      server.respondWith('GET', '/users', [
        200,
        { 'Content-Type': 'application/json' },
        JSON.stringify(data)
      ])

      resource.setResponseTransformer(tr)

      resource.execute().then(res => {
        assert.deepEqual(resource.data, tr(data))
        done()
      }).catch(done)
    })

    it('should transform error', function (done) {
      server.respondWith('GET', '/users', [
        500,
        { 'Content-Type': 'application/json' },
        JSON.stringify(data)
      ])

      resource.setErrorTransformer(tr)

      resource.execute()
        .then(done)
        .catch(err => {
          assert.deepEqual(resource.error, tr(data))
          done()
        })
    })
  })

  describe('test-events', function () {
    it('should broadcast success event', function (done) {
      server.respondWith('GET', '/users', [
        200,
        { 'Content-Type': 'application/json' },
        JSON.stringify({})
      ])

      resource.execute()

      resource.on(EVENT_SUCCESS, () => {
        done()
      })
    })

    it('should broadcast error event', function (done) {
      server.respondWith('GET', '/users', [
        501,
        { 'Content-Type': 'application/json' },
        JSON.stringify({})
      ])

      resource.execute()

      resource.on(EVENT_ERROR, () => {
        done()
      })
    })

    it('should broadcast loading event', function (done) {
      server.respondWith('GET', '/users', [
        200,
        { 'Content-Type': 'application/json' },
        JSON.stringify({})
      ])

      resource.on(EVENT_LOADING, () => {
        done()
      })

      resource.execute()
    })
  })
})
