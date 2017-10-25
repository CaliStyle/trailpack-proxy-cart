'use strict'
/* global describe, it */
const assert = require('assert')

describe('ProductVariant Model', () => {
  let ProductVariant
  it('should exist', () => {
    ProductVariant = global.app.services.ProxyEngineService.getModel('ProductVariant')
    assert(ProductVariant)
  })
  it('should resolve a ProductVariant instance', (done) => {
    ProductVariant.resolve(ProductVariant.build({}))
      .then(productVariant => {
        assert.ok(productVariant instanceof ProductVariant)
        done()
      })
      .catch(err => {
        done(err)
      })
  })
  it('should be available because of inventory policy but quantity should be reduced', (done) => {
    const variant = ProductVariant.build({
      title: 'Should Restrict',
      inventory_policy: 'restrict',
      inventory_quantity: 1
    })
    variant.checkAvailability(2).then(result => {
      assert.equal(result.title, 'Should Restrict')
      assert.equal(result.allowed, true)
      assert.equal(result.quantity, 1)
      done()
    })
      .catch(err => {
        done(err)
      })
  })
  it('should be available because of inventory policy continue', (done) => {
    const variant = ProductVariant.build({
      title: 'Should Continue',
      inventory_policy: 'continue',
      inventory_quantity: 0
    })
    variant.checkAvailability(1).then(result => {
      assert.equal(result.title, 'Should Continue')
      assert.equal(result.allowed, true)
      assert.equal(result.quantity, 1)
      done()
    })
      .catch(err => {
        done(err)
      })
  })
  it('should not be available because of inventory policy deny', (done) => {
    const variant = ProductVariant.build({
      title: 'Should Deny',
      inventory_policy: 'deny',
      inventory_quantity: 1
    })
    variant.checkAvailability(2).then(result => {
      assert.equal(result.title, 'Should Deny')
      assert.equal(result.allowed, false)
      assert.equal(result.quantity, 1)
      done()
    })
      .catch(err => {
        done(err)
      })
  })
})
