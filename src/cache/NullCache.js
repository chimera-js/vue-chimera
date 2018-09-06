export default class NullCache {
  constructor () {
  }

  setItem (key, value, expiration) {

  }

  getItem (key) {
    return null
  }

  removeItem (key) {
  }

  keys () {
    return []
  }

  all () {
    return {}
  }

  length () {
    return 0
  }

  clearCache () {

  }
}
