export default class NullCache {
  setItem (key, value, expiration) {}

  getItem (key) {
    return null
  }

  removeItem (key) {}

  keys () {
    return []
  }

  all () {
    return {}
  }

  length () {
    return 0
  }

  clearCache () {}
}
