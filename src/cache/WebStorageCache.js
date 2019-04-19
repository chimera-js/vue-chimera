export default class WebStorageCache {
  constructor (options) {
    if (typeof window !== 'undefined') {
      const store = String(options.store).replace(/[\s-]/g).toLowerCase()
      this.storage = store === 'sessionstorage' ? window.sessionStorage : window.localStorage
    }

    if (!this.storage) throw Error('LocalStorageCache: Local storage is not available.')

    this.defaultExpiration = options.defaultExpiration || 60000
  }

  /**
     *
     * @param key         Key for the cache
     * @param value       Value for cache persistence
     * @param expiration  Expiration time in milliseconds
     */
  setItem (key, value, expiration) {
    this.storage.setItem(key, JSON.stringify({
      expiration: Date.now() + (expiration || this.defaultExpiration),
      value
    }))
  }

  /**
     * If Cache exists return the Parsed Value, If Not returns {null}
     *
     * @param key
     */
  getItem (key) {
    let item = this.storage.getItem(key)
    item = JSON.parse(item)

    if (item && item.value && Date.now() <= item.expiration) { return item.value }

    this.removeItem(key)
    return null
  }

  removeItem (key) {
    this.storage.removeItem(key)
  }

  keys () {
    return Object.keys(this.storage)
  }

  all () {
    return this.keys().reduce((obj, str) => {
      obj[str] = this.storage.getItem(str)
      return obj
    }, {})
  }

  length () {
    return this.keys().length
  }

  clear () {
    this.storage.clear()
  }
}
