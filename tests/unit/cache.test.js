import Resource from '../../src/Resource'
import { MemoryCache } from '../../src/cache/MemoryCache'
import { StorageCache } from '../../src/cache/StorageCache'

let axiosResponse, axiosMock
beforeEach(() => {
  axiosResponse = {
    data: { test: 1 },
    headers: {},
    status: 200,
  }
  axiosMock = jest.fn(() => Promise.resolve(axiosResponse))
  axiosMock.request = axiosMock
})

describe('test-resource-cache', function () {

  it('should use cache', async function () {
    const memoryCache = new MemoryCache(1000)
    const resource = new Resource({
      url: '/users',
      key: 'users',
      autoFetch: false,
      axios: axiosMock,
      cache: memoryCache
    })

    const setSpy = jest.spyOn(memoryCache, 'setItem')
    const getSpy = jest.spyOn(memoryCache, 'getItem')
    const removeSpy = jest.spyOn(memoryCache, 'removeItem')

    await resource.fetch()
    expect(axiosMock).toBeCalled()
    expect(setSpy).toBeCalledWith(resource.getCacheKey(), axiosResponse)
    expect(resource.data).toEqual(axiosResponse.data)

    await resource.fetch()
    expect(axiosMock).toBeCalledTimes(1)
    expect(getSpy).toReturnWith(axiosResponse)

    resource.deleteCache()
    expect(removeSpy).toBeCalled()
    await resource.fetch()
    expect(axiosMock).toBeCalledTimes(2)

    expect(memoryCache.keys()).toEqual([resource.getCacheKey()])
    expect(memoryCache.length()).toEqual(1)
    expect(memoryCache.all()[resource.getCacheKey()]).toHaveProperty('value', axiosResponse)

    memoryCache.clear()
    expect(memoryCache.all()).toEqual({})
  });
})

describe('test-storage-cache', function () {
  beforeAll(() => {
    let store = {}
    global.window.localStorage = new MemoryCache()
  })
  it('should work', async function () {
    const storageCache = new StorageCache('key')
    const resource = new Resource({
      url: '/users',
      key: 'users',
      autoFetch: false,
      axios: axiosMock,
      cache: storageCache
    })

    await resource.fetch()
    expect(axiosMock).toBeCalledTimes(1)
    expect(resource.data).toEqual(axiosResponse.data)

    await resource.fetch()
    expect(axiosMock).toBeCalledTimes(1)

    const newResource = new Resource({
      url: '/users',
      key: 'users',
      autoFetch: false,
      axios: axiosMock,
      cache: new StorageCache('key')
    })
    await newResource.fetch()
    expect(axiosMock).toBeCalledTimes(1)
    expect(resource.data).toEqual(axiosResponse.data)
  });

  it('should not raise error', function () {
    window.localStorage.setItem('key', '{BAD JSON')
    const storageCache = new StorageCache('key')
    expect(storageCache.all()).toEqual({})
  });
})
