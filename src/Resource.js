import { isPlainObject, createAxios } from './utils'
import LocalStorageCache from './cache/LocalStorageCache'
import NullCache from './cache/NullCache'
import pDebounce from 'p-debounce'
import Axios from 'axios'
const { CancelToken } = Axios

export const EVENT_SUCCESS = 'success'
export const EVENT_ERROR = 'error'
export const EVENT_CANCEL = 'cancel'
export const EVENT_LOADING = 'loading'

export default class Resource {
  static from (value, baseOptions = {}) {
    if (value == null) throw new Error('Cannot create resource from `null`')

    if (value instanceof Resource) { return value }

    if (typeof value === 'string') { return new Resource(value, 'get', baseOptions) }

    if (isPlainObject(value)) {
      const { url, method, ...options } = value
      return new Resource(url, method, Object.assign({}, baseOptions, options))
    }
  }

  constructor (url, method, options) {
    options = options || {}
    method = method ? method.toLowerCase() : 'get'
    if (method &&
      ['get', 'post', 'put', 'patch', 'delete'].indexOf(method) === -1) {
      throw new Error('Bad Method requested: ' + method)
    }

    this.axios = createAxios(options.axios)

    this.requestConfig = {
      url: url,
      method: method ? method.toLowerCase() : 'get',
      headers: options.headers || {},
      cancelToken: new CancelToken(c => { this._canceler = c })
    }

    this.requestConfig[this.requestConfig.method === 'get' ? 'params' : 'data'] = options.params

    this._loading = false
    this._status = null
    this._data = null
    this._headers = null
    this._error = null
    this._lastLoaded = null
    this._eventListeners = {}

    this.ssrPrefetched = false

    this.prefetch = typeof options.prefetch === 'string' ? options.prefetch.toLowerCase() === method : Boolean(options.prefetch)
    this.ssrPrefetch = options.ssrPrefetch
    this.cache = this.getCache(options.cache)
    this.fetchDebounced = pDebounce(this.fetch.bind(this), options.debounce || 80, { leading: true })

    // Set Transformers
    if (options.transformer) {
      if (typeof options.transformer === 'function') {
        this.setTransformer(options.transformer)
      } else if (typeof options.transformer === 'object') {
        this.setResponseTransformer(options.transformer.response)
        this.setErrorTransformer(options.transformer.error)
      }
    } else {
      this.errorTransformer = (err) => err
      this.responseTransformer = (res) => res
    }

    // Set interval.
    if (options.interval) {
      this.setInterval(options.interval)
    }

    if (typeof options.on === 'object' && options.on) {
      for (let key in options.on) {
        this.on(key, options.on[key])
      }
    }
  }

  setResponseTransformer (transformer) {
    this.responseTransformer = transformer
  }

  setErrorTransformer (transformer) {
    this.errorTransformer = transformer
  }

  setTransformer (transformer) {
    this.responseTransformer = transformer
    this.errorTransformer = transformer
  }

  setInterval (ms) {
    if (typeof process !== 'undefined' && process.server) return

    this._interval = ms
    if (this._interval_id) { clearInterval(this._interval_id) }
    this._interval_id = setInterval(() => this.reload(true), ms)
  }

  on (event, handler) {
    let listeners = this._eventListeners[event] || []
    listeners.push(handler)
    this._eventListeners[event] = listeners
    return this
  }

  emit (event) {
    (this._eventListeners[event] || []).forEach(handler => {
      handler(this)
    })
  }

  fetch (force) {
    return new Promise((resolve, reject) => {
      let setByResponse = (res) => {
        this._error = null
        this._loading = false
        if (res) {
          this._status = res.status
          this._data = this.responseTransformer(res.data)
          this._headers = res.headers
          this._lastLoaded = new Date()
        }
      }

      if (this.cache && !force) {
        let cacheValue = this.cache.getItem(this.getCacheKey())
        if (cacheValue) {
          setByResponse(cacheValue)
          resolve(cacheValue)
          return
        }
      }

      this._loading = true
      this.emit(EVENT_LOADING)
      this.axios.request(this.requestConfig).then(res => {
        setByResponse(res)
        this.setCache(res)
        this.emit(EVENT_SUCCESS)
        resolve(res)
      }).catch(err => {
        this._data = null
        this._loading = false
        const errorResponse = err.response
        if (errorResponse) {
          this._status = errorResponse.status
          this._error = this.errorTransformer(errorResponse.data)
          this._headers = errorResponse.headers
        }
        if (Axios.isCancel(err)) {
          this.emit(EVENT_CANCEL)
        } else {
          this.emit(EVENT_ERROR)
        }

        reject(err)
      })
    })
  }

  reload (force) {
    return this.fetchDebounced(force)
  }

  execute () {
    return this.fetchDebounced(true)
  }

  send () {
    return this.fetchDebounced(true)
  }

  cancel () {
    if (typeof this._canceler === 'function') this._canceler()
    this.requestConfig.cancelToken = new CancelToken(c => { this._canceler = c })
  }

  stop () {
    this.cancel()
  }

  getCache (cache) {
    const caches = {
      'no-cache': () => new NullCache(),
      'localStorage': () => new LocalStorageCache(this.getConfig().cacheExpiration || 10000)
    }
    cache = cache || 'no-cache'
    return caches[cache] ? caches[cache]() : null
  }

  getCacheKey () {
    return (typeof window !== 'undefined' && typeof btoa !== 'undefined'
      ? window.btoa
      : x => x)(this.requestConfig.url +
      this.requestConfig.params +
      this.requestConfig.data +
      this.requestConfig.method)
  }

  setCache (value) {
    if (this.cache) { this.cache.setItem(this.getCacheKey(), value) }
  }

  get loading () {
    return this._loading
  }

  get status () {
    return this._status
  }

  get data () {
    return this._data
  }

  get headers () {
    return this._headers
  }

  get error () {
    return this._error
  }

  get lastLoaded () {
    return this._lastLoaded
  }
}
