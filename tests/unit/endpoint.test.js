import sinon from 'sinon'
import Endpoint from '../../src/Endpoint'
import NullEndpoint from '../../src/NullEndpoint'
import * as events from '../../src/events'
import axios from 'axios'
import {createAxios, isPlainObject} from "../../src/utils";

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
    autoFetch: false,
    axios: client
  })
})

describe('test-instantiation', function () {
  it('should instantiate Endpoint from string', function () {
    let r = new Endpoint('/users')
    expect(r).toBeInstanceOf(Endpoint)
    expect(r.request.method.toLowerCase()).toBe('get')
    expect(r.request.url).toBe('/users')
  })

  it('should instantiate Endpoint from object', function () {
    let tr = (v) => v
    let r = new Endpoint({
      url: '/u',
      prefetch: false,
      method: 'POST',
      debounce: false,
      transformer: {
        response: tr,
        error: tr
      }
    })
    expect(r).toBeInstanceOf(Endpoint)
    expect(r.request.method.toLowerCase()).toBe('post')
    expect(r.request.url).toBe('/u')
    expect(r.responseTransformer).toBe(tr)
    expect(r.errorTransformer).toBe(tr)
    expect(r.fetch === r.fetchDebounced).toBeTruthy()
  })

  it('should be null endpoint', function () {
    expect(() => new Endpoint(null)).toThrow()

    let r = new NullEndpoint()

    expect(r.fetch()).rejects.toBeInstanceOf(Error)
  });

  it('should have initial data', function () {
    const data = {}
    let r = new Endpoint('/users', { data })
    expect(data === r.data).toBeTruthy()
  });
})

describe('test-execution', function () {
  let data = [{id: 1, name: 'User 1'}, {id: 2, name: 'User 2'}]
  let headers = {'content-type': 'application/json', 'x-my-custom-header': 'my-custom-value'}

  it('should recieve status 200', function (done) {
    server.respondWith('GET', '/users', [
      200,
      headers,
      JSON.stringify(data)
    ])

    expect(endpoint.loading).toBeFalsy()

    endpoint.fetch().then(res => {
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
      {'Content-Type': 'application/json'},
      JSON.stringify(data)
    ])

    expect(endpoint.loading).toBeFalsy()
    endpoint.send().then(done).catch(err => {
      expect(endpoint.loading).toBeFalsy()
      expect(endpoint.status).toBe(501)
      expect(endpoint.error).toEqual(data)
      done()
    })

    expect(endpoint.loading).toBeTruthy()
  })

  it('should send with extra', async function () {
    endpoint.axios = {
      request: (o) => Promise.resolve(o)
    }
    endpoint.request.params = {
      a: 1,
      b: 2,
    }

    const options = await endpoint.send({ params: { b: 3 }, url: 'test' })

    expect(options.url).toBe('test')
    expect(options.params).toHaveProperty('a', 1)
    expect(options.params).toHaveProperty('b', 3)
  });
})

describe('test-transformers', function () {
  let data = [{id: 1, name: 'User 1'}, {id: 2, name: 'User 2'}]
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
      {'Content-Type': 'application/json'},
      JSON.stringify(data)
    ])

    endpoint.setTransformer({response: tr})

    endpoint.fetch().then(res => {
      expect(endpoint.data).toEqual(tr(data))
      done()
    }).catch(Promise.reject)
  })

  it('should transform error', function (done) {
    server.respondWith('GET', '/users', [
      500,
      {'Content-Type': 'application/json'},
      JSON.stringify(data)
    ])

    endpoint.setTransformer({error: tr})

    endpoint.fetch()
      .then(done)
      .catch(err => {
        expect(endpoint.error).toEqual(tr(data))
        done()
      })
  })
})

describe('test-events', function () {
  it('should broadcast success event', function (done) {
    server.respondWith('GET', '/users', [
      200,
      {'Content-Type': 'application/json'},
      JSON.stringify({})
    ])

    endpoint.fetch()

    endpoint.on(events.SUCCESS, () => {
      done()
    })
  })

  it('should broadcast error event', function (done) {
    server.respondWith('GET', '/users', [
      501,
      {'Content-Type': 'application/json'},
      JSON.stringify({})
    ])

    endpoint.fetch()

    endpoint.on(events.ERROR, () => {
      done()
    })
  })

  it('should broadcast loading event', function (done) {
    server.respondWith('GET', '/users', [
      200,
      {'Content-Type': 'application/json'},
      JSON.stringify({})
    ])

    endpoint.on(events.LOADING, () => {
      done()
    })

    endpoint.fetch()
  })

  it('should broadcast cancel event', function (done) {
    server.respondWith('GET', '/users', [
      200,
      {'Content-Type': 'application/json'},
      JSON.stringify({})
    ])

    endpoint = new Endpoint({
      url: '/users',
      autoFetch: false,
      on: {
        [events.CANCEL]() {
          done()
        }
      },
      axios: createAxios()
    })

    endpoint.fetch()
    endpoint.cancel()
  })
})

describe('test-cancellation', function () {
  it('should cancel the request', function (done) {
    server.respondWith('GET', '/users', [
      200,
      {'Content-Type': 'application/json'},
      JSON.stringify({})
    ])

    const cancelSpy = jest.fn()
    endpoint.on(events.CANCEL, cancelSpy)
    expect(endpoint.loading).toBeFalsy()
    endpoint.fetch().then(() => {
      done()
      throw new Error('Not cancelled')
    }).catch((err) => {
      expect(err.__CANCEL__).toBeTruthy()
      expect(endpoint.loading).toBeFalsy()
      expect(endpoint.data).toBeNull()
      expect(cancelSpy).toBeCalled()
      done()
    })
    expect(endpoint.loading).toBeTruthy()
    endpoint.cancel()
  })
})

describe('test-misc', function () {
  it('should serialize', function () {
    const obj = endpoint.toObj()
    expect(isPlainObject(obj)).toBeTruthy()
    expect(endpoint.toString()).toEqual(JSON.stringify(obj))
  });
  it('should match getters', function () {
    expect(endpoint.params).toEqual(endpoint.request.params)
    expect(endpoint.url).toEqual(endpoint.request.url)
    expect(endpoint.method).toEqual(endpoint.request.method)
  });
  it('should correctly create axios', function () {
    const baseURL = 'http://test'
    let axios = createAxios({ baseURL })
    expect(axios.defaults.baseURL).toBe(baseURL)

    expect(createAxios(() => axios)).toBe(axios)
  });
})
