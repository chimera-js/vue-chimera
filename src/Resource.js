import { isPlainObject, createAxios } from './utils'
import pDebounce from 'p-debounce'
import Axios from 'axios'
const { CancelToken } = Axios

export const EVENT_SUCCESS = 'success'
export const EVENT_ERROR = 'error'
export const EVENT_CANCEL = 'cancel'
export const EVENT_LOADING = 'loading'
export const EVENT_TIMEOUT = 'timeout'

export default class Resource {
  static from (value, baseOptions = {}, id) {
    if (value == null) throw new Error('Cannot create resource from `null`')

    if (value instanceof Resource) { return value }

    if (typeof value === 'string') { return new Resource(id, value, null, baseOptions) }

    if (isPlainObject(value)) {
      const { url, method, ...options } = value

      if (options.cache) {
        if (!baseOptions.cache) throw new Error('Pre definition of cache should be on Chimera instance options')
        if (!isPlainObject(options.cache)) throw Error('Cache should be an object')
        let cache = Object.create(baseOptions.cache)
        options.cache = Object.assign(cache, options.cache)
      }

      return new Resource(id, url, method, Object.assign({}, baseOptions, options))
    }
  }

  constructor (id, url, method, options) {
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
      cancelToken: new CancelToken(c => { this._canceler = c }),
      timeout: options.timeout || undefined
    }

    this.requestConfig[this.requestConfig.method === 'get' ? 'params' : 'data'] = options.params

    this._loading = false
    this._status = null
    this._data = null
    this._headers = null
    this._error = null
    this._lastLoaded = null
    this._eventListeners = {}
    this.keepData = !!options.keepData
    this.cache = options.cache
    this.id = id
    this.ssrPrefetched = false
    this.cacheHit = false

    this.prefetch = typeof options.prefetch === 'string' ? options.prefetch.toLowerCase() === method : Boolean(options.prefetch)
    this.ssrPrefetch = options.ssrPrefetch
    this.fetchDebounced = pDebounce(this.fetch.bind(this), options.debounce || 80, { leading: true })

    // Set Transformers
    if (options.transformer) {
      if (typeof options.transformer === 'function') {
        this.setTransformer(options.transformer)
      } else if (typeof options.transformer === 'object') {
        this.setResponseTransformer(options.transformer.response)
        this.setErrorTransformer(options.transformer.error)
      }
    }
    this.responseTransformer = this.responseTransformer || (r => r)
    this.errorTransformer = this.errorTransformer || (r => r)

    // Set interval.
    if (options.interval) {
      this.startInterval(options.interval)
    }

    // Set Events
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

  startInterval (ms) {
    if (typeof process !== 'undefined' && process.server) return

    if (ms) this._interval = ms
    this.stopInterval()
    this._interval_id = setInterval(() => this.reload(true), this._interval)
  }

  stopInterval () {
    if (this._interval_id) clearInterval(this._interval_id)
  }

  on (event, handler) {
    let listeners = this._eventListeners[event] || []
    listeners.push(handler)
    this._eventListeners[event] = listeners
    return this
  }

  bindListeners (obj) {
    Object.keys(this._eventListeners).forEach(key => {
      (this._eventListeners[key] || []).forEach((handler, i) => {
        this._eventListeners[key][i] = handler.bind(obj)
      })
    })
  }

  emit (event) {
    (this._eventListeners[event] || []).forEach(handler => {
      handler(this)
    })
  }

  fetch (force, extraData) {
    return new Promise((resolve, reject) => {
      if (this.cache && !force) {
        let cacheResult = this.cache.assignCache(this)
        if (cacheResult) {
          this.cacheHit = true
          return resolve(cacheResult._data)
        }
      }

      this._loading = true
      this.emit(EVENT_LOADING)

      // Assign Extra data
      let requestConfig = Object.assign({}, this.requestConfig, typeof extraData === 'object' ? {
        [this.requestConfig.method === 'get' ? 'params' : 'data']: extraData
      } : {})

      this.axios.request(requestConfig).then(res => {
        this._error = null
        this._loading = false
        this._lastLoaded = new Date()
        this._status = res.status
        this._data = res.data ? this.responseTransformer(res.data) : null
        this._headers = res.headers || {}
        this.cache && this.cache.set(this)
        this.emit(EVENT_SUCCESS)
        resolve(this._data)
      }).catch(err => {
        this._data = null
        this._loading = false
        const res = err.response
        if (res) {
          this._status = res.status
          this._error = res.data = res.data ? this.errorTransformer(res.data) : true
          this._headers = res.headers || {}
        } else {
          this._status = 0
          this._error = true
          this._headers = {}
        }

        if (this.cache && this.cache.strategy === 'network-first') {
          this.cache.assignCache(this)
          this.cacheHit = true
          return resolve(this._data)
        }
        if (err.message && !err.response && err.message.indexOf('timeout') !== -1) {
          err.timeout = true
          this.emit(EVENT_TIMEOUT)
        } else if (Axios.isCancel(err)) {
          err.cancel = true
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

  send (extra) {
    return this.fetchDebounced(true, extra)
  }

  cancel (unload) {
    this.stopInterval()
    if (unload) this._data = null
    if (typeof this._canceler === 'function') this._canceler()
    this.requestConfig.cancelToken = new CancelToken(c => { this._canceler = c })
  }

  stop () {
    this.cancel()
  }

  toJSON () {
    const json = {};
    ['_loading', '_status', '_data', '_headers', '_error', '_lastLoaded', 'ssrPrefetched'].forEach(key => {
      json[key] = this[key]
    })
    return json
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
