'use strict'
/* global describe, it */
const assert = require('assert')

describe('Collection Model', () => {
  let Collection
  it('should exist', () => {
    assert(global.app.api.models['Collection'])
    Collection = global.app.orm['Collection']
  })
  it('should resolve a collection instance', (done) => {
    Collection.resolve(Collection.build({}))
      .then(collection => {
        assert.ok(collection instanceof Collection.Instance)
        done()
      })
      .catch(err => {
        done(err)
      })
  })
})
