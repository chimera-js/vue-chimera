import Axios from 'axios'
import pDebounce from 'p-debounce'
import * as events from './events'
import { isPlainObject, noopReturn, warn } from './utils'
const { CancelToken } = Axios

const INITIAL_DATA = {
  status: null,
  data: null,
  headers: null,
  error: null,
  lastLoaded: null
}

export default class Endpoint {
  constructor (options, initial) {
    if (typeof options === 'string') options = { url: options, key: options }

    if (!options) {
      warn('Invalid options', options)
      throw new Error('[Chimera]: invalid options')
    }

    let {
      auto,
      prefetch,
      prefetchTimeout,
      cache,
      debounce,
      transformer,
      axios,
      key,
      interval,
      keepData,
      baseURL,
      ...request
    } = options

    request.method = (request.method || 'get').toLowerCase()

    // Handle type on auto
    if (typeof auto === 'string') {
      this.auto = auto.toLowerCase() === request.method
    } else {
      this.auto = Boolean(auto)
    }

    this.key = key
    this.prefetch = prefetch != null ? prefetch : this.auto
    this.prefetchTimeout = prefetchTimeout
    this.cache = cache
    this.axios = axios
    this.keepData = keepData
    this.fetchDebounced = debounce !== false
      ? pDebounce(this.fetch.bind(this), debounce || 50, { leading: true })
      : this.fetch

    // Set Transformers
    this.setTransformer(transformer)

    /* istanbul ignore if */
    if (request.data) {
      warn('Do not use "params" key inside endoint options, use data instead')
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
    if (baseURL) this.request.baseURL = baseURL

    this._listeners = {}
    this.prefetched = false
    this.loading = false

    // Set Events
    if (isPlainObject(options.on)) {
      for (let key in options.on) {
        this.on(key, options.on[key])
      }
    }

    Object.assign(this, INITIAL_DATA, initial || {})

    interval && this.startInterval(interval)
  }

  setTransformer (transformer) {
    if (typeof transformer === 'function') {
      this.responseTransformer = transformer
      this.errorTransformer = transformer
    } else if (isPlainObject(transformer)) {
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

  fetch (force, extraOptions) {
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

      let { request } = this
      if (isPlainObject(extraOptions)) {
        // Merge extra options
        if (extraOptions.params) {
          const key = request.method === 'get' ? 'params' : 'data'
          extraOptions[key] = Object.assign({}, request[key], extraOptions.params)
        }
        request = Object.assign({}, request, extraOptions)
      }

      // Finally make request
      this.axios.request(request).then(res => {
        this.loading = false
        this.setByResponse(res)
        this.setCache(res)
        this.emit(events.SUCCESS)
        resolve(res)
      }).catch(err => {
        this.loading = false
        this.setByResponse(err.response)
        if (Axios.isCancel(err)) {
          this.emit(events.CANCEL)
        } else if (err.message && !err.response && err.message.indexOf('timeout') !== -1) {
          this.emit(events.TIMEOUT)
          this.emit(events.ERROR)
        } else {
          this.emit(events.ERROR)
        }

        reject(err)
      })
    })
  }

  reload (force) {
    return this.fetchDebounced(force)
  }

  send (params) {
    return this.fetchDebounced(true, { params })
  }

  cancel () {
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
    /* istanbul ignore if */
    if (typeof ms !== 'number') throw new Error('[Chimera]: interval should be number')
    /* istanbul ignore if */
    if (typeof process !== 'undefined' && process.server) return

    this._interval = ms
    this.stopInterval()
    this._interval_id = setInterval(() => this.reload(true), this._interval)
  }

  stopInterval () {
    if (this._interval_id) {
      clearInterval(this._interval_id)
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

  get looping () {
    return !!this._interval
  }
}
