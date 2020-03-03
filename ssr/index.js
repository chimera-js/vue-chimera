const results = {}

exports.addEndpoint = function (r) {
    results[r.key] = r.toObj()
}

exports.getStates = function () {
    return results
}

exports.serializeStates = function () {
    return JSON.stringify(results)
}

exports.exportStates = function (attachTo, globalName) {
    return `${attachTo}.${globalName} = ${serializeStates()};`
}
