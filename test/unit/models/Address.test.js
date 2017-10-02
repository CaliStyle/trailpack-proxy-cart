'use strict'
/* global describe, it */
const assert = require('assert')

describe('Address Model', () => {
  let Address
  it('should exist', () => {
    assert(global.app.api.models['Address'])
    Address = global.app.orm['Address']
    assert(Address)
  })
  it('should resolve a address instance', (done) => {
    Address.resolve(Address.build({}))
      .then(cart => {
        assert.ok(cart instanceof Address.Instance)
        done()
      })
      .catch(err => {
        done(err)
      })
  })
})
