import sinon from 'sinon'
import Resource from '../../src/Resource'
import NullResource from '../../src/NullResource'
import * as events from '../../src/events'
import axios from 'axios'
import {createAxios, isPlainObject} from "../../src/utils";

let server
let resource
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
  resource = new Resource({
    url: '/users',
    autoFetch: false,
    axios: client
  })
})

describe('test-instantiation', function () {
  it('should instantiate Resource from string', function () {
    let r = new Resource('/users')
    expect(r).toBeInstanceOf(Resource)
    expect(r.request.method.toLowerCase()).toBe('get')
    expect(r.request.url).toBe('/users')
  })

  it('should instantiate Resource from object', function () {
    let tr = (v) => v
    let r = new Resource({
      url: '/u',
      prefetch: false,
      method: 'POST',
      debounce: false,
      transformer: {
        response: tr,
        error: tr
      }
    })
    expect(r).toBeInstanceOf(Resource)
    expect(r.request.method.toLowerCase()).toBe('post')
    expect(r.request.url).toBe('/u')
    expect(r.responseTransformer).toBe(tr)
    expect(r.errorTransformer).toBe(tr)
    expect(r.fetch === r.fetchDebounced).toBeTruthy()
  })

  it('should be null resource', function () {
    expect(() => new Resource(null)).toThrow()

    let r = new NullResource()

    expect(r.fetch()).rejects.toBeInstanceOf(Error)
  });

  it('should have initial data', function () {
    const data = {}
    let r = new Resource('/users', { data })
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

    expect(resource.loading).toBeFalsy()

    resource.fetch().then(res => {
      expect(resource.status).toBe(200)
      expect(resource.data).toEqual(data)
      expect(resource.headers).toEqual(headers)
      expect(resource.loading).toBeFalsy()
      expect(resource.lastLoaded).toBeInstanceOf(Date)
      done()
    }).catch(err => {
      expect(resource.loading).toBeFalsy()
      done(err)
    })

    expect(resource.loading).toBeTruthy()
  })

  it('should receive status 501', function (done) {
    server.respondWith('GET', '/users', [
      501,
      {'Content-Type': 'application/json'},
      JSON.stringify(data)
    ])

    expect(resource.loading).toBeFalsy()
    resource.send().then(done).catch(err => {
      expect(resource.loading).toBeFalsy()
      expect(resource.status).toBe(501)
      expect(resource.error).toEqual(data)
      done()
    })

    expect(resource.loading).toBeTruthy()
  })

  it('should send with extra', async function () {
    resource.axios = {
      request: (o) => Promise.resolve(o)
    }
    resource.request.params = {
      a: 1,
      b: 2,
    }

    const options = await resource.send({ params: { b: 3 }, url: 'test' })

    expect(options.url).toBe('test')
    expect(options.params).toHaveProperty('a', 1)
    expect(options.params).toHaveProperty('b', 3)
  });
})

describe('test-transformers', function () {
  let data = [{id: 1, name: 'User 1'}, {id: 2, name: 'User 2'}]
  let tr = res => res.map(val => val.id)

  it('should work with single function', function () {
    let resource = new Resource({
      transformer: tr
    })
    expect(resource.responseTransformer === resource.errorTransformer).toBeTruthy()
    expect(resource.responseTransformer === tr).toBeTruthy()
  })

  it('should transform response', function (done) {
    server.respondWith('GET', '/users', [
      200,
      {'Content-Type': 'application/json'},
      JSON.stringify(data)
    ])

    resource.setTransformer({response: tr})

    resource.fetch().then(res => {
      expect(resource.data).toEqual(tr(data))
      done()
    }).catch(Promise.reject)
  })

  it('should transform error', function (done) {
    server.respondWith('GET', '/users', [
      500,
      {'Content-Type': 'application/json'},
      JSON.stringify(data)
    ])

    resource.setTransformer({error: tr})

    resource.fetch()
      .then(done)
      .catch(err => {
        expect(resource.error).toEqual(tr(data))
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

    resource.fetch()

    resource.on(events.SUCCESS, () => {
      done()
    })
  })

  it('should broadcast error event', function (done) {
    server.respondWith('GET', '/users', [
      501,
      {'Content-Type': 'application/json'},
      JSON.stringify({})
    ])

    resource.fetch()

    resource.on(events.ERROR, () => {
      done()
    })
  })

  it('should broadcast loading event', function (done) {
    server.respondWith('GET', '/users', [
      200,
      {'Content-Type': 'application/json'},
      JSON.stringify({})
    ])

    resource.on(events.LOADING, () => {
      done()
    })

    resource.fetch()
  })

  it('should broadcast cancel event', function (done) {
    server.respondWith('GET', '/users', [
      200,
      {'Content-Type': 'application/json'},
      JSON.stringify({})
    ])

    resource = new Resource({
      url: '/users',
      autoFetch: false,
      on: {
        [events.CANCEL]() {
          done()
        }
      },
      axios: createAxios()
    })

    resource.fetch()
    resource.cancel()
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
    resource.on(events.CANCEL, cancelSpy)
    expect(resource.loading).toBeFalsy()
    resource.fetch().then(() => {
      done()
      throw new Error('Not cancelled')
    }).catch((err) => {
      expect(err.__CANCEL__).toBeTruthy()
      expect(resource.loading).toBeFalsy()
      expect(resource.data).toBeNull()
      expect(cancelSpy).toBeCalled()
      done()
    })
    expect(resource.loading).toBeTruthy()
    resource.cancel()
  })
})

describe('test-misc', function () {
  it('should serialize', function () {
    const obj = resource.toObj()
    expect(isPlainObject(obj)).toBeTruthy()
    expect(resource.toString()).toEqual(JSON.stringify(obj))
  });
  it('should match getters', function () {
    expect(resource.params).toEqual(resource.request.params)
    expect(resource.url).toEqual(resource.request.url)
    expect(resource.method).toEqual(resource.request.method)
  });
  it('should correctly create axios', function () {
    let axios = createAxios(client)
    expect(axios).toBe(client)

    axios = createAxios()
    expect(axios)
  });
})
