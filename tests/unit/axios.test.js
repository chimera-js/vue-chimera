import axiosAdapter from '../../src/http/axiosAdapter'
import Axios from "axios";

describe('test-axios-adapter', function () {
  it('should instantiate axios correctly', function () {
    const spy = jest.spyOn(Axios, 'create')
    axiosAdapter.request({
      method: 'get',
      axios: {
        baseURL: 'http://test.test'
      }
    })
    expect(spy).toBeCalledTimes(1)
  })
  it('should send params in data', async function () {
    let axiosConfig
    const params = { test: 1 }
    await axiosAdapter.request({
      method: 'post',
      params,
      axios: () => ({
        request: async options => {
          axiosConfig = options
        }
      })
    })
    expect(axiosConfig.data).toEqual(params)
  })
})
