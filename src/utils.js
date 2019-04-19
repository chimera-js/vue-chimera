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

export function createAxios (config) {
  if (config && typeof config.request === 'function') {
    return config
  }
  if (isPlainObject(config)) {
    return Axios.create(config)
  }
  if (typeof config === 'function') {
    let axios = config()
    return createAxios(axios)
  }
  return Axios
}
