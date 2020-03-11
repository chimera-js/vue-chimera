const results = {}

exports.addEndpoint = function (r) {
  results[r.key] = r.response
}

exports.getStates = function () {
  return results
}

exports.serializeStates = function () {
  return JSON.stringify(results)
}

exports.exportStates = function (attachTo, globalName) {
  return `${attachTo}.${globalName} = ${exports.serializeStates()};`
}
