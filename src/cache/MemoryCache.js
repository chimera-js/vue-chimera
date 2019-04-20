const storage = {}

export default class MemoryCache {
  constructor (options = {}) {
    this.storage = storage
    this.defaultExpiration = options.defaultExpiration || 60000
  }

  clear () {
    this.storage = {}
  }

  setItem (key, value, expiration) {
    this.storage[key] = {
      expiration: Date.now() + (expiration || this.defaultExpiration),
      value
    }
  }

  getItem (key) {
    let item = this.storage[key]

    if (item && item.value && Date.now() <= item.expiration) { return item.value }

    this.removeItem(key)
    return null
  }

  removeItem (key) {
    delete this.storage[key]
  }

  keys () {
    return Object.keys(this.storage)
  }

  length () {
    return this.keys().length
  }
}
