import VueChimera from '../../src/index'

describe('test-import', function () {

  it('should be a vue plugin', function () {
    expect(typeof VueChimera.install).toBe('function')
  })

})
