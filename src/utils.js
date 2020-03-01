import Axios from 'axios'

export function isPlainObject (value) {
  return typeof value === 'object' && value && Object.prototype.toString(value) === '[object Object]'
}

export const hasKey = (obj, key) => key in (obj || {})

export function createAxios (config) {
  if (config instanceof Axios) {
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

export function getServerContext (contextString) {
  try {
    let context = window
    const keys = contextString.split('.')
    keys.forEach(key => {
      context = context[key]
    })
    return context
  } catch (e) {}
  return null
}

export function noopReturn (arg) { return arg }

export function warn (arg, ...args) {
  // eslint-disable-next-line no-console
  console.warn('[Chimera]: ' + arg, ...args)
}
