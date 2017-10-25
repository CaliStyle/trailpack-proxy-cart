'use strict'
/* global describe, it */
const assert = require('assert')

describe('Discount Model', () => {
  let Discount
  it('should exist', () => {
    assert(global.app.api.models['Discount'])
    Discount = global.app.orm['Discount']
  })
  it('should resolve a discount instance', (done) => {
    Discount.resolve(Discount.build({}))
      .then(discount => {
        assert.ok(discount instanceof Discount)
        done()
      })
      .catch(err => {
        done(err)
      })
  })
})
