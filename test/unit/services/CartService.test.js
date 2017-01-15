'use strict'
/* global describe, it */
const assert = require('assert')

describe('CartService', () => {
  let CartService
  let Cart
  it('should exist', () => {
    assert(global.app.api.services['CartService'])

    CartService = global.app.services['CartService']
    Cart = global.app.services.ProxyEngineService.getModel('Cart')
  })
  it('should resolve a cart instance', (done) => {
    CartService.resolve(Cart.build({}))
      .then(cart => {
        assert.ok(cart instanceof Cart.Instance)
        done()
      })
      .catch(err => {
        done(err)
      })
  })
})
