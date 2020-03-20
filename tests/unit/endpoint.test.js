import sinon from 'sinon'
import Endpoint from '../../src/Endpoint'
import NullEndpoint from '../../src/NullEndpoint'
import * as events from '../../src/events'
import axios from 'axios'
import { isPlainObject } from '../../src/utils'
import axiosMock from '../mocks/axios.mock'

let server
let endpoint
let client

beforeAll(() => {
  server = sinon.createFakeServer()
  server.autoRespond = true
  client = axios.create()
})
afterAll(() => {
  server.restore()
})

beforeEach(() => {
  endpoint = new Endpoint({
    url: '/users',
    auto: false,
    axios: client
  })
})

describe('test-instantiation', function () {
  it('should instantiate Endpoint from string', function () {
    let r = new Endpoint('/users')
    expect(r).toBeInstanceOf(Endpoint)
    expect(r.method.toLowerCase()).toBe('get')
    expect(r.url).toBe('/users')
  })

  it('should instantiate Endpoint from object', function () {
    let tr = (v) => v
    let r = new Endpoint({
      url: '/u',
      auto: false,
      method: 'POST',
      debounce: false,
      transformer: {
        response: tr,
        error: tr
      }
    })
    expect(r).toBeInstanceOf(Endpoint)
    expect(r.method.toLowerCase()).toBe('post')
    expect(r.url).toBe('/u')
    expect(r.responseTransformer).toBe(tr)
    expect(r.errorTransformer).toBe(tr)
    expect(r.fetch === r.fetchDebounced).toBeTruthy()
  })

  it('should be null endpoint', function () {
    expect(() => new Endpoint(null)).toThrow()

    let r = new NullEndpoint()

    expect(r.fetch()).rejects.toBeInstanceOf(Error)
  })

  it('should have initial data', function () {
    const data = {}
    let r = new Endpoint('/users', { data })
    expect(data === r.data).toBeTruthy()
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

    expect(endpoint.loading).toBeFalsy()

    endpoint.fetch().then(() => {
      expect(endpoint.status).toBe(200)
      expect(endpoint.data).toEqual(data)
      expect(endpoint.headers).toEqual(headers)
      expect(endpoint.loading).toBeFalsy()
      expect(endpoint.lastLoaded).toBeInstanceOf(Date)
      done()
    }).catch(err => {
      expect(endpoint.loading).toBeFalsy()
      done(err)
    })

    expect(endpoint.loading).toBeTruthy()
  })

  it('should receive status 501', function (done) {
    server.respondWith('GET', '/users', [
      501,
      { 'Content-Type': 'application/json' },
      JSON.stringify(data)
    ])

    expect(endpoint.loading).toBeFalsy()
    endpoint.send().then(done).catch(() => {
      expect(endpoint.loading).toBeFalsy()
      expect(endpoint.status).toBe(501)
      expect(endpoint.error).toEqual(data)
      done()
    })

    expect(endpoint.loading).toBeTruthy()
  })

  it('should send with extra', async function () {
    endpoint.axios = axiosMock()
    endpoint.params = {
      a: 1,
      b: 2
    }

    await endpoint.send({ b: 3 })

    expect(endpoint.axios.mock.calls[0][0].params).toEqual({
      a: 1,
      b: 3
    })
  })

  it('should send headers', async function () {
    const headers = { 'X-Test': 'TEST' }
    const axios = axiosMock()
    let endpoint = new Endpoint({
      url: '/users',
      headers,
      axios
    })
    await endpoint.fetch()
    expect(axios.mock.calls[0][0].headers).toEqual(headers)

    await endpoint.fetch(true, {
      headers: { 'X-Test2': 'TEST2' }
    })
    expect(axios.mock.calls[1][0].headers).toEqual({ 'X-Test': 'TEST', 'X-Test2': 'TEST2' })
  })
})

describe('test-transformers', function () {
  let data = [{ id: 1, name: 'User 1' }, { id: 2, name: 'User 2' }]
  let tr = res => res.map(val => val.id)

  it('should work with single function', function () {
    let endpoint = new Endpoint({
      transformer: tr
    })
    expect(endpoint.responseTransformer === endpoint.errorTransformer).toBeTruthy()
    expect(endpoint.responseTransformer === tr).toBeTruthy()
  })

  it('should transform response', function (done) {
    server.respondWith('GET', '/users', [
      200,
      { 'Content-Type': 'application/json' },
      JSON.stringify(data)
    ])

    endpoint.setTransformer({ response: tr })

    endpoint.fetch().then(() => {
      expect(endpoint.data).toEqual(tr(data))
      done()
    }).catch(err => done(err))
  })

  it('should transform error', function (done) {
    server.respondWith('GET', '/users', [
      500,
      { 'Content-Type': 'application/json' },
      JSON.stringify(data)
    ])

    endpoint.setTransformer({ error: tr })

    endpoint.fetch()
      .then(done)
      .catch(() => {
        expect(endpoint.error).toEqual(tr(data))
        done()
      })
  })
})

describe('test-cancellation', function () {
  it('should cancel the request', function (done) {
    server.respondWith('GET', '/users', [
      200,
      { 'Content-Type': 'application/json' },
      JSON.stringify({})
    ])

    endpoint.on(events.CANCEL, function () {
      expect(endpoint.data).toBeNull()
      done()
    })
    expect(endpoint.loading).toBeFalsy()
    endpoint.fetch()
    expect(endpoint.loading).toBeTruthy()
    endpoint.cancel()
  })
})

describe('test-misc', function () {
  it('should serialize', function () {
    expect(isPlainObject(endpoint.response)).toBeTruthy()
    expect(endpoint.toString()).toEqual(JSON.stringify(endpoint.response))
  })
  it('should be light', async function () {
    let endpoint = new Endpoint({
      url: 'test',
      light: true
    })
    endpoint.http = {
      request (request, endpoint) {
        return Promise.resolve({
          data: {},
          headers: {},
          status: 200
        })
      }
    }

    await endpoint.fetch()

    const obj = JSON.parse(JSON.stringify(endpoint.response))
    expect(obj).not.toHaveProperty('lastLoaded')
    expect(obj).not.toHaveProperty('headers')
  })
})
