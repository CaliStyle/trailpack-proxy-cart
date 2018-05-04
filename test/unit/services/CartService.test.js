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
  it('should not allow a closed cart to checkout', (done) => {
    let resCart
    CartService.create({})
      .then(cart => {
        resCart = cart
        return resCart.close(null, {})
        // return resCart.save()
      })
      .then(updatedCart => {
        return CartService.checkout({
          body: {
            cart: resCart
          }
        })
      })
      .then(() => {
        throw new Error('This should have thrown an error')
      })
      .catch(err => {
        // console.log('BROKE ERR', err)
        assert.equal(err, 'Error: Cart is already closed')
        // done(err)
        done()
      })
  })
})
