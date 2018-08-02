export function isPlainObject(value) {
    const OBJECT_STRING = '[object Object]'
    return Object.prototype.toString(value) === OBJECT_STRING
}

export function remove (arr, item) {
    if (arr.length) {
        const index = arr.indexOf(item)
        if (index > -1) {
            return arr.splice(index, 1)
        }
    }
}