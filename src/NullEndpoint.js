import Endpoint from './Endpoint'

export default class NullEndpoint extends Endpoint {
  constructor () {
    super({})
  }
  fetch (force) {
    return Promise.reject(new Error('[Chimera]: Fetching null endpoint'))
  }
  cancel () {}
}
