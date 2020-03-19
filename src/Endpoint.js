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

export default class Endpoint {
  constructor (opts, initial) {
    if (typeof opts === 'string') opts = { url: opts, key: opts }

    if (!opts) {
      warn('Invalid options', opts)
      throw new Error('[Chimera]: invalid options')
    }

    opts = this.options ? this.constructor.applyDefaults(this.options, opts) : opts

    let {
      debounce,
      transformer,
      interval,
      headers,
      on: listeners,
      auto,
      prefetch,
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
    this.requestHeaders = headers

    // Handle type on auto
    this.auto = typeof auto === 'string' ? auto.toLowerCase() === options.method : !!auto
    this.prefetch = prefetch != null ? prefetch : this.auto

    Object.assign(this, INITIAL_RESPONSE, initial || {})

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
    this.listeners[event] = (this.listeners[event] || []).concat(handler)
    return this
  }

  emit (event) {
    (this.listeners[event] || []).forEach(handler => {
      handler(this, event)
    })
  }

  fetch (force, extraOptions) {
    if (this.cache && !force) {
      let cacheValue = this.getCache()
      if (cacheValue) {
        this.setResponse(cacheValue, true)
        return Promise.resolve(cacheValue)
      }
    }
    let request = this
    if (isPlainObject(extraOptions)) {
      request = Object.create(this)
      // Merge extra options
      if (extraOptions.params) extraOptions.params = Object.assign({}, request.params, extraOptions.params)
      if (extraOptions.headers) extraOptions.requestHeaders = Object.assign({}, request.requestHeaders, extraOptions.headers)
      Object.assign(request, extraOptions)
    }
    this.loading = true
    this.emit(events.LOADING)
    return this.http.request(request).then(res => {
      this.loading = false
      this.setResponse(res, true)
      this.setCache(res)
      this.emit(events.SUCCESS)
      return res
    }).catch(err => {
      this.loading = false
      this.setResponse(err, false)
      if (!this.http.isCancelError(err)) {
        if (this.http.isTimeoutError) {
          this.emit(events.TIMEOUT)
        }
        this.emit(events.ERROR)
      }

      throw err
    })
  }

  reload (force) {
    return this.fetchDebounced(force)
  }

  send (params) {
    return this.fetch(true, { params })
  }

  cancel (silent) {
    if (this.loading) {
      this.http.cancel(this)
      !silent && this.emit(events.CANCEL)
    }
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

  setResponse (res, success) {
    res = res || {}
    this.status = res.status
    this.data = success ? this.responseTransformer(res.data, this) : null
    this.error = !success ? this.errorTransformer(res.data, this) : null

    this.headers = !this.light ? res.headers || {} : undefined
    this.lastLoaded = !this.light ? new Date() : undefined
  }

  startInterval (ms) {
    /* istanbul ignore if */
    if (typeof ms !== 'number') throw new Error('[Chimera]: interval should be number')
    /* istanbul ignore if */
    if (typeof process !== 'undefined' && process.server) return

    this._interval = ms
    this.stopInterval()
    this._interval_id = setInterval(() => {
      this.cancel()
      this.reload(true)
    }, this._interval)
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

  get response () {
    return mergeExistingKeys(INITIAL_RESPONSE, this)
  }

  toString () {
    return JSON.stringify(this.response)
  }

  static applyDefaults (base, options) {
    if (!base) return options
    options = { ...options }
    const strats = this.optionMergeStrategies
    Object.keys(base).forEach(key => {
      options[key] = (key in options && strats[key])
        ? strats[key](base[key], options[key])
        : (key in options ? options[key] : base[key])
    })
    return options
  }
}

Endpoint.prototype.http = axiosAdapter

const strats = Endpoint.optionMergeStrategies = {}

strats.headers = strats.params = strats.transformers = function (base, opts) {
  if (isPlainObject(base) && isPlainObject(opts)) {
    return {
      ...base,
      ...opts
    }
  }
  return opts === undefined ? base : opts
}
strats.on = function (fromVal, toVal) {
  const value = { ...(fromVal || {}) }
  Object.entries(toVal || {}).forEach(([event, handlers]) => {
    const h = value[event]
    value[event] = h ? [].concat(h).concat(handlers) : handlers
  })
  return value
}
