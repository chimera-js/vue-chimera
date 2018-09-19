import Resource from './Resource'

export default class NullResource extends Resource {
  fetch (force) {
    return Promise.reject(new Error('Null Resource'))
  }

  cancel () {}

  get loading () {
    return false
  }

  get status () {
    return 0
  }

  get data () {
    return null
  }

  get error () {
    return null
  }

  get lastLoaded () {
    return null
  }
}
