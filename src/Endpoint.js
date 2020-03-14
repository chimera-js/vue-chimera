import pDebounce from 'p-debounce'
import * as events from './events'
import { isPlainObject, mergeExistingKeys, noopReturn, warn } from './utils'
import axiosAdapter from './http/axiosAdapter'

const INITIAL_RESPONSE = {
  status: null,
  data: null,
  headers: undefined,
  error: null,
  lastLoaded: undefined
}

const INITIAL_REQUEST = {
  url: null,
  baseURL: null,
  method: 'get',
  params: null,
  timeout: 0,
  headers: null
}

export default class Endpoint {
  constructor (opts, initial) {
    if (typeof opts === 'string') opts = { url: opts, key: opts }

    if (!opts) {
      warn('Invalid options', opts)
      throw new Error('[Chimera]: invalid options')
    }

    let {
      debounce,
      transformer,
      interval,
      on: listeners,
      headers,
      ...options
    } = opts

    options.method = (options.method || 'get').toLowerCase()

    this.fetchDebounced = debounce !== false
      ? pDebounce(this.fetch.bind(this), debounce || 50, { leading: true })
      : this.fetch

    // Set Transformers
    this.setTransformer(transformer)

    this.prefetched = false
    this.loading = false

    // Set Events
    this.listeners = Object.create(null)
    if (isPlainObject(listeners)) {
      for (const key in listeners) {
        this.on(key, listeners[key])
      }
    }

    Object.assign(this, options)
    this.requestHeaders = Object.assign({}, this.headers, headers || {})

    // Handle type on auto
    if (typeof this.auto === 'string') {
      this.auto = this.auto.toLowerCase() === this.method
    } else {
      this.auto = Boolean(this.auto)
    }
    this.prefetch = this.prefetch != null ? this.prefetch : this.auto

    Object.assign(this, INITIAL_RESPONSE, initial || {})

    this.http = axiosAdapter

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
    let listeners = this.listeners[event] || []
    listeners.push(handler)
    this.listeners[event] = listeners
    return this
  }

  emit (event) {
    (this.listeners[event] || []).forEach(handler => {
      handler(this, event)
    })
  }

  fetch (force, extraOptions) {
    return new Promise((resolve, reject) => {
      if (this.cache && !force) {
        let cacheValue = this.getCache()
        if (cacheValue) {
          this.setResponse(cacheValue)
          return resolve(cacheValue)
        }
      }

      let { request } = this
      if (isPlainObject(extraOptions)) {
        // Merge extra options
        ['params', 'headers'].forEach(key => {
          if (extraOptions[key]) {
            extraOptions[key] = Object.assign({}, request[key], extraOptions[key])
          }
        })
        request = Object.assign({}, request, extraOptions)
      }

      this.loading = true
      this.emit(events.LOADING)

      // Finally make request
      this.http.request(request, this).then(res => {
        this.loading = false
        this.setResponse(res)
        this.setCache(res)
        this.emit(events.SUCCESS)
        resolve(res)
      }).catch(err => {
        this.loading = false
        this.setResponse(err.response)
        if (this.http.isCancelError(err)) {
          this.emit(events.CANCEL)
        } else {
          if (err.message && !err.response && err.message.indexOf('timeout') !== -1) {
            this.emit(events.TIMEOUT)
          }
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
    this.http.cancel(this)
  }

  getCacheKey () {
    if (this.key) return this.key
    /* istanbul ignore next */
    throw new Error('[Chimera]: cannot use cache without "key" property')
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

  setResponse (res) {
    res = res || {}
    const isSuccessful = String(res.status).charAt(0) === '2'
    this.status = res.status
    this.data = isSuccessful ? this.responseTransformer(res.data, this) : null
    this.error = !isSuccessful ? this.errorTransformer(res.data, this) : null
    if (!this.light) {
      this.headers = res.headers || {}
      this.lastLoaded = new Date()
    }
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

  get looping () {
    return !!this._interval
  }

  get request () {
    return mergeExistingKeys(INITIAL_REQUEST, this, {
      baseURL: this.baseURL,
      timeout: this.timeout,
      params: this.params,
      headers: this.requestHeaders
    })
  }

  get response () {
    return mergeExistingKeys(INITIAL_RESPONSE, this)
  }

  toString () {
    return JSON.stringify(this.response)
  }
}
