import { assert, expect } from 'chai'
import NullResource from '../../src/NullResource'

describe('Null Resource', function () {

  let resource
  beforeEach(function () {
    resource = new NullResource()
  })

  it('should be rejected', async function () {
    resource.cancel()
    expect(resource.fetch()).to.eventually.be.rejectedWith()
  })

  it('should be falsy on all fields', function () {
    const obj = {
      loading: false,
      status: 0,
      data: null,
      headers: null,
      error: null,
      lastLoaded: null,
      ssrPrefetched: false
    }
    Object.keys(obj).forEach(key => {
      assert.equal(obj[key], resource[key])
    })
  })
})
