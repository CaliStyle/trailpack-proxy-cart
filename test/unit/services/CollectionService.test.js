'use strict'
/* global describe, it */
const assert = require('assert')

describe('CollectionService', () => {
  let CollectionService
  let Collection
  it('should exist', () => {
    assert(global.app.api.services['CollectionService'])
    CollectionService = global.app.services['CollectionService']
    Collection = global.app.services.ProxyEngineService.getModel('Collection')
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
