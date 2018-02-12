'use strict'
/* global describe, it */
const assert = require('assert')

describe('Product Model', () => {
  let Product, Discount
  it('should exist', () => {
    assert(global.app.api.models['Product'])
    assert(global.app.orm['Product'])
    Product = global.app.orm['Product']
    Discount = global.app.orm['Discount']
    assert(Product)
  })
  it('should resolve a product instance', (done) => {
    Product.resolve(Product.build({}))
      .then(product => {
        assert.ok(product instanceof Product)
        done()
      })
      .catch(err => {
        done(err)
      })
  })
  it('should add normal discounted lines to product', (done) => {
    let product = Product.build({
      id: 1,
      type: 'product',
      price: 1000
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
    product = product.setItemDiscountedLines([discount1, discount2])
    // console.log('BUILT',product.toJSON().discounted_lines)
    // console.log('BUILT',product.toJSON().line_items)
    assert.equal(product.total_discounts, 200)
    assert.equal(product.discounted_lines.length, 2)
    assert.equal(product.discounted_lines[0].price, 100)
    assert.equal(product.discounted_lines[1].price, 100)
    assert.equal(product.price, 1000)
    assert.equal(product.calculated_price, 800)
    done()
  })

  it('should add discounted lines only once to product items', (done) => {
    let product = Product.build({
      id: 1,
      type: 'product',
      price: 1000
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
    product = product.setItemDiscountedLines([discount1])
    // console.log('BUILT',product.toJSON().discounted_lines)
    // console.log('BUILT',product.toJSON().line_items)
    assert.equal(product.total_discounts, 100)
    assert.equal(product.discounted_lines.length, 1)
    assert.equal(product.price, 1000)
    assert.equal(product.calculated_price, 900)
    done()
  })
})
