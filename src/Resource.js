import axios from 'axios'
import { isPlainObject } from "./utils";

export const EVENT_SUCCESS = 'success'
export const EVENT_ERROR = 'error'
export const EVENT_LOADING = 'loading'

class Resource {

    static from(value) {

        if (value instanceof Resource)
            return value

        if (typeof value === 'string')
            return new Resource(value, 'GET')

        if (isPlainObject(value)) {
            let axiosClient = value.client || (value.axiosConfig ? axios.create(value.axiosConfig) : axios)
            let resource = new Resource(value.url, value.method, value.params, value.headers, axiosClient)
            if (value.interval)
                resource.setInterval(value.interval)
            if (typeof value.transformer === 'function')
                resource.setTransformer(value.transformer)
            if (typeof value.transformer === 'object' ) {
                resource.setResponseTransformer(value.transformer.response)
                resource.setErrorTransformer(value.transformer.error)
            }
            if (value.prefetch !== undefined)
                resource.prefetch = Boolean(value.prefetch)
            return resource
        }
    }

    constructor(url, method, params, headers, client) {

        method = method ? method.toLowerCase() : 'get'
        if (method && ['get', 'post', 'put', 'patch', 'delete'].indexOf(method) === -1)
            throw 'Bad Method requested: ' + method

        this.requestConfig = {
            url: url,
            method: method ? method.toUpperCase() : 'GET',
            headers: headers,
        }

        this.requestConfig[this.requestConfig.method === 'GET' ? 'params' : 'data'] = params

        this.client = client || axios

        this._loading = false
        this._status = null
        this._data = null
        this._error = null
        this._lastLoaded = null
        this._eventListeners = {}
        this.prefetch = true
        this.cache = Resource.cache

        this.errorTransformer = (err) => err
        this.responseTransformer = (res) => res

        if (this.prefetch)
            this.reload()
    }

    setResponseTransformer(transformer) {
        this.responseTransformer = transformer
    }

    setErrorTransformer(transformer) {
        this.errorTransformer = transformer
    }

    setTransformer(transformer) {
        this.responseTransformer = transformer
        this.errorTransformer = transformer
    }

    setInterval(ms) {
        this._interval = ms
        if (this._interval_id)
            clearInterval(this._interval_id)
        this._interval_id = setInterval(() => this.reload(true), ms)
    }

    on(event, handler) {
        let listeners = this._eventListeners[event] || []
        listeners.push(handler)
        this._eventListeners[event] = listeners
        return this
    }

    emit(event) {
        (this._eventListeners[event] || []).forEach(handler => {
            handler(this)
        })
    }

    reload(force) {

        let setByResponse = (res) => {
            this._status = res.status
            this._error = null
            this._data = this.responseTransformer(res.data)
            this._loading = false
            this._lastLoaded = new Date()
        }

        if (this.cache && !force) {
            let cacheValue = this.cache.getItem(this.getCacheKey())
            if (cacheValue) {
                setByResponse(cacheValue)
                return
            }
        }

        this._loading = true
        this.emit(EVENT_LOADING)
        this.client.request(this.requestConfig).then(res => {

            setByResponse(res)
            this.setCache(res)
            this.emit(this.EVENT_SUCCESS)

        }).catch(err => {
            this._status = err.status
            this._data = null
            this._error = err.responseJSON ? this.errorTransformer(err.responseJSON) : err.responseText
            this._loading = false
            this.emit(this.EVENT_ERROR)
        })
    }

    getCacheKey() {
        return (btoa || (x => x))(this.requestConfig.url
            + this.requestConfig.params
            + this.requestConfig.data
            + this.requestConfig.method)
    }

    setCache(value) {
        if (this.cache)
            this.cache.setItem(this.getCacheKey(), value)
    }

    get loading() {
        return this._loading
    }

    get status() {
        return this._status
    }

    get data() {
        return this._data
    }

    get error() {
        return this._error
    }

    get lastLoaded() {
        return this._lastLoaded
    }
}

class GetResource extends Resource {

    constructor(url, params, headers, client) {
        super(url, 'GET', params, headers, client);
    }
}

class PostResource extends Resource {

    constructor(url, params, headers, client) {
        super(url, 'POST', params, headers, client);
    }
}

export { PostResource, GetResource }

export default Resource