import Axios from 'axios'
import Vue from 'vue'
import { isPlainObject, mergeExistingKeys, noopReturn } from './utils'
import pDebounce from 'p-debounce'
const { CancelToken } = Axios

export const EVENT_SUCCESS = 'success'
export const EVENT_ERROR = 'error'
export const EVENT_CANCEL = 'cancel'
export const EVENT_LOADING = 'loading'
export const EVENT_TIMEOUT = 'timeout'

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
      ...requestConfig
    } = options

    requestConfig.method = (requestConfig.method || 'get').toLowerCase()

    if (typeof autoFetch === 'string') {
      this.autoFetch = autoFetch.toLowerCase() === requestConfig.method
    } else {
      this.autoFetch = Boolean(prefetch)
    }

    this.key = key
    this.prefetch = typeof prefetch === 'boolean' ? prefetch : this.autoFetch
    this.cache = cache
    this.axios = axios
    this.fetchDebounced = pDebounce(this.fetch.bind(this), debounce, { leading: true })
    this._interval = interval

    // Set Transformers
    this.setTransformer(transformer)

    if (requestConfig.data) {
      console.warn('[Chimera]: Do not use "params" key inside resource options, use data instead')
    }
    if ('params' in options && !isPlainObject(options.params)) {
      throw new Error('[Chimera]: Parameters is not a plain object')
    }
    if (requestConfig.method !== 'get') {
      requestConfig.data = requestConfig.params
      delete requestConfig.params
    }

    this.requestConfig = {
      ...requestConfig,
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

    this.setInitial(initial)
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

  setInitial (data) {
    Object.assign(this, mergeExistingKeys({
      loading: false,
      status: null,
      data: null,
      headers: null,
      error: null,
      lastLoaded: null
    }, data || {}))
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
      this.emit(EVENT_LOADING)

      // Merge extra options
      let { requestConfig } = this
      if (isPlainObject(extraOptions)) {
        requestConfig = Object.assign({}, requestConfig, isPlainObject(extraOptions) ? {} : {})
      }
      // Merge extra params
      if (isPlainObject(extraParams)) {
        const paramKey = requestConfig.method === 'get' ? 'params' : 'data'
        requestConfig[paramKey] = Object.assign(requestConfig[paramKey], extraParams)
      }

      // Finally make request
      this.axios.request(requestConfig).then(res => {
        this.setByResponse(res)
        this.setCache(res)
        this.emit(EVENT_SUCCESS)
        resolve(res)
      }).catch(err => {
        this.setByResponse(err.response)
        if (Axios.isCancel(err)) {
          this.emit(EVENT_CANCEL)
        } else if (err.message && !err.response && err.message.indexOf('timeout') !== -1) {
          this.emit(EVENT_TIMEOUT)
        } else {
          this.emit(EVENT_ERROR)
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
    this.requestConfig.cancelToken = new CancelToken(c => { this._canceler = c })
  }

  getCacheKey () {
    if (this.key) return this.key
    return (typeof window !== 'undefined' && typeof btoa !== 'undefined'
      ? window.btoa
      : x => x)(this.requestConfig.url +
      this.requestConfig.params +
      this.requestConfig.data +
      this.requestConfig.method)
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
    const json = {};
    ['loading', 'status', 'data', 'headers', 'error', 'lastLoaded', 'prefetched'].forEach(key => {
      json[key] = this[key]
    })
    return json
  }

  toString () {
    return JSON.stringify(this.toObj())
  }
}
