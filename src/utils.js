export function isPlainObject (value) {
  return typeof value === 'object' && value && Object.prototype.toString(value) === '[object Object]'
}

export function mergeExistingKeys (...obj) {
  let o = Object.assign({}, ...obj)
  return Object.keys(obj[0]).reduce((carry, item) => {
    carry[item] = o[item]
    return carry
  }, {})
}

export const hasKey = (obj, key) => key in (obj || {})

export function removeUndefined (obj) {
  Object.keys(obj).forEach(key => {
    if (obj[key] === undefined) delete obj[key]
  })
  return obj
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
