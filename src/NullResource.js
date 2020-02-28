import Resource from './Resource'

export default class NullResource extends Resource {
  fetch (force) {
    return Promise.reject(new Error('Null Resource'))
  }

  cancel () {}
}
