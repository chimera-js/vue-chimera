import Axios, { CancelToken } from 'axios'
import {isPlainObject, removeUndefined} from '../utils'

export function createAxios (config) {
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
  request (endpoint) {
    const axios = createAxios(endpoint.axios)
    const request = (({
      url,
      method,
      baseURL,
      requestHeaders: headers,
      timeout
    }) => ({
      url,
      method,
      baseURL,
      headers,
      timeout
    }))(endpoint)

    removeUndefined(request)

    request[(endpoint.method || 'get') !== 'get' ? 'data' : 'params'] = endpoint.params
    request.cancelToken = new CancelToken(c => {
      endpoint._canceler = c
    })
    return axios.request(request).catch(err => {
      throw Object.assign(err, err.response)
    })
  },
  cancel (endpoint) {
    if (typeof endpoint._canceler === 'function') endpoint._canceler()
    endpoint._canceler = null
  },
  isCancelError (err) {
    return Axios.isCancel(err)
  },
  isTimeoutError (err) {
    return err.message && !err.response && err.message.indexOf('timeout') !== -1
  }
}
