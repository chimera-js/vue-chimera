import { MemoryCache } from './MemoryCache'

export class StorageCache extends MemoryCache {
  constructor (key, expiration, sessionStorage = false) {
    super(expiration)
    this.key = key

    const storage = sessionStorage ? 'sessionStorage' : 'localStorage'
    /* istanbul ignore if */
    if (typeof window === 'undefined' || !window[storage]) {
      throw Error(`StorageCache: ${storage} is not available.`)
    } else {
      this.storage = window[storage]
    }

    try {
      this._store = JSON.parse(this.storage.getItem(key)) || {}
    } catch (e) {
      this.clear()
      this._store = {}
    }
  }

  setItem (key, value, expiration) {
    super.setItem(key, value, expiration)
    this.storage.setItem(this.key, JSON.stringify(this._store))
  }

  clear () {
    this.storage.removeItem(this.key)
  }
}
