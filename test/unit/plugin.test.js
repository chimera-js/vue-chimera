import VueChimera from '../../dist/vue-chimera.es'
const cjsVueChimera = require('../../dist/vue-chimera.cjs')

import { assert } from 'chai'

describe('test-import', function () {

  it('should be a vue plugin', function () {
    assert.equal(typeof VueChimera.install, 'function')
    assert.equal(typeof cjsVueChimera.install, 'function')
  })

})
