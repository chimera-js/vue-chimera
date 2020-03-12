import Axios, { CancelToken } from 'axios'
import { isPlainObject } from '../utils'

function createAxios (config) {
  if (typeof config === 'function') {
    if (typeof config.request === 'function') return config
    return config()
  }
  if (isPlainObject(config)) {
    return Axios.create(config)
  }
  return Axios
}

export default {
  request (request, endpoint) {
    const axios = endpoint.axios ? createAxios(endpoint.axios) : Axios
    if ((request.method || 'get') !== 'get' && request.params) {
      request.data = request.params
      delete request.params
    }
    return axios.request({
      ...request,
      cancelToken: new CancelToken(c => { endpoint._canceler = c })
    })
  },
  cancel (endpoint) {
    if (typeof endpoint._canceler === 'function') endpoint._canceler()
    endpoint._canceler = null
  },
  isCancelError (err) {
    return Axios.isCancel(err)
  }
}
