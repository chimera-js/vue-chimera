module.exports = class MemoryCache {
  constructor (expiration) {
    this.expiration = expiration || 1000 * 60
    this._store = {}
  }

  /**
     *
     * @param key         Key for the cache
     * @param value       Value for cache persistence
     * @param expiration  Expiration time in milliseconds
     */
  setItem (key, value, expiration) {
    this._store[key] = {
      expiration: Date.now() + (expiration || this.expiration),
      value
    }
  }

  /**
     * If Cache exists return the Parsed Value, If Not returns {null}
     *
     * @param key
     */
  getItem (key) {
    let item = this._store[key]

    if (item && item.value && Date.now() <= item.expiration) {
      return item.value
    }

    this.removeItem(key)
    return null
  }

  removeItem (key) {
    delete this._store[key]
  }

  keys () {
    return Object.keys(this._store)
  }

  all () {
    return this.keys().reduce((obj, str) => {
      obj[str] = this._store[str]
      return obj
    }, {})
  }

  length () {
    return this.keys().length
  }

  clear () {
    this._store = {}
  }
}
