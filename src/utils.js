import Axios from 'axios'

export function isPlainObject (value) {
  const OBJECT_STRING = '[object Object]'
  return typeof value === 'object' && Object.prototype.toString(value) === OBJECT_STRING
}

export function remove (arr, item) {
  if (arr.length) {
    const index = arr.indexOf(item)
    if (index > -1) {
      return arr.splice(index, 1)
    }
  }
}

export function mergeExistingKeys (...obj) {
  let o = Object.assign(...obj)
  return Object.keys(obj[0]).reduce((carry, item) => {
    carry[item] = o[item]
    return carry
  }, {})
}

export function createAxios (config) {
  if (config instanceof Axios) {
    return config
  }
  // Support nuxt axios
  if (config && typeof config.$request === 'function') {
    return config
  }
  if (isPlainObject(config)) {
    return Axios.create(config)
  }
  if (typeof config === 'function') {
    if (typeof config.request === 'function') return config
    let axios = config()
    if (axios instanceof Axios) return axios
  }
  return Axios
}

export function noop () {}

export function noopReturn (arg) { return arg }
