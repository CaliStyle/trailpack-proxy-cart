'use strict'
/* global describe, it */
const assert = require('assert')

describe('Cart Model', () => {
  let Cart
  it('should exist', () => {
    assert(global.app.api.services['CartService'])
    Cart = global.app.services.ProxyEngineService.getModel('Cart')
    assert(Cart)
  })
  it('should resolve a cart instance', (done) => {
    Cart.resolve(Cart.build({}))
      .then(cart => {
        assert.ok(cart instanceof Cart)
        done()
      })
      .catch(err => {
        done(err)
      })
  })
})
