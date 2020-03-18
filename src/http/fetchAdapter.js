import fetch from './fetch'

function queryString (obj) {
  return Object.entries(obj).map(entry => entry.join('=')).join('&')
}

export default {
  async request (endpoint) {
    const request = (({
      method,
      requestHeaders
    }) => ({
      ...(endpoint.fetchOptions || {}),
      method: method.toUpperCase(),
      headers: requestHeaders
    }))(endpoint)

    let url = ((endpoint.baseURL || '') + '/' + endpoint.url).replace('//', '/')
    if ((request.method || 'get') === 'get') {
      url += '?' + queryString(request.params)
    } else {
      request.body = JSON.stringify(endpoint.params)
    }

    let timeout = false
    if (typeof AbortController !== 'undefined') {
      endpoint._abort = new AbortController()
      request.signal = endpoint._abort.signal
      if (endpoint.timeout) {
        setTimeout(() => {
          if (endpoint._abort) {
            timeout = true
            endpoint._abort.abort()
          }
        }, endpoint.timeout)
      }
    }

    const res = await fetch(url, request).catch(error => error)
    endpoint._abort = null
    const data = res.json ? await res.json() : null
    const response = {
      status: res.status || 0,
      headers: res.headers || {},
      data,
      cancel: !timeout && res.name === 'AbortError',
      timeout
    }
    if (!res.ok) {
      throw response
    }
    return response
  },
  cancel (endpoint) {
    if (endpoint._abort) {
      endpoint._abort.abort()
    }
    endpoint._abort = null
  },
  isCancelError (err) {
    return err.cancel
  },
  isTimeoutError (err) {
    return err.timeout
  }
}
