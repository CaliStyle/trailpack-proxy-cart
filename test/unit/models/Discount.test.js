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
  it('should discount a line item with rate lower then the price', (done) => {
    const discount = Discount.build({
      id: 1,
      handle: 'test',
      name: 'test',
      description: 'test',
      code: 'test_123',
      discount_type: 'rate',
      discount_rate: 100,
      discount_scope: 'global',
      status: 'enabled'
    })

    const item = discount.discountItem({
      product_id: 1,
      type: 'product',
      price: 1000
    })
    assert.equal(item.price, 1000)
    assert.equal(item.discounted_lines.length, 1)
    assert.equal(item.discounted_lines[0].rate, 100)
    assert.equal(item.discounted_lines[0].price, 100)
    assert.equal(item.discounted_lines[0].type, 'rate')
    done()
  })

  it('should discount a line item with rate higher then the price', (done) => {
    const discount = Discount.build({
      id: 1,
      handle: 'test',
      name: 'test',
      description: 'test',
      code: 'test_123',
      discount_type: 'rate',
      discount_rate: 1000,
      discount_scope: 'global',
      status: 'enabled'
    })

    const item = discount.discountItem({
      product_id: 1,
      type: 'product',
      price: 100
    })
    assert.equal(item.price, 100)
    assert.equal(item.discounted_lines.length, 1)
    assert.equal(item.discounted_lines[0].rate, 1000)
    assert.equal(item.discounted_lines[0].price, 100)
    assert.equal(item.discounted_lines[0].type, 'rate')
    done()
  })

  it('should discount a line item with percentage of price', (done) => {
    const discount = Discount.build({
      id: 1,
      handle: 'test',
      name: 'test',
      description: 'test',
      code: 'test_123',
      discount_type: 'percentage',
      discount_percentage: 10,
      discount_scope: 'global',
      status: 'enabled'
    })

    const item = discount.discountItem({
      product_id: 1,
      type: 'product',
      price: 1000
    })

    assert.equal(item.price, 1000)
    assert.equal(item.discounted_lines.length, 1)
    assert.equal(item.discounted_lines[0].percentage, 10)
    assert.equal(item.discounted_lines[0].price, 100)
    assert.equal(item.discounted_lines[0].type, 'percentage')
    done()
  })

  it('should discount a line item with percentage of price and round', (done) => {
    const discount = Discount.build({
      id: 1,
      handle: 'test',
      name: 'test',
      description: 'test',
      code: 'test_123',
      discount_type: 'percentage',
      discount_percentage: 9.76,
      discount_scope: 'global',
      status: 'enabled'
    })

    const item = discount.discountItem({
      product_id: 1,
      type: 'product',
      price: 1000
    })
    assert.equal(item.price, 1000)
    assert.equal(item.discounted_lines.length, 1)
    assert.equal(item.discounted_lines[0].percentage, 9.76)
    assert.equal(item.discounted_lines[0].price, 98)
    assert.equal(item.discounted_lines[0].type, 'percentage')
    done()
  })


  it('should not discount a line item with matching product exclude', (done) => {
    const discount = Discount.build({
      id: 1,
      handle: 'test',
      name: 'test',
      description: 'test',
      code: 'test_123',
      discount_type: 'rate',
      discount_rate: 1000,
      discount_scope: 'global',
      discount_product_exclude: ['product'],
      status: 'enabled'
    })

    const item = discount.discountItem({
      product_id: 1,
      type: 'product',
      price: 100
    })
    assert.equal(item.price, 100)
    assert.equal(item.discounted_lines.length, 0)
    done()
  })

  it('should not discount a line item with non-matching product include', (done) => {
    const discount = Discount.build({
      id: 1,
      handle: 'test',
      name: 'test',
      description: 'test',
      code: 'test_123',
      discount_type: 'rate',
      discount_rate: 1000,
      discount_scope: 'global',
      discount_product_include: ['variant'],
      status: 'enabled'
    })

    const item = discount.discountItem({
      product_id: 1,
      type: 'product',
      price: 100
    })
    assert.equal(item.price, 100)
    assert.equal(item.discounted_lines.length, 0)
    done()
  })

})
