import { expect, assert } from 'chai'
import axios from 'axios'
import * as utils from '../../src/utils'

describe('test-create-axios', function () {
  it('should return self', function () {
    let newAxios = axios.create()
    assert.equal(utils.createAxios(newAxios), newAxios)
    assert.equal(utils.createAxios(axios), axios)
  })

  it('should return axios object', function () {
    let a = axios.create();
    assert.equal(utils.createAxios(() => {
      return a
    }), a)
  })
})

describe('test-remove-array', function () {
  it('should remove from array', function () {
    let a = [1,2,3,4]
    utils.remove(a, 3)
    utils.remove(a, 10)
    utils.remove([], 1)
    assert.equal(a.length, 3)
  })
})
