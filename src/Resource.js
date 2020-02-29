import Axios from 'axios'
import { isPlainObject, noopReturn } from './utils'
import pDebounce from 'p-debounce'
import * as events from './events'
const { CancelToken } = Axios

const INITIAL_DATA = {
  loading: false,
  status: null,
  data: null,
  headers: null,
  error: null,
  lastLoaded: null
}

export default class Resource {
  constructor (options, initial) {
    if (typeof options === 'string') options = { url: options }

    let {
      autoFetch,
      prefetch,
      cache,
      debounce,
      transformer,
      axios,
      key,
      interval,
      ...request
    } = options

    request.method = (request.method || 'get').toLowerCase()

    if (typeof autoFetch === 'string') {
      this.autoFetch = autoFetch.toLowerCase() === request.method
    } else {
      this.autoFetch = Boolean(autoFetch)
    }

    this.key = key
    this.prefetch = prefetch != null ? prefetch : this.autoFetch
    this.cache = cache
    this.axios = axios
    this.fetchDebounced = pDebounce(this.fetch.bind(this), debounce, { leading: true })

    // Set Transformers
    this.setTransformer(transformer)

    if (request.data) {
      console.warn('[Chimera]: Do not use "params" key inside resource options, use data instead')
    }

    if (request.method !== 'get') {
      request.data = request.params
      delete request.params
    }

    this.request = {
      ...request,
      cancelToken: new CancelToken(c => {
        this._canceler = c
      })
    }

    this._listeners = {}
    this.prefetched = false

    // Set Events
    if (isPlainObject(options.on)) {
      for (let key in options.on) {
        this.on(key, options.on[key])
      }
    }

    initial && Object.assign(this, INITIAL_DATA, initial)
  }

  setTransformer (transformer) {
    if (typeof transformer === 'function') {
      this.responseTransformer = transformer
      this.errorTransformer = transformer
    } else if (isPlainObject('object')) {
      const { response, error } = transformer
      this.responseTransformer = response || noopReturn
      this.errorTransformer = error || noopReturn
    } else {
      this.responseTransformer = noopReturn
      this.errorTransformer = noopReturn
    }
  }

  on (event, handler) {
    let listeners = this._listeners[event] || []
    listeners.push(handler)
    this._listeners[event] = listeners
    return this
  }

  emit (event) {
    (this._listeners[event] || []).forEach(handler => {
      handler(this, event)
    })
  }

  fetch (force, extraParams, extraOptions) {
    return new Promise((resolve, reject) => {
      if (this.cache && !force) {
        let cacheValue = this.getCache()
        if (cacheValue) {
          this.setByResponse(cacheValue)
          return resolve(cacheValue)
        }
      }

      this.loading = true
      this.emit(events.LOADING)

      // Merge extra options
      let { request } = this
      if (isPlainObject(extraOptions)) {
        request = Object.assign({}, request, isPlainObject(extraOptions) ? {} : {})
      }
      // Merge extra params
      if (isPlainObject(extraParams)) {
        const paramKey = request.method === 'get' ? 'params' : 'data'
        request[paramKey] = Object.assign(request[paramKey], extraParams)
      }

      // Finally make request
      this.axios.request(request).then(res => {
        this.setByResponse(res)
        this.setCache(res)
        this.emit(events.SUCCESS)
        resolve(res)
      }).catch(err => {
        this.setByResponse(err.response)
        if (Axios.isCancel(err)) {
          this.emit(events.CANCEL)
        } else if (err.message && !err.response && err.message.indexOf('timeout') !== -1) {
          this.emit(events.TIMEOUT)
        } else {
          this.emit(events.ERROR)
        }

        reject(err)
      }).finally(() => {
        this.loading = false
      })
    })
  }

  reload (force) {
    return this.fetchDebounced(force)
  }

  send (params, options) {
    return this.fetchDebounced(true, params, options)
  }

  cancel (unload) {
    if (unload) this.data = null
    if (typeof this._canceler === 'function') this._canceler()
    this.request.cancelToken = new CancelToken(c => { this._canceler = c })
  }

  getCacheKey () {
    if (this.key) return this.key
    return (typeof window !== 'undefined' && typeof btoa !== 'undefined'
      ? window.btoa
      : x => x)(this.request.url +
      this.request.params +
      this.request.data +
      this.request.method)
  }

  getCache () {
    return this.cache ? this.cache.getItem(this.getCacheKey()) : undefined
  }

  setCache (value) {
    this.cache && this.cache.setItem(this.getCacheKey(), value)
  }

  deleteCache () {
    this.cache && this.cache.removeItem(this.getCacheKey())
  }

  setByResponse (res) {
    res = res || {}
    const isSuccessful = String(res.status).charAt(0) === '2'
    this.status = res.status
    this.headers = res.headers || {}
    this.lastLoaded = new Date()
    this.data = isSuccessful ? this.responseTransformer(res.data, this) : null
    this.error = !isSuccessful ? this.errorTransformer(res.data, this) : null
  }

  startInterval (ms) {
    if (typeof ms !== 'number') throw new Error('[Chimera]: interval should be number')
    if (typeof process !== 'undefined' && process.server) return

    this._interval = ms
    this.stopInterval()
    this._interval_id = setInterval(() => this.reload(true), this._interval)
    this.looping = true
  }

  stopInterval () {
    if (this._interval_id) {
      clearInterval(this._interval_id)
      this.looping = false
      this._interval_id = null
      this._interval = false
    }
  }

  toObj () {
    const json = {}
    Object.keys(INITIAL_DATA).forEach(key => {
      json[key] = this[key]
    })
    return json
  }

  toString () {
    return JSON.stringify(this.toObj())
  }

  get params () {
    return this.request.method === 'get' ? this.request.params : this.request.data
  }

  get url () {
    return this.request.url
  }

  get method () {
    return this.request.method
  }
}
