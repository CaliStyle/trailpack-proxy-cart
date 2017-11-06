'use strict'
/* global describe, it */
const assert = require('assert')

describe('Cart Model', () => {
  let Cart, Discount
  it('should exist', () => {
    assert(global.app.api.models['Cart'])
    assert(global.app.orm['Cart'])
    Cart = global.app.orm['Cart']
    Discount = global.app.orm['Discount']
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
  it('should add normal discounted lines to cart items', (done) => {
    let cart = Cart.build({
      line_items: [{
        product_id: 1,
        type: 'product',
        price: 1000
      }, {
        product_id: 2,
        type: 'product',
        price: 1000
      }]
    })
    const discount1 = Discount.build({
      id: 1,
      handle: 'test-1',
      name: 'test 1',
      description: 'test 1',
      code: 'test_123-1',
      discount_type: 'rate',
      discount_rate: 100,
      discount_scope: 'global',
      status: 'enabled'
    })
    const discount2 = Discount.build({
      id: 2,
      handle: 'test-2',
      name: 'test 2',
      description: 'test 2',
      code: 'test_123-2',
      discount_type: 'rate',
      discount_rate: 100,
      discount_scope: 'global',
      status: 'enabled'
    })
    cart = cart.setItemsDiscountedLines([discount1, discount2])
    assert.equal(cart.total_discounts, 400)
    assert.equal(cart.discounted_lines.length, 2)
    assert.equal(cart.discounted_lines[0].price, 200)
    assert.equal(cart.discounted_lines[1].price, 200)
    assert.equal(cart.line_items.length, 2)
    assert.equal(cart.line_items[0].price, 1000)
    assert.equal(cart.line_items[0].calculated_price, 800)
    assert.equal(cart.line_items[1].price, 1000)
    assert.equal(cart.line_items[1].calculated_price, 800)
    done()
  })

  it('should add discounted lines only once to cart items', (done) => {
    let cart = Cart.build({
      line_items: [{
        product_id: 1,
        type: 'product',
        price: 1000
      }, {
        product_id: 2,
        type: 'product',
        price: 1000
      }]
    })
    const discount1 = Discount.build({
      id: 1,
      handle: 'test-1',
      name: 'test 1',
      description: 'test 1',
      code: 'test_123-1',
      discount_type: 'rate',
      discount_rate: 100,
      discount_scope: 'global',
      applies_once: true,
      status: 'enabled'
    })
    cart = cart.setItemsDiscountedLines([discount1])
    // console.log('BUILT',cart.toJSON().discounted_lines)
    // console.log('BUILT',cart.toJSON().line_items)
    assert.equal(cart.total_discounts, 100)
    assert.equal(cart.discounted_lines.length, 1)
    assert.equal(cart.line_items.length, 2)
    assert.equal(cart.line_items[0].price, 1000)
    assert.equal(cart.line_items[0].calculated_price, 1000)
    assert.equal(cart.line_items[1].price, 1000)
    assert.equal(cart.line_items[1].calculated_price, 900)
    done()
  })
})
