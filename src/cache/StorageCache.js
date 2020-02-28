import { MemoryCache } from './MemoryCache'

export class StorageCache extends MemoryCache {
  constructor (key, expiration, sessionStorage = false) {
    super(expiration)
    this.key = key

    const storage = sessionStorage ? 'sessionStorage' : 'localStorage'
    if (typeof window === 'undefined' || !window[storage]) {
      throw Error(`StorageCache: ${storage} is not available.`)
    } else {
      this.storage = window[storage]
    }

    try {
      this._store = JSON.parse(this.storage.getItem(key)) || {}
    } catch (e) {
      this.clearCache()
      this._store = {}
    }
  }

  setItem (key, value, expiration) {
    super.setItem(key, value, expiration)
    this.storage.setItem(this.key, JSON.stringify(this._store))
  }

  clearCache () {
    this.storage.removeItem(this.key)
  }
}
