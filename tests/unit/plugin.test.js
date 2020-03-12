import VueChimera, { install } from '../../src/index'

describe('test-import', function () {
  it('should be a vue plugin', function () {
    expect(typeof VueChimera).toBe('function')
    expect(typeof install).toBe('function')

    const plugin = require('../../dist/vue-chimera.umd')
    expect(typeof plugin.install).toBe('function')
  })
})
