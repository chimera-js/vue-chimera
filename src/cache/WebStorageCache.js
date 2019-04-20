export default class WebStorageCache {
  constructor (options) {
    if (typeof window !== 'undefined') {
      const store = String(options.store).replace(/[\s-]/g).toLowerCase()
      this.storage = store === 'sessionstorage' ? window.sessionStorage : window.localStorage
    }

    if (!this.storage) throw Error('LocalStorageCache: Local storage is not available.')

    this.defaultExpiration = options.defaultExpiration || 60000
  }

  getObjectStore () {
    const store = this.storage.getItem('_chimera')
    return store ? JSON.parse(store) : {}
  }

  setObjectStore (x) {
    this.storage.setItem('_chimera', JSON.stringify(x))
  }

  clear () {
    this.storage.removeItem('_chimera')
  }

  /**
   *
   * @param key         Key for the cache
   * @param value       Value for cache persistence
   * @param expiration  Expiration time in milliseconds
   */
  setItem (key, value, expiration) {
    const store = this.getObjectStore()
    store[key] = {
      expiration: Date.now() + (expiration || this.defaultExpiration),
      value
    }
    this.setObjectStore(store)
  }

  /**
   * If Cache exists return the Parsed Value, If Not returns {null}
   *
   * @param key
   */
  getItem (key) {
    const store = this.getObjectStore()
    let item = store[key]

    if (item && item.value && Date.now() <= item.expiration) { return item.value }

    this.removeItem(key)
    return null
  }

  removeItem (key) {
    const store = this.getObjectStore()
    delete store[key]
    this.setObjectStore(store)
  }

  keys () {
    return Object.keys(this.getObjectStore())
  }

  length () {
    return this.keys().length
  }
}
