'use strict'
/* global describe, it */
const assert = require('assert')

describe('Fulfillment Model', () => {
  let Fulfillment
  it('should exist', () => {
    assert(global.app.api.models['Fulfillment'])
    Fulfillment = global.app.orm['Fulfillment']
  })
  it('should resolve a fulfillment instance', (done) => {
    Fulfillment.resolve(Fulfillment.build({}))
      .then(fulfillment => {
        assert.ok(fulfillment instanceof Fulfillment)
        done()
      })
      .catch(err => {
        done(err)
      })
  })
})
