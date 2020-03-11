import Endpoint from '../../src/Endpoint'
import { MemoryCache } from '../../src/cache/MemoryCache'
import { StorageCache } from '../../src/cache/StorageCache'

let axiosResponse, axiosMock
beforeEach(() => {
  axiosResponse = {
    data: { test: 1 },
    headers: {},
    status: 200
  }
  axiosMock = jest.fn(() => Promise.resolve(axiosResponse))
  axiosMock.request = axiosMock
})

describe('test-memory-cache', function () {
  it('should use cache', async function () {
    const memoryCache = new MemoryCache(1000)
    const endpoint = new Endpoint({
      url: '/users',
      key: 'users',
      auto: false,
      cache: memoryCache
    })

    endpoint.http = axiosMock
    const setSpy = jest.spyOn(memoryCache, 'setItem')
    const getSpy = jest.spyOn(memoryCache, 'getItem')
    const removeSpy = jest.spyOn(memoryCache, 'removeItem')

    await endpoint.fetch()
    expect(axiosMock).toBeCalled()
    expect(setSpy).toBeCalledWith(endpoint.getCacheKey(), axiosResponse)
    expect(endpoint.data).toEqual(axiosResponse.data)

    await endpoint.fetch()
    expect(axiosMock).toBeCalledTimes(1)
    expect(getSpy).toReturnWith(axiosResponse)

    endpoint.deleteCache()
    expect(removeSpy).toBeCalled()
    await endpoint.fetch()
    expect(axiosMock).toBeCalledTimes(2)

    expect(memoryCache.keys()).toEqual([endpoint.getCacheKey()])
    expect(memoryCache.length()).toEqual(1)
    expect(memoryCache.all()[endpoint.getCacheKey()]).toHaveProperty('value', axiosResponse)

    memoryCache.clear()
    expect(memoryCache.all()).toEqual({})
  })
})

describe('test-storage-cache', function () {
  beforeAll(() => {
    let store = {}
    global.window.localStorage = new MemoryCache()
  })
  it('should work', async function () {
    const storageCache = new StorageCache('key')
    const endpoint = new Endpoint({
      url: '/users',
      key: 'users',
      auto: false,
      cache: storageCache
    })

    endpoint.http = axiosMock

    await endpoint.fetch()
    expect(axiosMock).toBeCalledTimes(1)
    expect(endpoint.data).toEqual(axiosResponse.data)

    await endpoint.fetch()
    expect(axiosMock).toBeCalledTimes(1)

    const newEndpoint = new Endpoint({
      url: '/users',
      key: 'users',
      auto: false,
      axios: axiosMock,
      cache: new StorageCache('key')
    })
    await newEndpoint.fetch()
    expect(axiosMock).toBeCalledTimes(1)
    expect(endpoint.data).toEqual(axiosResponse.data)
  })

  it('should not raise error', function () {
    window.localStorage.setItem('key', '{BAD JSON')
    const storageCache = new StorageCache('key')
    expect(storageCache.all()).toEqual({})
  })
})
